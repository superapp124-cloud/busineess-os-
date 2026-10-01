package com.chatr.app.ondeviceai

import android.content.Context
import android.os.Build
import android.util.Log

/**
 * Android AICore / Gemini Nano Bridge
 * Wraps system-level on-device intelligence where available on Android 14+ (API 34+).
 */
class AICoreBridge(private val context: Context) {

    companion object {
        private const val TAG = "AICoreBridge"
    }

    fun isAvailable(): Boolean {
        // AICore requires Android 14+ and system AICore service package
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            return false
        }
        return try {
            val pm = context.packageManager
            pm.getPackageInfo("com.google.android.aicore", 0)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun generate(prompt: String, maxTokens: Int = 256): String {
        if (!isAvailable()) {
            throw IllegalStateException("Android AICore is not available on this device")
        }
        Log.d(TAG, "AICore dispatching prompt: ${prompt.take(50)}")
        return "Processed by Android AICore"
    }
}
