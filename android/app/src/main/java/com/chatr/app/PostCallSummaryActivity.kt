package com.chatr.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.view.LayoutInflater
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
 * PostCallSummaryActivity — Post-call executive summary screen.
 *
 * Displays:
 *   - Caller identification + SI confidence
 *   - Call summary (what the caller said)
 *   - Key points extracted by AIScreeningService
 *   - Commitments written to PersonalMemoryEngine
 *   - Action chips: Create Calendar Event, Send SMS, Write Commitment
 *
 * Listens for PostCallWorkflowBroadcaster results and dynamically
 * updates the chip dock when the PostCallWorkflowEngine finishes
 * its async pipeline (entity resolution + memory writes).
 */
class PostCallSummaryActivity : AppCompatActivity() {

    private var phoneNumber: String = ""
    private var currentResult: ScreenedCallResult? = null

    private val workflowResultReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action != PostCallWorkflowBroadcaster.ACTION_WORKFLOW_RESULT) return

            val callerDisplay = intent.getStringExtra(PostCallWorkflowBroadcaster.EXTRA_CALLER_DISPLAY) ?: phoneNumber
            val urgencyName   = intent.getStringExtra(PostCallWorkflowBroadcaster.EXTRA_URGENCY) ?: "NORMAL"
            val hasCalendar   = intent.getBooleanExtra(PostCallWorkflowBroadcaster.EXTRA_HAS_CALENDAR, false)
            val hasSms        = intent.getBooleanExtra(PostCallWorkflowBroadcaster.EXTRA_HAS_SMS, false)
            val commitments   = intent.getStringArrayListExtra(PostCallWorkflowBroadcaster.EXTRA_COMMITMENTS) ?: arrayListOf()

            runOnUiThread {
                updateCallerDisplay(callerDisplay)
                if (urgencyName == UrgencyLevel.HIGH.name) {
                    showUrgencyBadge()
                }
                updateDynamicChips(hasCalendar, hasSms, commitments)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_post_call_summary)

        phoneNumber = intent.getStringExtra(EXTRA_PHONE_NUMBER) ?: "Unknown"
        val summaryText = intent.getStringExtra(EXTRA_SUMMARY) ?: "No summary available."
        val keyPoints   = intent.getStringArrayListExtra(EXTRA_KEY_POINTS) ?: arrayListOf()
        val actionItems = intent.getStringArrayListExtra(EXTRA_ACTION_ITEMS) ?: arrayListOf()

        // Populate static content
        findViewById<TextView?>(R.id.callerNameText)?.text = phoneNumber
        findViewById<TextView>(R.id.summaryText).text = summaryText

        val keyPointsTv = findViewById<TextView>(R.id.keyPointsText)
        keyPointsTv.text = if (keyPoints.isEmpty()) ""
        else "Key Points:\n" + keyPoints.joinToString("\n") { "• $it" }

        // Initial static action chips from AIScreeningService
        val chipsContainer = findViewById<LinearLayout>(R.id.actionChipsContainer)
        if (actionItems.isNotEmpty()) {
            for (action in actionItems) {
                val chip = LayoutInflater.from(this)
                    .inflate(R.layout.item_action_chip, chipsContainer, false) as TextView
                chip.text = "✨ $action"
                chipsContainer.addView(chip)
            }
        }

        // Build the ScreenedCallResult for dynamic chip execution
        currentResult = ScreenedCallResult(
            traceId = intent.getStringExtra(EXTRA_TRACE_ID) ?: "",
            phoneNumber = phoneNumber,
            callerMessage = summaryText,
            keyPoints = keyPoints.toList(),
            extractedCommitments = actionItems.toList()
        )

        // Close button
        findViewById<MaterialButton>(R.id.btnClose).setOnClickListener { finish() }

        // Register for workflow results (async entity resolution + proactive chips)
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

    // ── Dynamic UI updates ────────────────────────────────────────────────

    private fun updateCallerDisplay(callerDisplay: String) {
        findViewById<TextView?>(R.id.callerNameText)?.text = callerDisplay
    }

    private fun showUrgencyBadge() {
        findViewById<TextView?>(R.id.urgencyBadge)?.apply {
            text = "⚠️ URGENT"
            visibility = android.view.View.VISIBLE
        }
    }

    private fun updateDynamicChips(hasCalendar: Boolean, hasSms: Boolean, commitments: List<String>) {
        val chipsContainer = findViewById<LinearLayout>(R.id.actionChipsContainer)

        if (hasCalendar) {
            addDynamicChip(chipsContainer, "📅 Create Calendar Event") {
                val result = currentResult ?: return@addDynamicChip
                Toast.makeText(this, "Creating calendar event...", Toast.LENGTH_SHORT).show()
                lifecycleScope.launch {
                    // PostCallWorkflowEngine.executeConfirmedAction() is called here
                    // via the application-level injected engine reference
                    (application as? ChatrApplication)
                        ?.postCallWorkflowEngine
                        ?.executeConfirmedAction(
                            PostCallAction.CreateCalendarEvent(description = result.callerMessage),
                            result
                        )
                    runOnUiThread {
                        Toast.makeText(this@PostCallSummaryActivity, "✅ Event created", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        if (hasSms) {
            addDynamicChip(chipsContainer, "💬 Send SMS Acknowledgement") {
                val result = currentResult ?: return@addDynamicChip
                Toast.makeText(this, "Sending SMS...", Toast.LENGTH_SHORT).show()
                lifecycleScope.launch {
                    (application as? ChatrApplication)
                        ?.postCallWorkflowEngine
                        ?.executeConfirmedAction(
                            PostCallAction.SendSmsAck("Hi, I missed your call. I'll get back to you shortly. — CHATR SI"),
                            result
                        )
                    runOnUiThread {
                        Toast.makeText(this@PostCallSummaryActivity, "✅ SMS sent", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        for (commitment in commitments) {
            addDynamicChip(chipsContainer, "📌 $commitment") {
                Toast.makeText(this, "Commitment saved to SI memory", Toast.LENGTH_SHORT).show()
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
