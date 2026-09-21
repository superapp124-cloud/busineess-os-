import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Structured prompts for the legacy action-based callers (useAIChatFeatures)
const ACTIONS: Record<string, { system: string; user: (b: any) => string }> = {
  "smart-reply": {
    system:
      'Generate 3 natural reply suggestions with varying tones. Respond with JSON: {"replies":[{"text":string,"tone":"professional"|"friendly"|"quick"}]}',
    user: (b) => `Message: "${b.messageText ?? ""}"`,
  },
  summarize: {
    system:
      'Summarize the conversation concisely. Respond with JSON: {"summary":string,"keyPoints":string[],"actionItems":string[]}',
    user: (b) =>
      (b.messages ?? []).map((m: any) => `${m.role}: ${m.content}`).join("\n") || "No messages provided",
  },
  "extract-tasks": {
    system:
      'Extract actionable tasks. Respond with JSON: {"tasks":[{"title":string,"priority":"low"|"medium"|"high","dueDate":string,"category":string}]}',
    user: (b) => `Message: "${b.messageText ?? ""}"`,
  },
  "sentiment-analysis": {
    system:
      'Analyze sentiment. Respond with JSON: {"sentiment":"positive"|"neutral"|"negative","confidence":number,"suggestedReactions":string[],"tone":string}',
    user: (b) => `Message: "${b.messageText ?? ""}"`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json();
    const { action, prompt, messageText, system_prompt, messages } = body ?? {};

    // Structured action path — preserves existing UI hooks (useAIChatFeatures)
    if (action && ACTIONS[action]) {
      const spec = ACTIONS[action];
      const userContent = spec.user(body);

      const chatResult = await completeChat({
        messages: [
          { role: "system", content: spec.system },
          { role: "user", content: userContent },
        ],
        responseFormat: { type: "json_object" },
      });

      const text = chatResult.content || "";
      let data: any;
      try {
        const clean = text.replace(/^```json\s*|```$/g, "").trim();
        data = JSON.parse(clean);
      } catch {
        data = action === "summarize" ? { summary: text } : { raw: text };
      }

      if (action === "smart-reply" && Array.isArray(data?.replies)) {
        data.replies = data.replies.map((r: any) =>
          typeof r === "string" ? { text: r, tone: "friendly" } : r,
        );
      }

      return json({ success: true, data, model: chatResult.model });
    }

    // Generic prompt path
    let userText = prompt || messageText || "";
    if (!userText && messages && Array.isArray(messages)) {
      userText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    }

    if (!userText) {
      return json({ error: "No prompt or messageText provided." }, 400);
    }

    const systemInstruction =
      system_prompt || "You are CHATR AI — a helpful, intelligent, and concise executive assistant. Provide professional, action-oriented responses.";

    const chatResult = await completeChat({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userText },
      ],
    });

    const text = chatResult.content || "";

    return json({
      success: true,
      response: text,
      summary: text,
      model: chatResult.model,
    });

  } catch (error: unknown) {
    console.error("[ai-chat-assistant] Error:", error);
    const status = error instanceof PlatformError ? error.status : 500;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return json({ error: errorMessage }, status);
  }
});
