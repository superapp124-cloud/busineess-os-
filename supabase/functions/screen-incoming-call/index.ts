import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  assertRateLimit,
  auditSecurityEvent,
  errorResponse,
  handleCors,
  jsonResponse,
  parseJsonBody,
  requireMethod,
  requireSameUser,
  requireString,
  requireUser,
  requireUuid,
} from "../_shared/security.ts";
import { completeChat } from "../_core/aiProvider.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    requireMethod(req, ["POST"]);
    const { user, serviceClient } = await requireUser(req);
    assertRateLimit(`screen-incoming-call:${user.id}`, 60, 60_000);

    const body = await parseJsonBody(req);
    const receiverId = requireSameUser(user.id, body.receiver_id);
    const callerId = body.caller_id ? requireUuid(body.caller_id, "caller_id") : null;
    const callerPhone = body.caller_phone ? requireString(body.caller_phone, "caller_phone", { min: 5, max: 32 }) : null;

    if (!callerId && !callerPhone) {
      return jsonResponse(req, { error: "caller and receiver info required" }, 400);
    }

    let callerProfile = null;
    let trustScore = null;

    if (callerId) {
      const [profileRes, trustRes] = await Promise.all([
        serviceClient.from("profiles").select("username, avatar_url, primary_handle, phone_number").eq("id", callerId).single(),
        serviceClient.from("user_trust_scores").select("trust_score, verification_level").eq("user_id", callerId).single(),
      ]);
      callerProfile = profileRes.data;
      trustScore = trustRes.data;
    } else if (callerPhone) {
      const { data } = await serviceClient
        .from("profiles")
        .select("id, username, avatar_url, primary_handle")
        .eq("phone_number", callerPhone)
        .maybeSingle();

      if (data) {
        callerProfile = data;
        const { data: ts } = await serviceClient
          .from("user_trust_scores")
          .select("trust_score, verification_level")
          .eq("user_id", data.id)
          .single();
        trustScore = ts;
      }
    }

    let contactIntel = null;
    if (callerId) {
      const { data } = await serviceClient
        .from("contact_intelligence")
        .select("pickup_likelihood, preferred_route, total_calls, missed_calls, last_outcome")
        .eq("user_id", receiverId)
        .eq("contact_id", callerId)
        .maybeSingle();
      contactIntel = data;
    }

    let spamCount = 0;
    if (callerId) {
      const { count } = await serviceClient
        .from("trust_factors")
        .select("*", { count: "exact", head: true })
        .eq("user_id", callerId)
        .eq("factor_type", "spam_report");
      spamCount = count || 0;
    }

    let isBlocked = false;
    if (callerId) {
      const { data } = await serviceClient
        .from("blocked_contacts")
        .select("id")
        .eq("user_id", receiverId)
        .eq("blocked_user_id", callerId)
        .maybeSingle();
      isBlocked = !!data;
    }

    const score = trustScore?.trust_score ?? 50;
    let riskLevel: "safe" | "medium" | "high" = "medium";
    let intent = "unknown";
    let confidence = 50;

    if (isBlocked) {
      riskLevel = "high";
      intent = "blocked_contact";
      confidence = 100;
    } else if (spamCount > 3) {
      riskLevel = "high";
      intent = "likely_spam";
      confidence = 85 + Math.min(spamCount * 2, 10);
    } else if (score >= 80 && contactIntel) {
      riskLevel = "safe";
      intent = "known_contact";
      confidence = 90;
    } else if (score >= 60) {
      riskLevel = "safe";
      intent = "verified_user";
      confidence = 75;
    } else if (score < 30) {
      riskLevel = "high";
      intent = "suspicious";
      confidence = 70;
    }

    let aiScreening: { intent?: string; confidence?: number; summary?: string } | null = null;
    let fallbackToTier2 = false;

    // Advanced screening via CHATR AI Router for unknown / borderline callers
    if (!isBlocked && spamCount <= 3 && (riskLevel === "medium" || riskLevel === "high")) {
      try {
        const chatResult = await completeChat({
          messages: [
            {
              role: "system",
              content: 'You are a call screening AI. Analyze the caller data and provide a brief intent classification. Respond in JSON format: {"intent": "personal|business|sales|fraud|unknown", "confidence": 0-100, "summary": "brief description"}',
            },
            {
              role: "user",
              content: JSON.stringify({
                caller_name: callerProfile?.username,
                trust_score: score,
                spam_reports: spamCount,
                call_history: contactIntel ? {
                  total_calls: contactIntel.total_calls,
                  missed: contactIntel.missed_calls,
                  pickup_rate: contactIntel.pickup_likelihood,
                } : null,
                is_registered: !!callerProfile,
              }),
            },
          ],
          temperature: 0.2,
          maxTokens: 300,
          responseFormat: { type: "json_object" },
        });

        const text = chatResult.content || "";
        const clean = text.replace(/^```json\s*|```$/g, "").trim();
        const parsed = JSON.parse(clean);
        if (parsed && typeof parsed.intent === "string") {
          aiScreening = parsed;
          intent = parsed.intent;
          if (typeof parsed.confidence === "number") {
            confidence = parsed.confidence;
          }
        } else {
          fallbackToTier2 = true;
        }
      } catch (routerErr) {
        console.warn("[screen-incoming-call] AI screening unavailable, using local rules fallback:", routerErr);
        fallbackToTier2 = true;
      }
    } else if (riskLevel === "medium" || riskLevel === "high") {
      fallbackToTier2 = true;
    }

    await auditSecurityEvent(serviceClient, {
      userId: user.id,
      eventType: "incoming_call_screened",
      metadata: { callerId, hasCallerPhone: !!callerPhone, riskLevel, intent },
    });

    const finalSummary = aiScreening?.summary || (
      fallbackToTier2 ? "Unknown intent. Resolving locally on-device (Tier 2)..." : (
        riskLevel === "safe" ? "Trusted caller" :
        riskLevel === "high" ? "Exercise caution" :
        "Unknown caller"
      )
    );

    return jsonResponse(req, {
      caller: {
        name: callerProfile?.username || "Unknown",
        avatar: callerProfile?.avatar_url,
        handle: callerProfile?.primary_handle ? `@${callerProfile.primary_handle}` : null,
        is_registered: !!callerProfile,
      },
      trust: {
        score,
        level: trustScore?.verification_level || "unverified",
        tier: score >= 70 ? "safe" : score >= 40 ? "unknown" : "risky",
      },
      screening: {
        risk_level: riskLevel,
        intent,
        confidence,
        summary: finalSummary,
        fallback_tier_2: fallbackToTier2,
        is_blocked: isBlocked,
        spam_reports: spamCount,
      },
      history: contactIntel ? {
        total_calls: contactIntel.total_calls,
        pickup_rate: Math.round((contactIntel.pickup_likelihood || 0) * 100),
        preferred_route: contactIntel.preferred_route,
      } : null,
    });
  } catch (error) {
    console.error("Call screening error:", error);
    return errorResponse(req, error);
  }
});
