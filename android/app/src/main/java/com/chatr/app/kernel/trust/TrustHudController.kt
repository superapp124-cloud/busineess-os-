package com.chatr.app.kernel.trust

import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.chatr.app.R

/**
 * TrustHudController — Manages floating HUD cards for MEDIUM-risk TrustDecisions.
 *
 * Displays a non-intrusive floating overlay window (TYPE_APPLICATION_OVERLAY)
 * prompting the user: "Allow CHATR to [action]?" with [Allow] and [Cancel].
 */
class TrustHudController(private val context: Context) {

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val mainHandler = Handler(Looper.getMainLooper())
    private var activeHudView: View? = null

    fun showConfirmation(
        decision: TrustDecision.RequiresConfirmation,
        onConfirmed: (TrustDecision.Authorized) -> Unit,
        onCancelled: () -> Unit
    ) {
        mainHandler.post {
            dismissActive()
            try {
                val inflater = LayoutInflater.from(context)
                val view = inflater.inflate(R.layout.overlay_incoming_call, null, false)
                val tvTitle = view.findViewById<TextView>(R.id.callerName)
                val tvDesc = view.findViewById<TextView>(R.id.spamBadge)
                val btnAllow = view.findViewById<Button>(R.id.btnGuideDelivery)
                val btnCancel = view.findViewById<Button>(R.id.btnAiBouncer)

                tvTitle?.text = decision.displayMessage
                tvDesc?.text = "CHATR Trust: Medium Risk (${(decision.riskScore * 100).toInt()}%)"
                btnAllow?.text = decision.confirmationLabel
                btnCancel?.text = decision.cancelLabel

                btnAllow?.setOnClickListener {
                    dismissActive()
                    val authorized = TrustDecision.Authorized(
                        intent = decision.intent,
                        riskScore = decision.riskScore,
                        riskTier = decision.riskTier,
                        reason = "User approved via Trust HUD"
                    )
                    onConfirmed(authorized)
                }

                btnCancel?.setOnClickListener {
                    dismissActive()
                    onCancelled()
                }

                val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                } else {
                    @Suppress("DEPRECATION")
                    WindowManager.LayoutParams.TYPE_PHONE
                }

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    layoutType,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                    y = 100
                }

                windowManager.addView(view, params)
                activeHudView = view
                Log.i(TAG, "Trust HUD displayed for action: ${decision.intent.action}")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to display Trust HUD window", e)
                onCancelled()
            }
        }
    }

    fun dismissActive() {
        activeHudView?.let { view ->
            try {
                windowManager.removeView(view)
            } catch (e: Exception) {
                Log.w(TAG, "Error removing active HUD view", e)
            }
            activeHudView = null
        }
    }

    companion object {
        private const val TAG = "TrustHudController"
    }
}
