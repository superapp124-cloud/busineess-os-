package com.chatr.app.services

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telecom.TelecomManager
import android.util.Log
import org.json.JSONObject

/**
 * ChatrTelecomRoleManager
 *
 * Central authority for requesting and validating Android Telecom roles:
 * - ROLE_DIALER: Qualifies CHATR as the default phone app (InCallService UI, call logs, full audio routing)
 * - ROLE_CALL_SCREENING: Allows CHATR CallScreeningService to screen incoming carrier calls pre-ring
 */
object ChatrTelecomRoleManager {

    private const val TAG = "ChatrTelecomRoleManager"
    const val REQUEST_CODE_DIALER_ROLE = 10091
    const val REQUEST_CODE_SCREENING_ROLE = 10092

    /**
     * Checks if CHATR is currently held as the system Default Phone / Dialer.
     */
    fun isDefaultDialer(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(RoleManager::class.java)
            roleManager?.isRoleHeld(RoleManager.ROLE_DIALER) ?: false
        } else {
            val telecomManager = context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
            telecomManager?.defaultDialerPackage == context.packageName
        }
    }

    /**
     * Checks if CHATR is held as the system Call Screening role.
     */
    fun isCallScreeningRoleHeld(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(RoleManager::class.java)
            roleManager?.isRoleHeld(RoleManager.ROLE_CALL_SCREENING) ?: false
        } else {
            // Pre-Android 10 did not have ROLE_CALL_SCREENING
            true
        }
    }

    /**
     * Creates the Intent to request the Default Dialer role.
     * Returns null if role is already held or not available.
     */
    fun createDefaultDialerRequestIntent(context: Context): Intent? {
        if (isDefaultDialer(context)) {
            Log.i(TAG, "CHATR is already the default dialer.")
            return null
        }

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(RoleManager::class.java)
            if (roleManager?.isRoleAvailable(RoleManager.ROLE_DIALER) == true) {
                roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
            } else {
                Log.w(TAG, "ROLE_DIALER not available on this device.")
                null
            }
        } else {
            @Suppress("DEPRECATION")
            Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER).apply {
                putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, context.packageName)
            }
        }
    }

    /**
     * Creates the Intent to request the Call Screening role (Android 10+).
     */
    fun createCallScreeningRequestIntent(context: Context): Intent? {
        if (isCallScreeningRoleHeld(context)) {
            Log.i(TAG, "CHATR already holds the call screening role.")
            return null
        }

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(RoleManager::class.java)
            if (roleManager?.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING) == true) {
                roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
            } else {
                Log.w(TAG, "ROLE_CALL_SCREENING not available on this device.")
                null
            }
        } else {
            null
        }
    }

    /**
     * Launches the system dialog to prompt the user to make CHATR their Default Phone app.
     */
    fun requestDefaultDialerRole(activity: Activity, requestCode: Int = REQUEST_CODE_DIALER_ROLE): Boolean {
        val intent = createDefaultDialerRequestIntent(activity) ?: return false
        return try {
            activity.startActivityForResult(intent, requestCode)
            Log.i(TAG, "Dispatched system prompt for Default Phone / Dialer role.")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch default dialer request intent", e)
            false
        }
    }

    /**
     * Launches the system dialog to prompt the user to grant Call Screening role.
     */
    fun requestCallScreeningRole(activity: Activity, requestCode: Int = REQUEST_CODE_SCREENING_ROLE): Boolean {
        val intent = createCallScreeningRequestIntent(activity) ?: return false
        return try {
            activity.startActivityForResult(intent, requestCode)
            Log.i(TAG, "Dispatched system prompt for Call Screening role.")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch call screening request intent", e)
            false
        }
    }

    /**
     * Returns comprehensive JSON status of all Telecom capabilities.
     */
    fun getTelecomStatus(context: Context): JSONObject {
        val telecomManager = context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
        val defaultDialerPkg = telecomManager?.defaultDialerPackage ?: "unknown"
        val isDefault = isDefaultDialer(context)
        val isScreeningHeld = isCallScreeningRoleHeld(context)
        val isInCall = try {
            telecomManager?.isInCall ?: false
        } catch (_: Exception) {
            false
        }

        return JSONObject().apply {
            put("isDefaultDialer", isDefault)
            put("isCallScreeningHeld", isScreeningHeld)
            put("currentDefaultDialerPackage", defaultDialerPkg)
            put("isInCall", isInCall)
            put("packageName", context.packageName)
        }
    }
}
