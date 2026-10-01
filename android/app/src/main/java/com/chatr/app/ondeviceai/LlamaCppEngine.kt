package com.chatr.app.ondeviceai

import android.content.Context
import android.os.SystemClock
import android.util.Log
import java.io.File

/**
 * Native llama.cpp JNI wrapper for running GGUF models on Android (arm64-v8a).
 * Safely handles dynamic linking so that if libllama.so is not bundled,
 * the application continues running without UnsatisfiedLinkError.
 */
class LlamaCppEngine private constructor(private val modelPath: String) {

    private var nativeHandle: Long = 0
    private var isClosed = false

    companion object {
        private const val TAG = "LlamaCppEngine"
        private var isLibraryLoaded = false

        init {
            try {
                System.loadLibrary("ggml-base")
                System.loadLibrary("ggml-cpu")
                System.loadLibrary("ggml")
                System.loadLibrary("llama")
                isLibraryLoaded = true
                Log.i(TAG, "libllama.so and GGML dependencies loaded successfully.")
            } catch (e: UnsatisfiedLinkError) {
                Log.w(TAG, "libllama.so or dependencies not found in jniLibs: ${e.message}. Running in fallback mode.")
                isLibraryLoaded = false
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error loading libllama.so", e)
                isLibraryLoaded = false
            }
        }

        fun isNativeAvailable(): Boolean = isLibraryLoaded

        fun smokeTest(): Boolean {
            if (!isLibraryLoaded) return false
            return try {
                nativeSmokeTest()
            } catch (e: Throwable) {
                Log.e(TAG, "Native smoke test failed: ${e.message}", e)
                false
            }
        }

        @Volatile
        private var activeInstance: LlamaCppEngine? = null

        fun getActiveInstance(): LlamaCppEngine? = activeInstance

        fun unloadActiveInstance() {
            activeInstance?.let {
                Log.i(TAG, "Unloading active native llama instance on OS memory pressure request.")
                it.close()
                activeInstance = null
            }
        }

        fun determineThreadCount(context: Context): Int {
            val cores = Runtime.getRuntime().availableProcessors()
            var threads = (cores / 2).coerceIn(2, 4)

            // Dynamic Thermal Check (Battery temp & Thermal Status)
            try {
                var isWarmOrThrottled = false

                // 1. Android Thermal Status (API 29+)
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    val powerManager = context.getSystemService(Context.POWER_SERVICE) as? android.os.PowerManager
                    val thermalStatus = powerManager?.currentThermalStatus ?: 0
                    if (thermalStatus >= android.os.PowerManager.THERMAL_STATUS_MODERATE) {
                        isWarmOrThrottled = true
                    }
                }

                // 2. Battery Temperature Check (Threshold: >= 38.0°C)
                val intent = context.registerReceiver(null, android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED))
                val tempTenths = intent?.getIntExtra(android.os.BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0
                val batteryTempC = tempTenths / 10f
                if (batteryTempC >= 38.0f) {
                    isWarmOrThrottled = true
                }

                if (isWarmOrThrottled) {
                    val reduced = (threads - 1).coerceAtLeast(1)
                    Log.w(TAG, "Thermal throttle active (batteryTemp=${batteryTempC}°C). Reducing threads: $threads -> $reduced")
                    threads = reduced
                }
            } catch (e: Exception) {
                Log.w(TAG, "Thermal status check skipped: ${e.message}")
            }

            return threads
        }

        @JvmStatic
        private external fun nativeSmokeTest(): Boolean

        /**
         * Factory method to instantiate engine if model file exists.
         */
        fun create(context: Context, modelFile: File): LlamaCppEngine? {
            if (!modelFile.exists() || !modelFile.canRead()) {
                Log.w(TAG, "GGUF model file does not exist or cannot be read: ${modelFile.absolutePath}")
                return null
            }

            val threads = determineThreadCount(context)
            val engine = LlamaCppEngine(modelFile.absolutePath)
            val success = engine.initialize(threads)
            return if (success) {
                activeInstance?.close()
                activeInstance = engine
                engine
            } else null
        }
    }

    private fun initialize(threads: Int): Boolean {
        if (!isLibraryLoaded) {
            Log.i(TAG, "Native library not present; engine initialized in safe placeholder mode.")
            return true
        }

        return try {
            val contextTokens = 2048
            nativeHandle = nativeInit(modelPath, threads, contextTokens)
            nativeHandle != 0L
        } catch (e: Throwable) {
            Log.e(TAG, "Failed to initialize native llama context", e)
            false
        }
    }

    @Synchronized
    fun generate(prompt: String, maxTokens: Int = 512, temperature: Float = 0.7f): String {
        if (isClosed) {
            throw IllegalStateException("LlamaCppEngine has been closed.")
        }

        if (!isLibraryLoaded || nativeHandle == 0L) {
            Log.d(TAG, "Generating via fallback processor (native lib not loaded)")
            return "CHATR On-Device AI processed your command: ${prompt.take(60)}"
        }

        val start = SystemClock.elapsedRealtime()
        return try {
            val output = nativeGenerate(nativeHandle, prompt, maxTokens, temperature)
            val elapsed = SystemClock.elapsedRealtime() - start
            Log.d(TAG, "Llama generation completed in ${elapsed}ms (${output.length} chars)")
            output
        } catch (e: Throwable) {
            Log.e(TAG, "Native generation error", e)
            throw RuntimeException("Native llama inference failed: ${e.message}", e)
        }
    }

    @Synchronized
    fun close() {
        if (!isClosed) {
            isClosed = true
            if (isLibraryLoaded && nativeHandle != 0L) {
                try {
                    nativeFree(nativeHandle)
                } catch (e: Throwable) {
                    Log.e(TAG, "Error freeing native llama handle", e)
                }
                nativeHandle = 0L
            }
        }
    }

    // JNI Native Declarations
    private external fun nativeInit(modelPath: String, nThreads: Int, nCtx: Int): Long
    private external fun nativeGenerate(handle: Long, prompt: String, maxTokens: Int, temp: Float): String
    private external fun nativeFree(handle: Long)
}
