package com.chatr.app.plugins

import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.chatr.app.ondeviceai.AIResult
import com.chatr.app.ondeviceai.ChatrAIRouter
import com.chatr.app.ondeviceai.ModelDownloadWorker
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

@CapacitorPlugin(name = "OnDeviceAi")
class OnDeviceAiPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val router by lazy {
        ChatrAIRouter(context.applicationContext)
    }

    companion object {
        const val DOWNLOAD_WORK_NAME = "CHATR_GGUF_DOWNLOAD"
    }

    @PluginMethod
    fun checkAvailability(call: PluginCall) {
        scope.launch {
            try {
                val isInstalled = router.isLocalModelInstalled()
                val modelPath = router.getInstalledModelPath()
                val aicoreBridge = com.chatr.app.ondeviceai.AICoreBridge(context.applicationContext)
                val aicoreAvailable = aicoreBridge.isAvailable()

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("available", isInstalled || aicoreAvailable)
                        put("status", if (isInstalled || aicoreAvailable) "ready" else "not_installed")
                        put("model", if (aicoreAvailable) "System AICore (Gemini Nano)" else (modelPath ?: "none"))
                        put("provider", if (aicoreAvailable) "ANDROID_AICORE" else "NATIVE_LLAMA_CPP")
                        put("geminiOnDevice", aicoreAvailable)
                        put("aicoreAvailable", aicoreAvailable)
                        put("geminiNanoAvailable", aicoreAvailable)
                        put("nativeLlamaInstalled", isInstalled)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Availability check failed")
                }
            }
        }
    }

    @PluginMethod
    fun generate(call: PluginCall) {
        val prompt = call.getString("prompt", "").orEmpty()
        val systemPrompt = call.getString("systemPrompt", null)
        val maxTokens = call.getInt("maxOutputTokens", 512) ?: 512
        val temperature = call.getFloat("temperature", 0.7f) ?: 0.7f

        if (prompt.isBlank()) {
            call.reject("prompt_required")
            return
        }

        scope.launch {
            try {
                val result = router.generateResponse(prompt, systemPrompt, maxTokens, temperature)
                withContext(Dispatchers.Main) {
                    when (result) {
                        is AIResult.Success -> {
                            call.resolve(JSObject().apply {
                                put("text", result.text)
                                put("tier", result.tier)
                                put("geminiOnDevice", true)
                                put("gateBlocked", false)
                            })
                        }
                        is AIResult.GateBlocked -> {
                            call.resolve(JSObject().apply {
                                put("gateBlocked", true)
                                put("text", "")
                            })
                        }
                        is AIResult.Error -> {
                            call.reject(result.exception.message ?: "Generation failed")
                        }
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Generation failed")
                }
            }
        }
    }

    @PluginMethod
    fun getModelStatus(call: PluginCall) {
        scope.launch {
            try {
                val ggufFile = File(File(context.filesDir, "models"), ChatrAIRouter.GGUF_MODEL_FILENAME)
                val tmpFile = File(File(context.filesDir, "models"), "${ChatrAIRouter.GGUF_MODEL_FILENAME}.tmp")
                val isInstalled = ggufFile.exists() && ggufFile.length() > 100_000_000

                val workManager = WorkManager.getInstance(context)
                val workInfos = workManager.getWorkInfosForUniqueWork(DOWNLOAD_WORK_NAME).get()
                val activeWork = workInfos.firstOrNull { !it.state.isFinished }

                val isDownloading = activeWork != null
                var progressPercent = 0
                var downloadedBytes = 0L

                if (isDownloading) {
                    val progressData = activeWork?.progress
                    progressPercent = progressData?.getInt("progress", 0) ?: 0
                    downloadedBytes = progressData?.getLong("downloaded", 0L) ?: tmpFile.length()
                } else if (isInstalled) {
                    progressPercent = 100
                    downloadedBytes = ggufFile.length()
                }

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("modelId", "CHATR-Local-0.5B-v1")
                        put("isInstalled", isInstalled)
                        put("isDownloading", isDownloading)
                        put("progressPercent", progressPercent)
                        put("downloadedBytes", downloadedBytes)
                        put("totalBytes", 491_520_000L)
                        put("localPath", if (isInstalled) ggufFile.absolutePath else null)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Failed to retrieve model status")
                }
            }
        }
    }

    @PluginMethod
    fun startModelDownload(call: PluginCall) {
        val url = call.getString("url", ModelDownloadWorker.DEFAULT_MODEL_URL)
        val expectedSha = call.getString("expectedSha256", ModelDownloadWorker.DEFAULT_EXPECTED_SHA256)

        scope.launch {
            try {
                val workData = Data.Builder()
                    .putString(ModelDownloadWorker.KEY_MODEL_URL, url)
                    .putString(ModelDownloadWorker.KEY_EXPECTED_SHA256, expectedSha)
                    .putString(ModelDownloadWorker.KEY_FILENAME, ChatrAIRouter.GGUF_MODEL_FILENAME)
                    .putString(ModelDownloadWorker.KEY_TARGET_DIR, "models")
                    .build()

                val request = OneTimeWorkRequestBuilder<ModelDownloadWorker>()
                    .setInputData(workData)
                    .addTag("MODEL_DOWNLOAD")
                    .build()

                WorkManager.getInstance(context).enqueueUniqueWork(
                    DOWNLOAD_WORK_NAME,
                    ExistingWorkPolicy.KEEP,
                    request
                )

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("started", true)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Failed to start model download")
                }
            }
        }
    }

    @PluginMethod
    fun cancelModelDownload(call: PluginCall) {
        scope.launch {
            try {
                WorkManager.getInstance(context).cancelUniqueWork(DOWNLOAD_WORK_NAME)
                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("cancelled", true)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Failed to cancel model download")
                }
            }
        }
    }

    @PluginMethod
    fun deleteModel(call: PluginCall) {
        scope.launch {
            try {
                router.unloadModels()
                val modelsDir = File(context.filesDir, "models")
                val ggufFile = File(modelsDir, ChatrAIRouter.GGUF_MODEL_FILENAME)
                val tmpFile = File(modelsDir, "${ChatrAIRouter.GGUF_MODEL_FILENAME}.tmp")

                if (ggufFile.exists()) ggufFile.delete()
                if (tmpFile.exists()) tmpFile.delete()

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("deleted", true)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Failed to delete model")
                }
            }
        }
    }

    @PluginMethod
    fun loadModel(call: PluginCall) {
        scope.launch {
            try {
                val installed = router.isLocalModelInstalled()
                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("success", installed)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Failed to load model")
                }
            }
        }
    }

    @PluginMethod
    fun unloadModel(call: PluginCall) {
        scope.launch {
            try {
                router.unloadModels()
                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("success", true)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Failed to unload model")
                }
            }
        }
    }

    @PluginMethod
    fun runPhysicalFlightA(call: PluginCall) {
        scope.launch {
            try {
                val harness = com.chatr.app.ondeviceai.Phase5InferenceTestHarness(context.applicationContext)
                val env = harness.captureDeviceEnvironment()
                val nativeLib = harness.testNativeLibraryLoad()
                val artifact = harness.verifyModelArtifact()

                var modelLoadPassed = false
                var modelLoadMs = 0L
                var modelLoadDetail = "Model load not attempted (artifact missing or native lib not loaded)"
                var tokensPerSec = 0f
                var generatedText = ""
                var tokenCount = 0
                var generationMs = 0L
                var fallbackInvoked = false

                if (nativeLib.passed && artifact.passed) {
                    val ggufFile = java.io.File(java.io.File(context.filesDir, "models"), com.chatr.app.ondeviceai.ChatrAIRouter.GGUF_MODEL_FILENAME)
                    val startLoad = android.os.SystemClock.elapsedRealtime()
                    val engine = com.chatr.app.ondeviceai.LlamaCppEngine.create(context.applicationContext, ggufFile)
                    modelLoadMs = android.os.SystemClock.elapsedRealtime() - startLoad

                    if (engine != null) {
                        modelLoadPassed = true
                        modelLoadDetail = "Model loaded successfully into RAM in ${modelLoadMs}ms."

                        val testPrompt = "<|im_start|>system\nYou are CHATR, a personal SI assistant.<|im_end|>\n<|im_start|>user\nHello, introduce yourself as CHATR in one sentence.<|im_end|>\n<|im_start|>assistant\n"
                        val startGen = android.os.SystemClock.elapsedRealtime()
                        try {
                            generatedText = engine.generate(testPrompt, maxTokens = 120, temperature = 0.7f)
                            generationMs = android.os.SystemClock.elapsedRealtime() - startGen
                            tokenCount = generatedText.length / 4
                            tokensPerSec = if (generationMs > 0) (tokenCount * 1000f) / generationMs else 0f
                            fallbackInvoked = generatedText.contains(com.chatr.app.ondeviceai.Phase5InferenceTestHarness.FALLBACK_SENTINEL)
                        } catch (e: Exception) {
                            generatedText = "ERROR: ${e.message}"
                            fallbackInvoked = true
                        } finally {
                            engine.close()
                        }
                    } else {
                        modelLoadDetail = "Engine initialization returned null."
                    }
                }

                val allPassed = nativeLib.passed && artifact.passed && modelLoadPassed && !fallbackInvoked && tokenCount > 0

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().apply {
                        put("device_model", env["device_model"] ?: "unknown")
                        put("primary_abi", env["primary_abi"] ?: "unknown")
                        put("total_ram_mb", env["total_ram_mb"] ?: "0")
                        put("available_ram_mb", env["available_ram_mb"] ?: "0")
                        put("native_lib_loaded", nativeLib.passed)
                        put("native_detail", nativeLib.detail)
                        put("model_verified", artifact.passed)
                        put("model_detail", artifact.detail)
                        put("model_loaded", modelLoadPassed)
                        put("model_load_ms", modelLoadMs)
                        put("model_load_detail", modelLoadDetail)
                        put("generation_ms", generationMs)
                        put("tokens_approx", tokenCount)
                        put("tokens_per_sec", tokensPerSec)
                        put("generated_text", generatedText)
                        put("fallback_invoked", fallbackInvoked)
                        put("cloud_egress", false)
                        put("provider", "NATIVE_LLAMA_CPP")
                        put("verdict", if (allPassed) "PASS" else "FAIL")
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message ?: "Flight A test failed: ${e.localizedMessage}")
                }
            }
        }
    }

    override fun handleOnDestroy() {
        scope.cancel()
        router.unloadModels()
        super.handleOnDestroy()
    }
}
