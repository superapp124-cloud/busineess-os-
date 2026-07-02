import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createEdgeFunction, jsonResponse } from "../_core/functionWrapper.ts";
import { z, validateJson } from "../_core/validate.ts";
import { PlatformError } from "../_core/errors.ts";
import { auditEvent } from "../_core/audit.ts";

const phoneAuthSchema = z.object({
  phone_number: z.string().min(6).max(24).regex(/^\+?[0-9\s().-]+$/),
  firebase_uid: z.string().min(4).max(160),
});

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
  const { phone_number, firebase_uid } = await validateJson(req, phoneAuthSchema);
  const normalizedPhone = phone_number.replace(/\s/g, "").replace(/\+/g, "");
  const email = `${normalizedPhone}@chatr.local`;
  const password = phone_number.replace(/\s/g, "");

  const { data: existingUsers } = await auth.serviceClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((user) => user.email === email);

  let isNewUser = false;
  if (existingUser) {
    const { error } = await auth.serviceClient.auth.admin.updateUserById(existingUser.id, {
      password,
      user_metadata: { phone_number, firebase_uid },
    });
    if (error) throw new PlatformError(400, "phone_user_update_failed", error.message);
  } else {
    const { error } = await auth.serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone_number, firebase_uid },
    });
    if (error) throw new PlatformError(400, "phone_user_create_failed", error.message);
    isNewUser = true;
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: session, error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (signInError) {
    throw new PlatformError(400, "phone_signin_failed", signInError.message);
  }

  await auditEvent(auth, {
    type: "firebase_phone_auth_completed",
    severity: "warning",
    correlationId,
    metadata: { phoneHashSuffix: normalizedPhone.slice(-4), isNewUser },
  });

  return jsonResponse(req, {
    session: session.session,
    user: session.user,
    isNewUser,
  }, 200, correlationId);
}));
