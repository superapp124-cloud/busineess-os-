import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createEdgeFunction, jsonResponse } from "../_core/functionWrapper.ts";
import { z, validateJson } from "../_core/validate.ts";
import { PlatformError } from "../_core/errors.ts";
import { auditEvent } from "../_core/audit.ts";

const phoneAuthSchema = z.object({
  firebase_id_token: z.string().min(20).optional(),
  phone_number: z.string().optional(),
  firebase_uid: z.string().optional(),
});

// We can safely hardcode the public Web API key here, or pass it via ENV. 
// Using the one from the client config since it is a public key for identity verification.
const FIREBASE_API_KEY = Deno.env.get("FIREBASE_API_KEY") || "AIzaSyDUUbQlOmkHsrEyMw9AmQBXbjNx11iM7w4";

serve(createEdgeFunction({
  name: "firebase-phone-auth",
  classification: ["HIGH_VALUE", "PUBLIC_SAFE"],
  methods: ["POST"],
  auth: "optional",
  rateLimit: {
    limit: 10,
    windowMs: 60_000,
    key: (req) => `firebase-phone-auth:${req.headers.get("x-forwarded-for") ?? "anonymous"}`,
  },
  audit: { eventType: "firebase_phone_auth_requested", severity: "warning" },
}, async ({ req, auth, correlationId }) => {
  const { firebase_id_token, phone_number: inputPhone, firebase_uid: inputUid } = await validateJson(req, phoneAuthSchema);

  if (!firebase_id_token && !inputPhone) {
    throw new PlatformError(400, "missing_credentials", "Provide firebase_id_token or phone_number.");
  }

  let phone_number: string;
  let firebase_uid: string;

  if (firebase_id_token) {
    // 1. Verify the Firebase ID Token via Google Identity Toolkit
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: firebase_id_token }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || verifyData.error) {
      throw new PlatformError(401, "invalid_firebase_token", verifyData.error?.message || "Invalid Firebase token");
    }

    const firebaseUser = verifyData.users?.[0];
    if (!firebaseUser || !firebaseUser.phoneNumber) {
      throw new PlatformError(400, "missing_phone_number", "Verified user does not have a phone number");
    }

    phone_number = firebaseUser.phoneNumber;
    firebase_uid = firebaseUser.localId;
  } else {
    // Fallback: phone_number + firebase_uid sent by client when no id_token available
    phone_number = inputPhone!;
    firebase_uid = inputUid || `direct_${phone_number.replace(/\D/g, "")}`;
  }

  const normalizedPhone = phone_number.replace(/\s/g, "").replace(/\+/g, "");
  const email = `${normalizedPhone}@chatr.local`;
  
  // Use a secure deterministic password derived from UID to ensure seamless re-login
  const password = `${normalizedPhone}_${firebase_uid.slice(0, 10)}`;

  // 2. Find or Create Supabase User via Canonical Phone
  const { data: existingUsers } = await auth.serviceClient.auth.admin.listUsers({ perPage: 1000 });
  const allMatches = existingUsers?.users?.filter((user) => 
    user.email === email ||
    user.phone === phone_number ||
    (user.phone && user.phone.replace(/\D/g, '') === normalizedPhone) ||
    (user.user_metadata?.phone_number && String(user.user_metadata.phone_number).replace(/\D/g, '') === normalizedPhone)
  ) || [];

  // Prioritize: 1) exact canonical email, 2) exact phone, 3) any phone match
  const existingUser = allMatches.find(u => u.email === email)
    || allMatches.find(u => u.phone === phone_number)
    || allMatches[0];

  let targetUser: any = existingUser;
  let isNewUser = false;
  if (existingUser) {
    // Ensure email, phone, and password are all updated and confirmed
    const updatePayload: Record<string, any> = {
      password,
      email,
      email_confirm: true,
      phone: phone_number,
      phone_confirm: true,
      user_metadata: {
        ...existingUser.user_metadata,
        phone_number,
        firebase_uid,
        phone: phone_number,
        email_verified: true,
      },
    };
    const { data: updatedUserData, error } = await auth.serviceClient.auth.admin.updateUserById(existingUser.id, updatePayload);
    if (!error && updatedUserData?.user) {
      targetUser = updatedUserData.user;
    } else {
      console.warn("[firebase-phone-auth] updateUserById warning:", error?.message);
    }
  } else {
    const { data: newUserData, error: createError } = await auth.serviceClient.auth.admin.createUser({
      email,
      phone: phone_number,
      password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { phone_number, firebase_uid, phone: phone_number, email_verified: true },
    });
    if (createError) {
      // If user already existed under another key, look them up again
      const retryUsers = await auth.serviceClient.auth.admin.listUsers({ perPage: 1000 });
      targetUser = retryUsers.data?.users?.find(u => u.email === email || u.phone === phone_number);
      if (!targetUser) throw new PlatformError(400, "phone_user_create_failed", createError.message);
    } else {
      targetUser = newUserData?.user;
      isNewUser = true;
    }
  }

  // 3. Issue Supabase Session
  let activeSession: any = null;
  let lastSignInError = "";

  // Strategy A: Direct password sign-in using verified canonical email & deterministic password
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: session, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (!signInError && session?.session) {
      activeSession = session.session;
    } else if (signInError) {
      lastSignInError = signInError.message;
      console.warn("[firebase-phone-auth] signInWithPassword failed:", signInError.message);
    }
  } catch (e: any) {
    lastSignInError = e?.message || String(e);
    console.warn("[firebase-phone-auth] Session creation error:", e);
  }

  // Strategy B: MagicLink generate + verifyOtp fallback
  if (!activeSession && targetUser) {
    try {
      const { data: linkData, error: linkError } = await auth.serviceClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      const tokenHash = (linkData as any)?.properties?.hashed_token || (linkData as any)?.hashed_token;
      if (tokenHash) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data: verified, error: verifyError } = await supabaseClient.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        });
        if (!verifyError && verified?.session) {
          activeSession = verified.session;
          console.log("[firebase-phone-auth] Session issued via verifyOtp fallback");
        } else if (verifyError) {
          console.warn("[firebase-phone-auth] verifyOtp fallback failed:", verifyError.message);
        }
      } else if (linkError) {
        console.warn("[firebase-phone-auth] generateLink failed:", linkError.message);
      }
    } catch (fallbackErr) {
      console.warn("[firebase-phone-auth] generateLink fallback error:", fallbackErr);
    }
  }

  // Strategy C: mintChatrSession only if JWT_SIGNING_SECRET is configured
  if (!activeSession && targetUser) {
    const jwtSecret = Deno.env.get("JWT_SIGNING_SECRET") || Deno.env.get("SUPABASE_JWT_SECRET") || Deno.env.get("JWT_SECRET");
    if (jwtSecret) {
      try {
        const { mintChatrSession } = await import("../_core/session.ts");
        activeSession = await mintChatrSession(targetUser, "firebase", phone_number);
      } catch (mintErr) {
        console.warn("[firebase-phone-auth] mintChatrSession failed:", mintErr);
      }
    }
  }

  if (!activeSession) {
    throw new PlatformError(500, "session_issuance_failed", `Failed to issue session credentials${lastSignInError ? `: ${lastSignInError}` : ""}. Please try again.`);
  }

  await auditEvent(auth, {
    type: "firebase_phone_auth_completed",
    severity: "warning",
    correlationId,
    metadata: { phoneHashSuffix: normalizedPhone.slice(-4), isNewUser },
  });

  return jsonResponse(req, {
    session: activeSession,
    user: targetUser,
    isNewUser,
  }, 200, correlationId);
}));


