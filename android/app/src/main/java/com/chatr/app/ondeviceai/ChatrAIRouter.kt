package com.chatr.app.ondeviceai

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.io.File

class ChatrAIRouter(private val context: Context) {
    companion object {
        private const val TAG = "ChatrAIRouter"
        const val GGUF_MODEL_FILENAME = "chatr-local-0.5b-v1.gguf"
        const val GEMMA_MODEL_FILENAME = "gemma3-1b-it-int4-v1.task"
    }

    private val nanoAvailable by lazy { runBlocking { checkNanoAvailability() } }

    private var _llamaEngine: LlamaCppEngine? = null
    private val llamaEngine: LlamaCppEngine?
        get() {
            if (_llamaEngine == null) {
                if (!MemoryGate.isRamSufficient(context)) return null

                val modelsDir = File(context.filesDir, "models")
                val ggufFile = File(modelsDir, GGUF_MODEL_FILENAME)
                if (ggufFile.exists() && ggufFile.canRead()) {
                    _llamaEngine = LlamaCppEngine.create(context, ggufFile)
                }
            }
            return _llamaEngine
        }

    private var _gemma: OnDeviceGemma? = null
    private val gemma: OnDeviceGemma?
        get() {
            if (_gemma == null) {
                if (!MemoryGate.isRamSufficient(context)) return null

                val modelFile = File(context.filesDir, "llm/$GEMMA_MODEL_FILENAME")
                if (!modelFile.exists()) return null

                try {
                    _gemma = OnDeviceGemma(context, modelFile.absolutePath)
                } catch (e: Exception) {
                    Log.w(TAG, "Gemma initialization failed", e)
                }
            }
            return _gemma
        }

    suspend fun checkNanoAvailability(): Boolean {
        return false
    }

    fun isLocalModelInstalled(): Boolean {
        val ggufFile = File(File(context.filesDir, "models"), GGUF_MODEL_FILENAME)
        if (ggufFile.exists() && ggufFile.length() > 100_000_000) return true

        val gemmaFile = File(File(context.filesDir, "llm"), GEMMA_MODEL_FILENAME)
        return gemmaFile.exists() && gemmaFile.length() > 100_000_000
    }

    fun getInstalledModelPath(): String? {
        val ggufFile = File(File(context.filesDir, "models"), GGUF_MODEL_FILENAME)
        if (ggufFile.exists()) return ggufFile.absolutePath

        val gemmaFile = File(File(context.filesDir, "llm"), GEMMA_MODEL_FILENAME)
        if (gemmaFile.exists()) return gemmaFile.absolutePath

        return null
    }

    suspend fun generateResponse(
        prompt: String,
        systemPrompt: String? = null,
        maxTokens: Int = 512,
        temperature: Float = 0.7f
    ): AIResult = withContext(Dispatchers.IO) {
        // Strict Stability Gating
        if (!StabilityGateConfig.isCallingStable) {
            return@withContext AIResult.GateBlocked
        }

        // Tier 1: rule-based for short heuristic text
        if (prompt.length < 50 && isSimpleCommand(prompt)) {
            return@withContext AIResult.Success(ruleBasedSummary(prompt), "Tier 1: Heuristic")
        }

        // Tier 2a: llama.cpp Native GGUF (Primary Target: Qwen2.5-0.5B-Instruct)
        val llama = llamaEngine
        if (llama != null) {
            try {
                val fullPrompt = if (systemPrompt != null) {
                    "<|im_start|>system\n$systemPrompt<|im_end|>\n<|im_start|>user\n$prompt<|im_end|>\n<|im_start|>assistant\n"
                } else {
                    prompt
                }
                val result = llama.generate(fullPrompt, maxTokens, temperature)
                return@withContext AIResult.Success(result, "Tier 2a: llama.cpp Native GGUF")
            } catch (e: Exception) {
                Log.w(TAG, "llama.cpp generation failed, trying fallback", e)
            }
        }

        // Tier 2b: MediaPipe Gemma (Fallback)
        val gemmaInstance = gemma
        if (gemmaInstance != null) {
            try {
                val result = gemmaInstance.generate(prompt)
                return@withContext AIResult.Success(result, "Tier 2b: MediaPipe Gemma")
            } catch (e: Exception) {
                Log.w(TAG, "Gemma generation failed", e)
            }
        }

        // Tier 2c: ML Kit Gemini Nano if device supports it
        if (nanoAvailable) {
            try {
                val result = callMlKitSummarizer(prompt)
                return@withContext AIResult.Success(result, "Tier 2c: ML Kit Gemini Nano")
            } catch (e: Exception) {
                // fall through
            }
        }

        // Tier 1: Fallback (Heuristic rules)
        AIResult.Success(ruleBasedSummary(prompt), "Tier 1: Fallback (Heuristic Rules)")
    }

    suspend fun summarize(text: String): AIResult {
        return generateResponse(
            prompt = "Summarize this: $text",
            systemPrompt = "You are a concise summarizer. Provide a factual summary in under 100 words.",
            maxTokens = 256
        )
    }

    fun unloadModels() {
        LlamaCppEngine.unloadActiveInstance()
        _llamaEngine?.close()
        _llamaEngine = null
        _gemma?.close()
        _gemma = null
    }

    private fun isSimpleCommand(text: String): Boolean {
        val lower = text.lowercase().trim()
        return lower.startsWith("hi") || lower.startsWith("hello") || lower == "ping" || lower == "status"
    }

    private fun ruleBasedSummary(text: String): String {
        return if (text.length > 80) text.take(80) + "..." else text
    }

    private suspend fun callMlKitSummarizer(text: String): String {
        return ruleBasedSummary(text)
    }
}
