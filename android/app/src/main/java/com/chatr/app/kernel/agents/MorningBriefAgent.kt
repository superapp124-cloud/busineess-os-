package com.chatr.app.kernel.agents

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.chatr.app.R
import com.chatr.app.kernel.memory.PersonalMemoryEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * MorningBriefAgent — Proactive SI intelligence layer for daily morning briefs.
 *
 * Fires at user-configured time (default 08:00) via AlarmManager.
 * Reads:
 *   - Active commitments from PersonalMemoryEngine
 *   - Call log (missed calls from overnight)
 *   - Top memory observations (high-importance facts)
 * Composes a structured morning brief notification with:
 *   - Pending commitments count
 *   - Missed overnight calls
 *   - Daily focus suggestion
 *
 * INVARIANT: This agent reads memory/call-log but never writes or executes tools.
 * It surfaces information to the user. The user takes action.
 */
class MorningBriefAgent(
    private val context: Context,
    private val memoryEngine: PersonalMemoryEngine
) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    companion object {
        private const val TAG = "MorningBriefAgent"
        private const val CHANNEL_ID = "chatr_morning_brief"
        private const val NOTIFICATION_ID = 2001
        private const val ACTION_MORNING_BRIEF = "com.chatr.app.MORNING_BRIEF"
        private const val REQUEST_CODE = 8001

        /** Default brief time: 08:00 */
        private const val DEFAULT_HOUR = 8
        private const val DEFAULT_MINUTE = 0

        /**
         * Schedules the daily morning brief alarm.
         * Call once on first launch or when the user changes the brief time.
         */
        fun scheduleDaily(context: Context, hourOfDay: Int = DEFAULT_HOUR, minute: Int = DEFAULT_MINUTE) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hourOfDay)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                // If the time has already passed today, schedule for tomorrow
                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val pendingIntent = buildPendingIntent(context)

            alarmManager.setInexactRepeating(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY,
                pendingIntent
            )

            Log.i(TAG, "Morning brief scheduled: ${hourOfDay}:${minute.toString().padStart(2, '0')} daily")
        }

        fun cancel(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.cancel(buildPendingIntent(context))
            Log.i(TAG, "Morning brief cancelled")
        }

        private fun buildPendingIntent(context: Context): PendingIntent {
            val intent = Intent(context, MorningBriefReceiver::class.java).apply {
                action = ACTION_MORNING_BRIEF
            }
            return PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }

    /** Called from MorningBriefReceiver when the alarm fires */
    fun deliverBrief() {
        scope.launch {
            try {
                Log.i(TAG, "Composing morning brief...")

                // 1. Read active commitments
                val commitments = memoryEngine.getActiveCommitments(entityId = null)
                val overdueCommitments = commitments.filter { c ->
                    c.deadlineMs != null && c.deadlineMs < System.currentTimeMillis()
                }

                // 2. Read high-priority memories
                val snapshot = memoryEngine.buildSnapshot(
                    queryContext = "morning brief daily summary",
                    limit = 3
                )

                // 3. Rank and strictly cap at maximum 3 items worth knowing
                val curatedItems = mutableListOf<String>()

                // Priority 1: Overdue commitments
                if (overdueCommitments.isNotEmpty()) {
                    curatedItems.add("Needs attention: ${overdueCommitments.first().description.take(60)}")
                }

                // Priority 2: Next upcoming commitment
                val upcoming = commitments.firstOrNull { it !in overdueCommitments }
                if (upcoming != null && curatedItems.size < 3) {
                    curatedItems.add("Today: ${upcoming.description.take(60)}")
                }

                // Priority 3: Most relevant context/memory
                if (snapshot.relevantRecords.isNotEmpty() && curatedItems.size < 3) {
                    val topFact = snapshot.relevantRecords.first().content
                    curatedItems.add(topFact.take(60))
                }

                val title = if (curatedItems.isNotEmpty()) {
                    "${curatedItems.size} ${if (curatedItems.size == 1) "thing" else "things"} worth knowing today"
                } else {
                    "Your day is clear"
                }

                val bodyText = if (curatedItems.isNotEmpty()) {
                    curatedItems.joinToString("\n• ", "• ")
                } else {
                    "No pending commitments or urgent follow-ups."
                }

                // 4. Surface restrained, clean notification
                showBriefNotification(title, bodyText)
                Log.i(TAG, "Morning brief delivered: ${curatedItems.size} items surfaced")

            } catch (e: Exception) {
                Log.e(TAG, "Failed to deliver morning brief: ${e.message}", e)
            }
        }
    }

    private fun showBriefNotification(
        title: String,
        bodyText: String
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create channel (idempotent on subsequent calls)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Morning Brief",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Daily morning brief with your key priorities"
                setShowBadge(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_chatr_notification)
            .setContentTitle(title)
            .setContentText(bodyText.lines().firstOrNull() ?: "")
            .setStyle(NotificationCompat.BigTextStyle().bigText(bodyText))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}

/**
 * BroadcastReceiver that receives the AlarmManager wake-up and
 * delegates to MorningBriefAgent.deliverBrief().
 */
class MorningBriefReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        Log.i("MorningBriefReceiver", "Alarm fired — delivering morning brief")
        // MorningBriefAgent is instantiated via the application-level kernel init
        // For now, broadcast so the application's initialized agent can pick it up
        val broadcastIntent = Intent("com.chatr.app.MORNING_BRIEF_INTERNAL").apply {
            setPackage(context.packageName)
        }
        context.sendBroadcast(broadcastIntent)
    }
}
