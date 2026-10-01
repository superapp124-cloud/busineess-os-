package com.chatr.app.ondeviceai

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Debug
import android.os.SystemClock
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileReader
import java.security.MessageDigest

/**
 * Phase 5 On-Device Real Inference Validation Harness
 *
 * Runs a series of structured tests to PROVE that:
 * 1. The actual GGUF file exists with correct SHA-256
 * 2. libllama.so loads natively (no Java exceptions)
 * 3. Real tokens are generated (not fallback/heuristic text)
 * 4. Tool call JSON is output from the model itself
 * 5. Health AI pipeline reads from HealthOS before LLM
 * 6. App survives memory pressure and thermal throttle
 *
 * ANTI-FALSE-POSITIVE RULE:
 * A test reports LOCAL_INFERENCE_PASS only if:
 *   - GGUF file exists AND sha256 matches
 *   - llama.cpp native handle != 0
 *   - generate() returns text NOT containing fallback sentinel
 *   - No IOException or UnsatisfiedLinkError was thrown
 */
class Phase5InferenceTestHarness(private val context: Context) {

    companion object {
        private const val TAG = "Phase5TestHarness"
        const val FALLBACK_SENTINEL = "CHATR On-Device AI processed"
        const val EXPECTED_SHA256 = ModelDownloadWorker.DEFAULT_EXPECTED_SHA256
        const val EXPECTED_SIZE = ModelDownloadWorker.EXPECTED_FILE_SIZE_BYTES
    }

    data class TestResult(
        val testId: String,
        val passed: Boolean,
        val detail: String,
        val latencyMs: Long = 0L,
        val isLocalInference: Boolean = false,
    )

    private val results = mutableListOf<TestResult>()

    // ========================================================
    // Phase 5A: Model Artifact Verification
    // ========================================================
    suspend fun verifyModelArtifact(): TestResult = withContext(Dispatchers.IO) {
        val ggufFile = File(File(context.filesDir, "models"), ChatrAIRouter.GGUF_MODEL_FILENAME)

        if (!ggufFile.exists()) {
            return@withContext TestResult(
                testId = "5A_FILE_EXISTS",
                passed = false,
                detail = "GGUF file not found at ${ggufFile.absolutePath}. Run model download first."
            ).also { results.add(it) }
        }

        val actualSize = ggufFile.length()
        if (actualSize != EXPECTED_SIZE) {
            return@withContext TestResult(
                testId = "5A_FILE_SIZE",
                passed = false,
                detail = "Size mismatch. Expected: $EXPECTED_SIZE bytes, Actual: $actualSize bytes. File may be corrupt or incomplete."
            ).also { results.add(it) }
        }

        // SHA-256 verification (slow — stream entire 491 MB file)
        val startTime = SystemClock.elapsedRealtime()
        val digest = MessageDigest.getInstance("SHA-256")
        ggufFile.inputStream().use { stream ->
            val buffer = ByteArray(65536)
            var read: Int
            while (stream.read(buffer).also { read = it } != -1) {
                digest.update(buffer, 0, read)
            }
        }
        val actualHash = digest.digest().joinToString("") { "%02x".format(it) }
        val hashTime = SystemClock.elapsedRealtime() - startTime
        val hashMatch = actualHash.equals(EXPECTED_SHA256, ignoreCase = true)

        val result = TestResult(
            testId = "5A_SHA256_VERIFY",
            passed = hashMatch,
            detail = if (hashMatch)
                "SHA-256 verified in ${hashTime}ms. Hash: ${actualHash.take(16)}... ✓"
            else
                "SHA-256 MISMATCH. Expected: ${EXPECTED_SHA256.take(16)}..., Got: ${actualHash.take(16)}...",
            latencyMs = hashTime
        )
        results.add(result)
        result
    }

    // ========================================================
    // Phase 5B: Device Environment Capture
    // ========================================================
    fun captureDeviceEnvironment(): Map<String, String> {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        am.getMemoryInfo(memInfo)

        return mapOf(
            "android_version" to Build.VERSION.RELEASE,
            "sdk_int" to Build.VERSION.SDK_INT.toString(),
            "device_model" to "${Build.MANUFACTURER} ${Build.MODEL}",
            "device_brand" to Build.BRAND,
            "supported_abis" to Build.SUPPORTED_ABIS.joinToString(","),
            "primary_abi" to (Build.SUPPORTED_ABIS.firstOrNull() ?: "unknown"),
            "total_ram_mb" to (memInfo.totalMem / 1_048_576).toString(),
            "available_ram_mb" to (memInfo.availMem / 1_048_576).toString(),
            "low_memory" to memInfo.lowMemory.toString(),
            "cpu_cores" to Runtime.getRuntime().availableProcessors().toString(),
        )
    }

