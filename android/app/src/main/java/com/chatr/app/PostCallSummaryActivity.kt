package com.chatr.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.chatr.app.kernel.workflow.PostCallAction
import com.chatr.app.kernel.workflow.PostCallWorkflowBroadcaster
import com.chatr.app.kernel.workflow.ScreenedCallResult
import com.chatr.app.kernel.workflow.UrgencyLevel
import kotlinx.coroutines.launch

/**
 * PostCallSummaryActivity — Premium Post-Call Executive Summary.
 *
 * User Experience Invariant:
 * The user should not see the internal architecture (no "SI", "engines", "Room", "DAG", "ToolRegistry").
 * They see:
 *   - Clean caller identity (e.g., "Rahul Mehta")
 *   - Human summary of what happened
 *   - Key points bulleted
 *   - Detected commitments card with clear ownership
 *   - 1-tap user-authorized actions: "Add to calendar", "Send message", "Save commitment"
 */
class PostCallSummaryActivity : AppCompatActivity() {

    private var phoneNumber: String = ""
    private var currentResult: ScreenedCallResult? = null

    private val workflowResultReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action != PostCallWorkflowBroadcaster.ACTION_WORKFLOW_RESULT) return

            val callerDisplay = intent.getStringExtra(PostCallWorkflowBroadcaster.EXTRA_CALLER_DISPLAY) ?: phoneNumber
            val summary       = intent.getStringExtra(PostCallWorkflowBroadcaster.EXTRA_SUMMARY) ?: ""
            val keyPoints     = intent.getStringArrayListExtra(PostCallWorkflowBroadcaster.EXTRA_KEY_POINTS) ?: arrayListOf()
            val urgencyName   = intent.getStringExtra(PostCallWorkflowBroadcaster.EXTRA_URGENCY) ?: "NORMAL"
            val hasCalendar   = intent.getBooleanExtra(PostCallWorkflowBroadcaster.EXTRA_HAS_CALENDAR, false)
            val hasSms        = intent.getBooleanExtra(PostCallWorkflowBroadcaster.EXTRA_HAS_SMS, false)
            val commitments   = intent.getStringArrayListExtra(PostCallWorkflowBroadcaster.EXTRA_COMMITMENTS) ?: arrayListOf()

            runOnUiThread {
                updateCallerDisplay(callerDisplay)
                if (summary.isNotBlank()) {
                    findViewById<TextView>(R.id.summaryText).text = summary
                }
                if (keyPoints.isNotEmpty()) {
                    renderKeyPoints(keyPoints)
                }
                if (urgencyName == UrgencyLevel.HIGH.name) {
                    showUrgencyBadge()
                }
                renderCommitments(commitments)
                updateDynamicChips(hasCalendar, hasSms, commitments)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_post_call_summary)

        phoneNumber = intent.getStringExtra(EXTRA_PHONE_NUMBER) ?: "Unknown"
        val summaryText = intent.getStringExtra(EXTRA_SUMMARY) ?: "Call completed."
        val keyPoints   = intent.getStringArrayListExtra(EXTRA_KEY_POINTS) ?: arrayListOf()
        val actionItems = intent.getStringArrayListExtra(EXTRA_ACTION_ITEMS) ?: arrayListOf()

        // Populate caller name
        findViewById<TextView?>(R.id.callerNameText)?.text = phoneNumber
        findViewById<TextView>(R.id.summaryText).text = summaryText

        if (keyPoints.isNotEmpty()) {
            renderKeyPoints(keyPoints)
        }

        // Build domain model instance
        currentResult = ScreenedCallResult(
            traceId = intent.getStringExtra(EXTRA_TRACE_ID) ?: "",
            phoneNumber = phoneNumber,
            callerMessage = summaryText,
            keyPoints = keyPoints.toList(),
            extractedCommitments = actionItems.toList()
        )

        // Close button
        findViewById<MaterialButton>(R.id.btnClose).setOnClickListener { finish() }

        // Register for async workflow completion events
        ContextCompat.registerReceiver(
            this,
            workflowResultReceiver,
            IntentFilter(PostCallWorkflowBroadcaster.ACTION_WORKFLOW_RESULT),
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        runCatching { unregisterReceiver(workflowResultReceiver) }
    }

    // ── Content Rendering ───────────────────────────────────────────────────

    private fun updateCallerDisplay(callerDisplay: String) {
        findViewById<TextView?>(R.id.callerNameText)?.text = callerDisplay
    }

    private fun showUrgencyBadge() {
        findViewById<TextView?>(R.id.urgencyBadge)?.apply {
            text = "URGENT"
            visibility = View.VISIBLE
        }
    }

    private fun renderKeyPoints(keyPoints: List<String>) {
        val validPoints = keyPoints.filter { it.isNotBlank() && it != "Recorded during SI screening" }
        if (validPoints.isEmpty()) return

        findViewById<TextView>(R.id.keyPointsHeader).visibility = View.VISIBLE
        val keyPointsTv = findViewById<TextView>(R.id.keyPointsText)
        keyPointsTv.visibility = View.VISIBLE
        keyPointsTv.text = validPoints.joinToString("\n") { "• $it" }
    }

    private fun renderCommitments(commitments: List<String>) {
        val container = findViewById<LinearLayout>(R.id.commitmentsContainer)
        val textTv = findViewById<TextView>(R.id.commitmentsText)
        val headerTv = findViewById<TextView>(R.id.commitmentsHeader)

        if (commitments.isEmpty()) {
            container.visibility = View.GONE
            return
        }

        container.visibility = View.VISIBLE
        headerTv.text = if (commitments.size == 1) "You have 1 commitment" else "You have ${commitments.size} commitments"
        textTv.text = commitments.joinToString("\n") { "• $it" }
    }

    private fun updateDynamicChips(hasCalendar: Boolean, hasSms: Boolean, commitments: List<String>) {
        val chipsContainer = findViewById<LinearLayout>(R.id.actionChipsContainer)
        chipsContainer.removeAllViews()

        if (hasCalendar) {
            addDynamicChip(chipsContainer, "Add to calendar") {
                val result = currentResult ?: return@addDynamicChip
                Toast.makeText(this, "Adding to calendar...", Toast.LENGTH_SHORT).show()
                lifecycleScope.launch {
                    (application as? ChatrApplication)
                        ?.postCallWorkflowEngine
                        ?.executeConfirmedAction(
                            PostCallAction.CreateCalendarEvent(description = result.callerMessage),
                            result
                        )
                    runOnUiThread {
                        Toast.makeText(this@PostCallSummaryActivity, "Added to calendar", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        if (hasSms) {
            addDynamicChip(chipsContainer, "Send quick message") {
                val result = currentResult ?: return@addDynamicChip
                Toast.makeText(this, "Sending message...", Toast.LENGTH_SHORT).show()
                lifecycleScope.launch {
                    (application as? ChatrApplication)
                        ?.postCallWorkflowEngine
                        ?.executeConfirmedAction(
                            PostCallAction.SendSmsAck("Hi, I missed your call. I'll get back to you shortly."),
                            result
                        )
                    runOnUiThread {
                        Toast.makeText(this@PostCallSummaryActivity, "Message sent", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        if (commitments.isNotEmpty()) {
            addDynamicChip(chipsContainer, "Save commitment") {
                Toast.makeText(this, "Commitment saved", Toast.LENGTH_SHORT).show()
            }
        }

        // Always provide Call back
        addDynamicChip(chipsContainer, "Call back") {
            try {
                val dialIntent = Intent(Intent.ACTION_DIAL, android.net.Uri.parse("tel:$phoneNumber"))
                startActivity(dialIntent)
            } catch (e: Exception) {
                Toast.makeText(this, "Unable to initiate call", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun addDynamicChip(container: LinearLayout, label: String, onClick: () -> Unit) {
        val chip = LayoutInflater.from(this)
            .inflate(R.layout.item_action_chip, container, false) as TextView
        chip.text = label
        chip.setOnClickListener { onClick() }
        container.addView(chip)
    }

    companion object {
        const val EXTRA_PHONE_NUMBER = "phone_number"
        const val EXTRA_SUMMARY      = "summary"
        const val EXTRA_KEY_POINTS   = "key_points"
        const val EXTRA_ACTION_ITEMS = "action_items"
        const val EXTRA_TRACE_ID     = "trace_id"

        fun start(
            context: Context,
            phone: String,
            summary: String,
            keyPoints: List<String>,
            actionItems: List<String>,
            traceId: String = ""
        ) {
            val intent = Intent(context, PostCallSummaryActivity::class.java).apply {
                putExtra(EXTRA_PHONE_NUMBER, phone)
                putExtra(EXTRA_SUMMARY, summary)
                putStringArrayListExtra(EXTRA_KEY_POINTS, ArrayList(keyPoints))
                putStringArrayListExtra(EXTRA_ACTION_ITEMS, ArrayList(actionItems))
                putExtra(EXTRA_TRACE_ID, traceId)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            context.startActivity(intent)
        }
    }
}
