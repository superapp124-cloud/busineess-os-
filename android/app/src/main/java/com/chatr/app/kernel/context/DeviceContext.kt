package com.chatr.app.kernel.context

import java.util.UUID

data class ScreenNode(
    val appPackage: String,
    val activityClass: String?,
    val visibleText: List<String>,
    val actionableElements: List<String>,
    /** Names, prices, addresses extracted from the current screen content. */
    val detectedEntities: List<String>,
    val capturedAtMs: Long = System.currentTimeMillis()
)

enum class CallDirection { INCOMING, OUTGOING }

data class CallContext(
    val callId: String,
    val phoneNumber: String,
    val callerEntityId: String?,
    val direction: CallDirection,
    val stateLabel: String,
    val durationSeconds: Long,
    val isScreeningActive: Boolean
)

enum class NotificationPriority { HIGH, DEFAULT, LOW, MIN, SPAM }

data class NotificationNode(
    val notificationKey: String,
    val packageName: String,
    val title: String?,
    val text: String?,
    val priority: NotificationPriority,
    val postedAtMs: Long
)

data class LocationContext(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float,
    val placeName: String?,
    val capturedAtMs: Long
)

data class TimeContext(
    val currentTimeMs: Long,
    val timeZoneId: String,
    val dayOfWeek: String,
    val isWorkingHours: Boolean,
    val nextCalendarEventTitle: String?,
    val minutesToNextEvent: Long?
)

enum class NetworkType { WIFI, CELLULAR_5G, CELLULAR_4G, CELLULAR_3G, OFFLINE }

data class DeviceState(
    val batteryPercent: Int,
    val isCharging: Boolean,
    val networkType: NetworkType,
    val isScreenOn: Boolean,
    val isPhoneLocked: Boolean,
    val isDoNotDisturbActive: Boolean
)

/**
 * A complete snapshot of device context at a point in time.
 * Passed into ChatrIntelligenceApi for context-aware reasoning.
 *
 * Contains no raw personal data — entity references are by entityId only.
 * Screen content is extracted text, not screenshots.
 */
data class DeviceContext(
    val snapshotId: String = UUID.randomUUID().toString(),
    val capturedAtMs: Long = System.currentTimeMillis(),
    val activeScreen: ScreenNode? = null,
    val ongoingCall: CallContext? = null,
    val recentNotifications: List<NotificationNode> = emptyList(),
    val location: LocationContext? = null,
    /** Entity IDs of people/companies currently relevant to the active context. */
    val activeEntityIds: List<String> = emptyList(),
    val timeContext: TimeContext,
    val deviceState: DeviceState
)