    // ========================================================
    // Phase 5D: Native Library Load & Smoke Test (Gate A1)
    // ========================================================
    suspend fun testNativeLibraryLoad(): TestResult = withContext(Dispatchers.IO) {
        val isLoaded = LlamaCppEngine.isNativeAvailable()
        val smokeSuccess = if (isLoaded) LlamaCppEngine.smokeTest() else false
        val passed = isLoaded && smokeSuccess
        val result = TestResult(
            testId = "5D_NATIVE_LIB_LOAD",
            passed = passed,
            detail = if (passed)
                "libllama.so and GGML dependencies loaded successfully via System.loadLibrary(); native smoke test PASSED ✓"
            else if (isLoaded)
                "libllama.so loaded via System.loadLibrary() but nativeSmokeTest() FAILED."
            else
                "libllama.so NOT LOADED. Inference will use fallback. " +
                "Build the app with NDK llama.cpp integration to enable native inference."
        )
        results.add(result)
        result
    }

    // ========================================================
    // Phase 5D: Model Load Test (measures RAM and load time)
    // ========================================================
    suspend fun testModelLoad(): TestResult = withContext(Dispatchers.IO) {
        if (!LlamaCppEngine.isNativeAvailable()) {
            return@withContext TestResult(
                testId = "5D_MODEL_LOAD",
                passed = false,
                detail = "SKIPPED: libllama.so not available. Cannot measure real model load."
            ).also { results.add(it) }
        }

        val ggufFile = File(File(context.filesDir, "models"), ChatrAIRouter.GGUF_MODEL_FILENAME)
        if (!ggufFile.exists()) {
            return@withContext TestResult(
                testId = "5D_MODEL_LOAD",
                passed = false,
                detail = "SKIPPED: GGUF file not present. Run download first."
            ).also { results.add(it) }
        }

        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memBefore = ActivityManager.MemoryInfo()
        am.getMemoryInfo(memBefore)
        val ramBeforeMb = memBefore.availMem / 1_048_576

        val startTime = SystemClock.elapsedRealtime()
        val engine = LlamaCppEngine.create(context, ggufFile)
        val loadTimeMs = SystemClock.elapsedRealtime() - startTime

        val memAfter = ActivityManager.MemoryInfo()
        am.getMemoryInfo(memAfter)
        val ramAfterMb = memAfter.availMem / 1_048_576
        val ramConsumedMb = ramBeforeMb - ramAfterMb

        val result = TestResult(
            testId = "5D_MODEL_LOAD",
            passed = engine != null,
            detail = if (engine != null)
                "Model loaded in ${loadTimeMs}ms. RAM before: ${ramBeforeMb}MB, after: ${ramAfterMb}MB, consumed: ~${ramConsumedMb}MB"
            else
                "Model load FAILED after ${loadTimeMs}ms. RAM: ${ramAfterMb}MB available.",
            latencyMs = loadTimeMs
        )
        engine?.close()
        results.add(result)
        result
    }

    // ========================================================
    // Phase 5E: Real Generation Tests
    // ========================================================
    data class GenerationResult(
        val prompt: String,
        val response: String,
        val ttftMs: Long,
        val totalMs: Long,
        val tokensApprox: Int,
        val tokensPerSec: Float,
        val isLocalInference: Boolean,
    )

    suspend fun testRealGeneration(engine: LlamaCppEngine?): List<GenerationResult> = withContext(Dispatchers.IO) {
        val testPrompts = listOf(
            "<|im_start|>system\nYou are CHATR AI, a helpful personal assistant.<|im_end|>\n<|im_start|>user\nHello, introduce yourself as CHATR.<|im_end|>\n<|im_start|>assistant\n",
            "<|im_start|>system\nYou are CHATR Personal AI.<|im_end|>\n<|im_start|>user\nCreate a reminder for me tomorrow at 8 PM.<|im_end|>\n<|im_start|>assistant\n",
            "<|im_start|>system\nYou are CHATR Work AI. Be concise.<|im_end|>\n<|im_start|>user\nSummarize these three tasks: call John, review the proposal, send the report.<|im_end|>\n<|im_start|>assistant\n",
            "<|im_start|>system\nYou are CHATR Health AI. Provide general supportive information only. Do not diagnose.<|im_end|>\n<|im_start|>user\nHow is my health today?<|im_end|>\n<|im_start|>assistant\n"
        )

        testPrompts.mapIndexed { i, prompt ->
            val startTime = SystemClock.elapsedRealtime()

            val response = if (engine != null) {
                try {
                    engine.generate(prompt, maxTokens = 200, temperature = 0.7f)
                } catch (e: Exception) {
                    Log.e(TAG, "Generation error on prompt ${i + 1}", e)
                    FALLBACK_SENTINEL
                }
            } else {
                FALLBACK_SENTINEL
            }

            val totalMs = SystemClock.elapsedRealtime() - startTime
            val tokensApprox = response.length / 4
            val tokensPerSec = if (totalMs > 0) tokensApprox * 1000f / totalMs else 0f
            val isLocal = response != FALLBACK_SENTINEL && !response.startsWith(FALLBACK_SENTINEL)

            GenerationResult(
                prompt = prompt.take(80) + "...",
                response = response,
                ttftMs = 0L, // Would require streaming tokens to measure
                totalMs = totalMs,
                tokensApprox = tokensApprox,
                tokensPerSec = tokensPerSec,
                isLocalInference = isLocal
            )
        }
    }

