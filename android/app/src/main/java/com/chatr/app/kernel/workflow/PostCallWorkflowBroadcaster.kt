package com.chatr.app.kernel.workflow

import android.content.Context
import android.content.Intent

/**
 * PostCallWorkflowBroadcaster — Dispatches PostCallWorkflowResult back to the UI layer
 * via a local broadcast so PostCallSummaryActivity can update its action chips.
 */
object PostCallWorkflowBroadcaster {

    const val ACTION_WORKFLOW_RESULT = "com.chatr.app.POST_CALL_WORKFLOW_RESULT"
    const val EXTRA_CALLER_DISPLAY   = "caller_display"
    const val EXTRA_SUMMARY          = "summary"
    const val EXTRA_KEY_POINTS       = "key_points"
    const val EXTRA_COMMITMENTS      = "commitments"
    const val EXTRA_URGENCY          = "urgency"
    const val EXTRA_ACTION_COUNT     = "action_count"
    const val EXTRA_HAS_CALENDAR     = "has_calendar"
    const val EXTRA_HAS_SMS          = "has_sms"

    fun dispatch(context: Context, result: PostCallWorkflowResult) {
        val intent = Intent(ACTION_WORKFLOW_RESULT).apply {
            putExtra(EXTRA_CALLER_DISPLAY, result.callerDisplay)
            putExtra(EXTRA_SUMMARY, result.summary)
            putStringArrayListExtra(EXTRA_KEY_POINTS, ArrayList(result.keyPoints))
            putStringArrayListExtra(EXTRA_COMMITMENTS, ArrayList(result.extractedCommitments))
            putExtra(EXTRA_URGENCY, result.urgencyLevel.name)
            putExtra(EXTRA_ACTION_COUNT, result.suggestedActions.size)
            putExtra(EXTRA_HAS_CALENDAR, result.suggestedActions.any { it is PostCallAction.CreateCalendarEvent })
            putExtra(EXTRA_HAS_SMS, result.suggestedActions.any { it is PostCallAction.SendSmsAck })
            setPackage(context.packageName)
        }
        context.sendBroadcast(intent)
    }
}
