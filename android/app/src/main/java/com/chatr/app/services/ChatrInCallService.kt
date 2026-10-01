package com.chatr.app.services

import android.content.Context
import android.content.Intent
import android.os.Build
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.InCallService
import android.util.Log
import com.chatr.app.nativecalls.NativeContactResolver
import com.chatr.app.nativecalls.NativePhoneNormalizer
import com.chatr.app.webrtc.ShieldActiveCallActivity
import com.chatr.app.webrtc.ShieldIncomingCallActivity
import java.util.concurrent.ConcurrentHashMap

/**
 * ChatrInCallService — Android Telecom Default Phone / Dialer InCallService
 *
 * Implements Android's InCallService interface to own the live in-call lifecycle,
 * call state machine, hardware audio routing (earpiece, speakerphone, Bluetooth SCO),
 * and call management when CHATR is the Default Phone app.
 *
 * Technical Separation:
 * - CallScreeningService evaluates metadata pre-ring (Allow, Silence, Disallow).
 * - ChatrInCallService conducts the active call, UI presentation, audio routing,
 *   and SI Receptionist session.
 */
class ChatrInCallService : InCallService() {

    companion object {
        private const val TAG = "ChatrInCallService"
        private const val PREFS = "chatr_gsm_call"

        const val KEY_ACTIVE_CALL_ID = "active_gsm_call_id"
        const val KEY_CALL_STATE     = "gsm_call_state"
        const val KEY_CALLER_NUMBER  = "gsm_caller_number"
        const val KEY_CALL_COUNT     = "gsm_call_count"
        const val GSM_CALL_EVENT     = "com.chatr.app.GSM_CALL_EVENT"
        const val CALL_ACTION_EVENT  = "com.chatr.app.CALL_ACTION"

        @Volatile
        private var serviceInstance: ChatrInCallService? = null

        @Volatile
        private var activeCallInstance: Call? = null

        private val activeCallsMap = ConcurrentHashMap<String, Call>()

        fun getServiceInstance(): ChatrInCallService? = serviceInstance
        fun getActiveCall(): Call? = activeCallInstance

        fun isCallRinging(): Boolean =
            activeCallInstance?.state == Call.STATE_RINGING

        fun isCallActive(): Boolean =
            activeCallInstance?.state == Call.STATE_ACTIVE

        /**
         * Answers the active call programmatically.
         */
        fun answerCall(videoState: Int = 0): Boolean {
            val call = activeCallInstance ?: run {
                Log.w(TAG, "Cannot answerCall: No active GSM call")
                return false
            }
            return try {
                call.answer(videoState)
                Log.i(TAG, "call.answer() dispatched successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "call.answer() failed: ${e.message}", e)
                false
            }
        }

        /**
         * Disconnects/hangs up the active call.
         */
        fun disconnectCall(): Boolean {
            val call = activeCallInstance ?: run {
                Log.w(TAG, "Cannot disconnectCall: No active GSM call")
                return false
            }
            return try {
                call.disconnect()
                Log.i(TAG, "call.disconnect() dispatched successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "call.disconnect() failed: ${e.message}", e)
                false
            }
        }

        /**
         * Puts the active call on hold.
         */
        fun holdCall(): Boolean {
            val call = activeCallInstance ?: return false
            return try {
                call.hold()
                Log.i(TAG, "call.hold() dispatched successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "call.hold() failed: ${e.message}", e)
                false
            }
        }

        /**
         * Resumes the active call from hold.
         */
        fun unholdCall(): Boolean {
            val call = activeCallInstance ?: return false
            return try {
                call.unhold()
                Log.i(TAG, "call.unhold() dispatched successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "call.unhold() failed: ${e.message}", e)
                false
            }
        }

        /**
         * Plays a DTMF tone during the active call.
         */
        fun playDtmfTone(digit: Char): Boolean {
            val call = activeCallInstance ?: return false
            return try {
                call.playDtmfTone(digit)
                true
            } catch (e: Exception) {
                Log.e(TAG, "playDtmfTone failed: ${e.message}", e)
                false
            }
        }

        /**
         * Stops playing the DTMF tone.
         */
        fun stopDtmfTone(): Boolean {
            val call = activeCallInstance ?: return false
            return try {
                call.stopDtmfTone()
                true
            } catch (e: Exception) {
                Log.e(TAG, "stopDtmfTone failed: ${e.message}", e)
                false
            }
        }

        /**
         * Hardware Audio Routing:
         * Switches audio path to Earpiece, Speaker, Bluetooth, or Headset.
         */
        fun setAudioRoute(route: Int): Boolean {
            val service = serviceInstance ?: run {
                Log.w(TAG, "Cannot setAudioRoute: InCallService instance is null")
                return false
            }
            return try {
                service.setAudioRoute(route)
                Log.i(TAG, "setAudioRoute($route) dispatched successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "setAudioRoute failed: ${e.message}", e)
                false
            }
        }

        /**
         * Hardware Microphone Mute:
         * Mutes or unmutes the active call's microphone.
         */
        fun setMuted(muted: Boolean): Boolean {
            val service = serviceInstance ?: run {
                Log.w(TAG, "Cannot setMuted: InCallService instance is null")
                return false
            }
            return try {
                service.setMuted(muted)
                Log.i(TAG, "setMuted($muted) dispatched successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "setMuted failed: ${e.message}", e)
                false
            }
        }

        /**
         * Hands the call back from the SI Receptionist to the human user without dropping.
         */
        fun handoverToHuman(): Boolean {
            Log.i(TAG, "Human takeover triggered: restoring normal voice path")
            val call = activeCallInstance ?: return false
            return try {
                call.unhold()
                true
            } catch (e: Exception) {
                Log.e(TAG, "handoverToHuman error: ${e.message}", e)
                true
            }
        }

        /**
         * Queries the current CallAudioState.
         */
        fun getCallAudioState(): CallAudioState? = serviceInstance?.callAudioState
    }

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {
            super.onStateChanged(call, state)
            val number = extractNumber(call)
            val stateName = stateLabel(state)
            Log.i(TAG, "Call state changed: number=$number state=$stateName ($state)")

            writeCallState(call, number, stateName)
            broadcastCallEvent(call, "state_change", number, stateName)

            when (state) {
                Call.STATE_ACTIVE -> {
                    // Transitioned to active: launch or update active call UI
                    launchActiveCallUi(call, number, isOutgoing = false)
                }
                Call.STATE_DISCONNECTED -> {
                    // Notify any open call UI to dismiss cleanly
                    broadcastCallAction(call, "end")
                    activeCallsMap.remove(getCallId(call))
                    if (activeCallInstance == call) {
                        activeCallInstance = null
                    }
                }
            }
        }

        override fun onDetailsChanged(call: Call, details: Call.Details) {
            super.onDetailsChanged(call, details)
            val number = extractNumber(call)
            Log.d(TAG, "Call details changed: number=$number")
        }
    }

    override fun onCreate() {
        super.onCreate()
        serviceInstance = this
        Log.i(TAG, "ChatrInCallService onCreate")
    }

    override fun onDestroy() {
        super.onDestroy()
        if (serviceInstance == this) {
            serviceInstance = null
        }
        activeCallInstance = null
        activeCallsMap.clear()
        Log.i(TAG, "ChatrInCallService onDestroy")
    }

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        val callId = getCallId(call)
        activeCallInstance = call
        activeCallsMap[callId] = call
        call.registerCallback(callCallback)

        val number = extractNumber(call)
        val stateName = stateLabel(call.state)
        Log.i(TAG, "📞 Call added: id=$callId number=$number state=$stateName")

        writeCallState(call, number, stateName)
        broadcastCallEvent(call, "call_added", number, stateName)

        when (call.state) {
            Call.STATE_RINGING -> {
                // Incoming GSM Call: Launch native ShieldIncomingCallActivity
                launchIncomingCallUi(call, number)
            }
            Call.STATE_DIALING, Call.STATE_CONNECTING -> {
                // Outgoing GSM Call: Launch native ShieldActiveCallActivity in dialing state
                launchActiveCallUi(call, number, isOutgoing = true)
            }
            Call.STATE_ACTIVE -> {
                launchActiveCallUi(call, number, isOutgoing = false)
            }
        }
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        val callId = getCallId(call)
        call.unregisterCallback(callCallback)
        activeCallsMap.remove(callId)
        if (activeCallInstance == call) {
            activeCallInstance = activeCallsMap.values.firstOrNull()
        }

        val number = extractNumber(call)
        Log.i(TAG, "📞 Call removed: id=$callId number=$number")

        getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .remove(KEY_ACTIVE_CALL_ID)
            .putString(KEY_CALL_STATE, "DISCONNECTED")
            .apply()

        broadcastCallEvent(call, "call_removed", number, "DISCONNECTED")
        broadcastCallAction(call, "end")
    }

    override fun onCallAudioStateChanged(audioState: CallAudioState?) {
        super.onCallAudioStateChanged(audioState)
        audioState ?: return
        Log.i(TAG, "🔊 Telecom audio state changed: route=${audioState.route} muted=${audioState.isMuted} supportedRouteMask=${audioState.supportedRouteMask}")

        getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean("gsm_muted", audioState.isMuted)
            .putInt("gsm_audio_route", audioState.route)
            .putInt("gsm_supported_routes", audioState.supportedRouteMask)
            .apply()

        val intent = Intent("com.chatr.app.CALL_AUDIO_STATE_CHANGED").apply {
            setPackage(packageName)
            putExtra("route", audioState.route)
            putExtra("is_muted", audioState.isMuted)
            putExtra("supported_route_mask", audioState.supportedRouteMask)
        }
        sendBroadcast(intent)
    }

    // -------------------------------------------------------------------------
    // UI Launching
    // -------------------------------------------------------------------------

    private fun launchIncomingCallUi(call: Call, number: String) {
        val callId = getCallId(call)
        val resolvedName = resolveCallerName(number)

        val intent = Intent(this, ShieldIncomingCallActivity::class.java).apply {
            putExtra("call_id", callId)
            putExtra("caller_phone", number)
            putExtra("caller_name", resolvedName)
            putExtra("call_type", "gsm")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        startActivity(intent)
    }

    private fun launchActiveCallUi(call: Call, number: String, isOutgoing: Boolean) {
        val callId = getCallId(call)
        val resolvedName = resolveCallerName(number)

        val intent = Intent(this, ShieldActiveCallActivity::class.java).apply {
            putExtra("call_id", callId)
            putExtra("caller_phone", number)
            putExtra("caller_name", resolvedName)
            putExtra("call_type", "gsm")
            putExtra("is_outgoing", isOutgoing)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        startActivity(intent)
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private fun getCallId(call: Call): String =
        System.identityHashCode(call).toString()

    private fun extractNumber(call: Call): String {
        return try {
            call.details?.handle?.schemeSpecificPart?.takeIf { it.isNotBlank() }
                ?: call.details?.gatewayInfo?.originalAddress?.schemeSpecificPart
                ?: "Unknown"
        } catch (_: Exception) {
            "Unknown"
        }
    }

    private fun resolveCallerName(rawNumber: String): String {
        if (rawNumber.isBlank() || rawNumber == "Unknown") return "Unknown Caller"
        return try {
            val contact = NativeContactResolver.lookup(this, rawNumber)
            contact?.displayName ?: rawNumber
        } catch (_: Exception) {
            rawNumber
        }
    }

    private fun stateLabel(state: Int): String = when (state) {
        Call.STATE_RINGING       -> "RINGING"
        Call.STATE_ACTIVE        -> "ACTIVE"
        Call.STATE_HOLDING       -> "HOLDING"
        Call.STATE_DIALING       -> "DIALING"
        Call.STATE_DISCONNECTED  -> "DISCONNECTED"
        Call.STATE_CONNECTING    -> "CONNECTING"
        Call.STATE_NEW           -> "NEW"
        else                     -> "UNKNOWN($state)"
    }

    private fun writeCallState(call: Call, number: String, state: String) {
        val id = getCallId(call)
        getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString(KEY_ACTIVE_CALL_ID, id)
            .putString(KEY_CALL_STATE, state)
            .putString(KEY_CALLER_NUMBER, number)
            .putLong("gsm_call_ts", System.currentTimeMillis())
            .apply()
    }

    private fun broadcastCallEvent(call: Call, event: String, number: String, state: String) {
        val intent = Intent(GSM_CALL_EVENT).apply {
            setPackage(packageName)
            putExtra("event", event)
            putExtra("call_id", getCallId(call))
            putExtra("number", number)
            putExtra("state", state)
        }
        sendBroadcast(intent)
    }

    private fun broadcastCallAction(call: Call, action: String) {
        val intent = Intent(CALL_ACTION_EVENT).apply {
            setPackage(packageName)
            putExtra("call_id", getCallId(call))
            putExtra("action", action)
        }
        sendBroadcast(intent)
    }
}
