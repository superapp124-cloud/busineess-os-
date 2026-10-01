package com.chatr.app.plugins

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Build
import android.telecom.CallAudioState
import android.telecom.TelecomManager
import androidx.activity.result.ActivityResult
import androidx.core.content.ContextCompat
import com.chatr.app.services.ChatrInCallService
import com.chatr.app.services.ChatrTelecomRoleManager
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import android.util.Log

/**
 * TelecomInterceptorPlugin
 *
 * Capacitor bridge giving the web layer read/control access to the Android Telecom stack:
 * - Requesting Default Phone / Dialer role (ROLE_DIALER)
 * - Requesting Call Screening role (ROLE_CALL_SCREENING)
 * - Hardware audio routing (Speaker, Earpiece, Bluetooth, Wired Headset)
 * - Hardware call mute / hold / DTMF
 * - Live Telecom call state inspection
 */
@CapacitorPlugin(name = "TelecomInterceptor")
class TelecomInterceptorPlugin : Plugin() {

    companion object {
        private const val TAG = "TelecomInterceptor"
    }

    @PluginMethod
    fun getCallState(call: PluginCall) {
        resolveCallState(call)
    }

    private fun resolveCallState(call: PluginCall) {
        try {
            val tm = context.getSystemService(TelecomManager::class.java)
            val isInCall = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                tm?.isInCall ?: false
            } else {
                @Suppress("DEPRECATION")
                tm?.isInCall ?: false
            }
            val audioState = ChatrInCallService.getCallAudioState()
            val result = JSObject().apply {
                put("isInCall", isInCall)
                put("isMuted", audioState?.isMuted ?: false)
                put("audioRoute", audioState?.route ?: CallAudioState.ROUTE_EARPIECE)
                put("isRinging", ChatrInCallService.isCallRinging())
                put("isActive", ChatrInCallService.isCallActive())
            }
            call.resolve(result)
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException reading call state", e)
            call.reject("Permission denied by system")
        } catch (e: Exception) {
            Log.e(TAG, "Error reading call state", e)
            call.reject(e.message ?: "Unknown error")
        }
    }

    @PluginMethod
    fun isDefaultDialer(call: PluginCall) {
        val isDefault = ChatrTelecomRoleManager.isDefaultDialer(context)
        call.resolve(JSObject().apply { put("isDefault", isDefault) })
    }

    @PluginMethod
    fun requestDefaultDialerRole(call: PluginCall) {
        if (ChatrTelecomRoleManager.isDefaultDialer(context)) {
            call.resolve(JSObject().apply {
                put("granted", true)
                put("alreadyDefault", true)
            })
            return
        }

        val intent = ChatrTelecomRoleManager.createDefaultDialerRequestIntent(context)
        if (intent == null) {
            call.reject("Cannot request Default Dialer role on this device")
            return
        }

        startActivityForResult(call, intent, "defaultDialerRoleResult")
    }

    @ActivityCallback
    private fun defaultDialerRoleResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val isNowDefault = ChatrTelecomRoleManager.isDefaultDialer(context)
        Log.i(TAG, "Default dialer role result: isNowDefault=$isNowDefault resultCode=${result.resultCode}")
        call.resolve(JSObject().apply {
            put("granted", isNowDefault)
            put("resultCode", result.resultCode)
        })
    }

    @PluginMethod
    fun isCallScreeningRoleHeld(call: PluginCall) {
        val held = ChatrTelecomRoleManager.isCallScreeningRoleHeld(context)
        call.resolve(JSObject().apply { put("held", held) })
    }

    @PluginMethod
    fun requestCallScreeningRole(call: PluginCall) {
        if (ChatrTelecomRoleManager.isCallScreeningRoleHeld(context)) {
            call.resolve(JSObject().apply {
                put("granted", true)
                put("alreadyHeld", true)
            })
            return
        }

        val intent = ChatrTelecomRoleManager.createCallScreeningRequestIntent(context)
        if (intent == null) {
            call.reject("Cannot request Call Screening role on this device")
            return
        }

        startActivityForResult(call, intent, "callScreeningRoleResult")
    }

    @ActivityCallback
    private fun callScreeningRoleResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val isHeld = ChatrTelecomRoleManager.isCallScreeningRoleHeld(context)
        Log.i(TAG, "Call screening role result: isHeld=$isHeld resultCode=${result.resultCode}")
        call.resolve(JSObject().apply {
            put("granted", isHeld)
            put("resultCode", result.resultCode)
        })
    }

    @PluginMethod
    fun getTelecomStatus(call: PluginCall) {
        try {
            val status = ChatrTelecomRoleManager.getTelecomStatus(context)
            val js = JSObject()
            val keys = status.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                js.put(key, status.get(key))
            }
            call.resolve(js)
        } catch (e: Exception) {
            call.reject(e.message ?: "Failed to get telecom status")
        }
    }

    @PluginMethod
    fun setAudioRoute(call: PluginCall) {
        val routeStr = call.getString("route", "speaker")?.lowercase() ?: "speaker"
        val route = when (routeStr) {
            "speaker" -> CallAudioState.ROUTE_SPEAKER
            "earpiece" -> CallAudioState.ROUTE_EARPIECE
            "bluetooth" -> CallAudioState.ROUTE_BLUETOOTH
            "headset" -> CallAudioState.ROUTE_WIRED_HEADSET
            else -> CallAudioState.ROUTE_SPEAKER
        }
        val success = ChatrInCallService.setAudioRoute(route)
        call.resolve(JSObject().apply {
            put("success", success)
            put("route", routeStr)
        })
    }

    @PluginMethod
    fun setMuted(call: PluginCall) {
        val muted = call.getBoolean("muted", false) ?: false
        val success = ChatrInCallService.setMuted(muted)
        call.resolve(JSObject().apply {
            put("success", success)
            put("muted", muted)
        })
    }

    @PluginMethod
    fun answerGsmCall(call: PluginCall) {
        val success = ChatrInCallService.answerCall()
        call.resolve(JSObject().apply { put("success", success) })
    }

    @PluginMethod
    fun disconnectGsmCall(call: PluginCall) {
        val success = ChatrInCallService.disconnectCall()
        call.resolve(JSObject().apply { put("success", success) })
    }

    @PluginMethod
    fun isDefaultSmsApp(call: PluginCall) {
        val tm = context.getSystemService(TelecomManager::class.java)
        val isDefault = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            android.provider.Telephony.Sms.getDefaultSmsPackage(context) == context.packageName
        } else {
            false
        }
        call.resolve(JSObject().apply { put("isDefault", isDefault) })
    }

    @PluginMethod
    fun getPhoneAccountStatus(call: PluginCall) {
        try {
            val tm = context.getSystemService(TelecomManager::class.java)
            val accounts = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE)
                == PackageManager.PERMISSION_GRANTED) {
                tm?.callCapablePhoneAccounts?.size ?: 0
            } else { 0 }

            call.resolve(JSObject().apply {
                put("registeredAccounts", accounts)
                put("isInCall", tm?.isInCall ?: false)
            })
        } catch (e: Exception) {
            call.reject(e.message ?: "Error")
        }
    }
}
