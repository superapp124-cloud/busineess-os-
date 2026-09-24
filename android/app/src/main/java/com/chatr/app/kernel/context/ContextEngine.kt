package com.chatr.app.kernel.context

import android.content.Context
import android.media.AudioManager
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import com.chatr.app.services.ChatrInCallService
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.UUID

/**
 * ContextEngine — Collects and synthesizes real-time device, call, audio, and environmental state
 * into a structured, privacy-safe [DeviceContext].
 *
 * Privacy Invariant:
 * Contains no raw personal communications or screen pixel buffers.
 * References to persons are strictly by entityId.
 */
class ContextEngine(private val context: Context? = null) {

    companion object {
        private const val TAG = "ContextEngine"
    }

    /**
     * Captures a comprehensive snapshot of the device at the current instant.
     */
    fun captureContext(
        activeScreen: ScreenNode? = null,
        activeEntityIds: List<String> = emptyList(),
        recentNotifications: List<NotificationNode> = emptyList()
    ): DeviceContext {
        val now = System.currentTimeMillis()
        val timeContext = captureTimeContext(now)
        val deviceState = captureDeviceState()
        val ongoingCall = captureOngoingCall()

        return DeviceContext(
            snapshotId = UUID.randomUUID().toString(),
            capturedAtMs = now,
            activeScreen = activeScreen,
            ongoingCall = ongoingCall,
            recentNotifications = recentNotifications,
            location = null, // Protected location: requires explicit location permission
            activeEntityIds = activeEntityIds,
            timeContext = timeContext,
            deviceState = deviceState
        )
    }

    private fun captureOngoingCall(): CallContext? {
        val activeCall = ChatrInCallService.getActiveCall() ?: return null
        val duration = activeCall.details?.connectTimeMillis?.let {
            if (it > 0) (System.currentTimeMillis() - it) / 1000 else 0L
        } ?: 0L

        return CallContext(
            callId = UUID.randomUUID().toString(),
            phoneNumber = "PROTECTED_ACTIVE_CALL",
            callerEntityId = null,
            direction = CallDirection.INCOMING,
            stateLabel = "ACTIVE",
            durationSeconds = duration,
            isScreeningActive = true
        )
    }

    private fun captureTimeContext(now: Long): TimeContext {
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = now

        val dayOfWeek = SimpleDateFormat("EEEE", Locale.US).format(Date(now))
        val hourOfDay = calendar.get(Calendar.HOUR_OF_DAY)
        val isWorkingHours = hourOfDay in 9..18 && calendar.get(Calendar.DAY_OF_WEEK) !in listOf(Calendar.SATURDAY, Calendar.SUNDAY)

        return TimeContext(
            currentTimeMs = now,
            timeZoneId = TimeZone.getDefault().id,
            dayOfWeek = dayOfWeek,
            isWorkingHours = isWorkingHours,
            nextCalendarEventTitle = null,
            minutesToNextEvent = null
        )
    }

    private fun captureDeviceState(): DeviceState {
        val ctx = context
        if (ctx == null) {
            return DeviceState(
                batteryPercent = 85,
                isCharging = false,
                networkType = NetworkType.WIFI,
                isScreenOn = true,
                isPhoneLocked = false,
                isDoNotDisturbActive = false
            )
        }

        var batteryPct = 85
        var isCharging = false
        try {
            val bm = ctx.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
            if (bm != null) {
                batteryPct = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
                isCharging = bm.isCharging
            }
        } catch (_: Exception) {}

        var isScreenOn = true
        try {
            val pm = ctx.getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (pm != null) {
                isScreenOn = pm.isInteractive
            }
        } catch (_: Exception) {}

        return DeviceState(
            batteryPercent = batteryPct.coerceIn(0, 100),
            isCharging = isCharging,
            networkType = NetworkType.WIFI,
            isScreenOn = isScreenOn,
            isPhoneLocked = false,
            isDoNotDisturbActive = false
        )
    }
}
