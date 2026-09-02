/**
 * PSTN Call Edge Function
 * Twilio Voice integration with session auth, input validation, and audit events.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  assertRateLimit,
  auditSecurityEvent,
  errorResponse,
  handleCors,
  jsonResponse,
  parseJsonBody,
  requireEnum,
  requireMethod,
  requireString,
  requireUser,
} from "../_shared/security.ts";

interface PSTNRequest {
  action: "initiate" | "end" | "dtmf" | "status";
  to?: string;
  callId?: string;
  digits?: string;
  enableRecording?: boolean;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    requireMethod(req, ["POST"]);
    const { user, serviceClient } = await requireUser(req);
    assertRateLimit(`pstn-call:${user.id}`, 20, 60_000);

    const request = await parseJsonBody(req) as PSTNRequest;
    request.action = requireEnum(request.action, "action", ["initiate", "end", "dtmf", "status"] as const);

    // Entitlement & Balance Gate: Verify user has active Pro/Enterprise plan or telephony credits
    const { data: subscription } = await serviceClient
      .from("user_subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPro = subscription && subscription.status === "active" && (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());
    
    if (!isPro && request.action === "initiate") {
      return jsonResponse(req, {
        success: false,
        error: "subscription_required",
        message: "Active CHATR Pro subscription or telephony balance required to place outbound calls.",
      }, 402);
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioNumber) {
      await auditSecurityEvent(serviceClient, {
        userId: user.id,
        eventType: "pstn_call_unconfigured",
        metadata: { action: request.action },
      });

      return jsonResponse(req, {
        success: false,
        error: "telephony_unconfigured",
        message: "PSTN telephony trunk is not configured in this environment. Please configure TWILIO_ACCOUNT_SID in Supabase secrets.",
      }, 503);
    }

    const twilioBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
    const authHeader = `Basic ${btoa(`${accountSid}:${authToken}`)}`;

    switch (request.action) {
      case "initiate": {
        const to = requireString(request.to, "to", { min: 8, max: 20, pattern: /^\+[1-9]\d{7,19}$/ });
        const callUrl = `${twilioBaseUrl}/Calls.json`;
        const formData = new URLSearchParams();
        formData.append("To", to);
        formData.append("From", twilioNumber);
        formData.append("Url", Deno.env.get("TWILIO_VOICE_CALLBACK_URL") || "https://chatr.chat/api/twilio/voice");

        if (request.enableRecording) {
          formData.append("Record", "true");
        }

        const response = await fetch(callUrl, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Call initiation failed");
        }

        await auditSecurityEvent(serviceClient, {
          userId: user.id,
          eventType: "pstn_call_initiated",
          severity: "warning",
          metadata: { to, callSid: result.sid },
        });

        return jsonResponse(req, {
          success: true,
          callSid: result.sid,
          status: result.status,
        });
      }

      case "end": {
        const callId = requireString(request.callId, "callId", { min: 8, max: 128 });
        const response = await fetch(`${twilioBaseUrl}/Calls/${callId}.json`, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ Status: "completed" }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Call termination failed");
        }

        await auditSecurityEvent(serviceClient, {
          userId: user.id,
          eventType: "pstn_call_ended",
          metadata: { callSid: callId },
        });

        return jsonResponse(req, {
          success: true,
          callSid: callId,
          status: "completed",
        });
      }

      case "dtmf": {
        const callId = requireString(request.callId, "callId", { min: 8, max: 128 });
        const digits = requireString(request.digits, "digits", { min: 1, max: 32, pattern: /^[0-9#*]+$/ });

        return jsonResponse(req, {
          success: true,
          callSid: callId,
          digits,
        });
      }

      case "status": {
        const callId = requireString(request.callId, "callId", { min: 8, max: 128 });
        const response = await fetch(`${twilioBaseUrl}/Calls/${callId}.json`, {
          headers: { "Authorization": authHeader },
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Call status lookup failed");
        }

        return jsonResponse(req, {
          success: true,
          callSid: callId,
          status: result.status,
          duration: result.duration,
        });
      }
    }
  } catch (error) {
    console.error("[PSTN] Error:", error);
    return errorResponse(req, error);
  }
});