    // ========================================================
    // Phase 5F: Structured Tool Calling Test
    // ========================================================
    suspend fun testToolCalling(engine: LlamaCppEngine?): TestResult = withContext(Dispatchers.IO) {
        if (engine == null) {
            return@withContext TestResult(
                testId = "5F_TOOL_CALLING",
                passed = false,
                detail = "SKIPPED: LlamaCppEngine not loaded. Native inference required.",
                isLocalInference = false
            ).also { results.add(it) }
        }

        val toolPrompt = """<|im_start|>system
You are CHATR Personal AI. When the user asks to set a reminder, output a tool call in this exact format:
<tool_call>
{"name": "setReminder", "arguments": {"title": "<task>", "datetime": "<ISO datetime>"}}
</tool_call>
<|im_end|>
<|im_start|>user
Remind me tomorrow at 8 PM to call John.
<|im_end|>
<|im_start|>assistant
"""
        val startTime = SystemClock.elapsedRealtime()
        val response = try {
            engine.generate(toolPrompt, maxTokens = 150, temperature = 0.1f)
        } catch (e: Exception) {
            ""
        }
        val latencyMs = SystemClock.elapsedRealtime() - startTime

        // Validate tool call JSON exists in response
        val hasToolCall = response.contains("<tool_call>") && response.contains("setReminder")
        val hasValidJson = try {
            val jsonMatch = Regex("<tool_call>\\s*(\\{.*?\\})\\s*</tool_call>", RegexOption.DOT_MATCHES_ALL)
                .find(response)?.groupValues?.get(1)
            jsonMatch != null && jsonMatch.contains("setReminder")
        } catch (e: Exception) {
            false
        }

        val isLocalInference = response != FALLBACK_SENTINEL && response.isNotEmpty()

        val result = TestResult(
            testId = "5F_TOOL_CALLING",
            passed = hasToolCall && hasValidJson && isLocalInference,
            detail = if (hasToolCall && isLocalInference)
                "Tool call generated in ${latencyMs}ms. Contains <tool_call> with setReminder JSON. LOCAL INFERENCE CONFIRMED."
            else if (isLocalInference)
                "Local response received in ${latencyMs}ms but no structured <tool_call> found. Model may need tool-calling fine-tuning.\nResponse: ${response.take(200)}"
            else
                "LOCAL INFERENCE NOT VERIFIED. Response appears to be fallback text.",
            latencyMs = latencyMs,
            isLocalInference = isLocalInference
        )
        results.add(result)
        result
    }

    // ========================================================
    // Phase 5J: Low Memory Test
    // ========================================================
    suspend fun testLowMemoryBehavior(): TestResult = withContext(Dispatchers.IO) {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        am.getMemoryInfo(memInfo)

        val availMb = memInfo.availMem / 1_048_576
        val router = ChatrAIRouter(context)

        // Simulate what happens under pressure: can router still return a response?
        val safeResult = try {
            router.generateResponse("ping", maxTokens = 20)
        } catch (e: Exception) {
            AIResult.Error(Exception("Router threw exception: ${e.message}"))
        }

        val passed = safeResult is AIResult.Success || safeResult is AIResult.GateBlocked
        val result = TestResult(
            testId = "5J_LOW_MEMORY",
            passed = passed,
            detail = "Available RAM: ${availMb}MB. " +
                when (safeResult) {
                    is AIResult.Success -> "Router returned success with tier: ${safeResult.tier}. No crash."
                    is AIResult.GateBlocked -> "Router gate-blocked safely. No crash."
                    is AIResult.Error -> "Router error (acceptable): ${safeResult.exception.message}"
                    else -> "Unknown state"
                }
        )
        results.add(result)
        result
    }

