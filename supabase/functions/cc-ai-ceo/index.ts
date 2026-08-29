// AI CEO Planner — generates strategic plans, breaks them into tasks
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the AI CEO of CHATR, a communication super-app.
You generate strategic plans for the human CEO (Founder) to approve.

Output a single JSON object with these exact fields:
{
  "title": "short plan title (max 80 chars)",
  "description": "2-4 sentence rationale and expected outcome",
  "department": "engineering" | "sales" | "marketing" | "operations" | "finance",
  "impact_level": "low" | "medium" | "high",
  "tasks": [
    { "title": "task title", "description": "what to do", "assigned_agent": "agent name" }
  ]
}

Rules:
- impact_level "high" = spending money, bulk outreach, code deployment, hiring, public announcements
- impact_level "medium" = customer-facing changes, new campaigns, integrations
- impact_level "low" = research, drafts, internal docs, monitoring
- Generate 2-5 actionable tasks per plan.
- Be concrete, ambitious, and aligned with growing CHATR.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify CEO role
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "ceo").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden — CEO role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { goal, department } = await req.json().catch(() => ({}));
    const userPrompt = goal
      ? `Generate a plan to achieve this goal: ${goal}${department ? ` (Department hint: ${department})` : ""}`
      : "Generate a fresh strategic plan that moves CHATR forward this week.";

    const aiRes = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["openrouter", "groq"],
      model: "gemini-2.5-flash",
      responseFormat: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const content = aiRes.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); } catch {
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const dept = ["engineering", "sales", "marketing", "operations", "finance"].includes(parsed.department) ? parsed.department : "operations";
    const impact = ["low", "medium", "high"].includes(parsed.impact_level) ? parsed.impact_level : "medium";
    const status = impact === "low" ? "approved" : "pending"; // auto-approve low impact

    const { data: plan, error: planErr } = await supabase
      .from("cc_plans").insert({
        title: parsed.title?.slice(0, 200) || "Untitled plan",
        description: parsed.description || "",
        department: dept,
        impact_level: impact,
        status,
        generated_by: "ai_ceo",
        payload: { tasks: parsed.tasks || [] },
        decided_at: status === "approved" ? new Date().toISOString() : null,
      }).select().single();
    if (planErr) throw planErr;

    if (Array.isArray(parsed.tasks) && parsed.tasks.length) {
      await supabase.from("cc_tasks").insert(parsed.tasks.slice(0, 10).map((t: any) => ({
        plan_id: plan.id,
        department: dept,
        title: String(t.title || "Task").slice(0, 200),
        description: String(t.description || ""),
        assigned_agent: t.assigned_agent || `${dept}_agent`,
      })));
    }

    await supabase.from("cc_logs").insert({
      agent: "ai_ceo",
      action: `Generated plan: ${plan.title}`,
      level: impact === "high" ? "warn" : "success",
      plan_id: plan.id,
      details: { department: dept, impact_level: impact, auto_approved: status === "approved" },
    });

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cc-ai-ceo error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