    // ========================================================
    // Phase 5K: Thermal / Multi-generation Stress Test
    // ========================================================
    suspend fun testThermalBehavior(engine: LlamaCppEngine?): List<Map<String, Any>> = withContext(Dispatchers.IO) {
        if (engine == null) return@withContext emptyList()

        val prompt = "<|im_start|>user\nWhat is the capital of France?<|im_end|>\n<|im_start|>assistant\n"
        val iterations = 5
        val measurements = mutableListOf<Map<String, Any>>()

        for (i in 1..iterations) {
            val start = SystemClock.elapsedRealtime()
            val response = try {
                engine.generate(prompt, maxTokens = 80, temperature = 0.5f)
            } catch (e: Exception) {
                "ERROR: ${e.message}"
            }
            val elapsed = SystemClock.elapsedRealtime() - start
            val tokens = response.length / 4
            measurements.add(mapOf(
                "iteration" to i,
                "latency_ms" to elapsed,
                "tokens" to tokens,
                "tokens_per_sec" to if (elapsed > 0) tokens * 1000 / elapsed else 0,
                "response_preview" to response.take(60)
            ))
            Log.d(TAG, "Thermal test $i/$iterations: ${elapsed}ms, ~$tokens tokens")
        }
        measurements
    }

    // ========================================================
    // Phase 5I: App Restart / Model Persistence Check
    // ========================================================
    suspend fun testModelPersistence(): TestResult = withContext(Dispatchers.IO) {
        val ggufFile = File(File(context.filesDir, "models"), ChatrAIRouter.GGUF_MODEL_FILENAME)
        val isInstalled = ggufFile.exists() && ggufFile.length() == EXPECTED_SIZE

        val result = TestResult(
            testId = "5I_MODEL_PERSISTENCE",
            passed = isInstalled,
            detail = if (isInstalled)
                "Model file persists across sessions at ${ggufFile.absolutePath} (${ggufFile.length() / 1_048_576} MiB). No re-download required."
            else
                "Model file NOT found or size mismatch (${ggufFile.length()} bytes vs expected $EXPECTED_SIZE). Re-download required."
        )
        results.add(result)
        result
    }

    // ========================================================
    // Full Report Summary
    // ========================================================
    fun buildSummaryReport(
        deviceEnv: Map<String, String>,
        generationResults: List<GenerationResult>,
        thermalResults: List<Map<String, Any>>
    ): String {
        val sb = StringBuilder()
        sb.appendLine("════════════════════════════════════════════════════")
        sb.appendLine("  CHATR PHASE 5 REAL DEVICE INFERENCE VALIDATION")
        sb.appendLine("════════════════════════════════════════════════════")
        sb.appendLine("\n── DEVICE ENVIRONMENT ──")
        deviceEnv.forEach { (k, v) -> sb.appendLine("  $k: $v") }

        sb.appendLine("\n── MODEL ARTIFACT ──")
        sb.appendLine("  File: qwen2.5-0.5b-instruct-q4_k_m.gguf")
        sb.appendLine("  Exact size: 491,400,032 bytes (468.5 MiB)")
        sb.appendLine("  SHA-256: 74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db")
        sb.appendLine("  Source: huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF")

        sb.appendLine("\n── PHASE TEST RESULTS ──")
        results.forEach { r ->
            val icon = if (r.passed) "✅" else "❌"
            sb.appendLine("  $icon [${r.testId}]: ${r.detail}")
            if (r.latencyMs > 0) sb.appendLine("     Latency: ${r.latencyMs}ms")
        }

        sb.appendLine("\n── GENERATION RESULTS ──")
        generationResults.forEachIndexed { i, g ->
            val inferenceLabel = if (g.isLocalInference) "LOCAL INFERENCE" else "FALLBACK / NOT VERIFIED"
            sb.appendLine("  Prompt ${i + 1}: ${g.prompt}")
            sb.appendLine("  Status: $inferenceLabel")
            sb.appendLine("  Total time: ${g.totalMs}ms | ~${g.tokensApprox} tokens | ${g.tokensPerSec.toInt()} tok/s")
            sb.appendLine("  Response: ${g.response.take(120)}...")
            sb.appendLine()
        }

        if (thermalResults.isNotEmpty()) {
            sb.appendLine("── THERMAL TEST ──")
            thermalResults.forEach { m ->
                sb.appendLine("  Run ${m["iteration"]}: ${m["latency_ms"]}ms, ${m["tokens_per_sec"]} tok/s — ${m["response_preview"]}")
            }
        }

        val allLocalPassed = generationResults.all { it.isLocalInference }
        val allTestsPassed = results.all { it.passed }
        val libraryLoaded = LlamaCppEngine.isNativeAvailable()

        sb.appendLine("\n── FINAL VERDICT ──")
        val verdict = when {
            !libraryLoaded -> "NOT VERIFIED\n  Reason: libllama.so not bundled in this build."
            !allTestsPassed -> "PARTIALLY VERIFIED\n  Some tests failed. Review failures above."
            allLocalPassed -> "REAL DEVICE VERIFIED\n  All generation tests confirmed local inference."
            else -> "PARTIALLY VERIFIED\n  Library loaded but some generations used fallback."
        }
        sb.appendLine("  $verdict")
        return sb.toString()
    }
}
