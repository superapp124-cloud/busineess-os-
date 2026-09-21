import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  assertRateLimit,
  auditSecurityEvent,
  corsHeaders,
  errorResponse,
  handleCors,
  HttpError,
  jsonResponse,
  parseJsonBody,
  requireMethod,
  requireString,
  requireUser,
  requireUuid,
} from "../_shared/security.ts";
import { completeChat, streamChat } from "../_core/aiProvider.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    requireMethod(req, ["POST"]);
    const { user, serviceClient } = await requireUser(req);
    assertRateLimit(`ai-agent-chat:${user.id}`, 30, 60_000);

    const body = await parseJsonBody(req);
    const agentId = requireUuid(body.agentId, "agentId");
    const conversationId = body.conversationId ? requireUuid(body.conversationId, "conversationId") : null;
    const message = requireString(body.message, "message", { min: 1, max: 4000 });
    const isStream = body.stream === true || req.headers.get("Accept")?.includes("text/event-stream");

    const { data: agent, error: agentError } = await serviceClient
      .from("ai_agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      throw new HttpError(404, "agent_not_found", "Agent not found");
    }

    if (conversationId) {
      const { data: participants, error: participantError } = await serviceClient
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .in("user_id", [user.id, agent.user_id]);

      if (participantError) throw participantError;

      const participantIds = new Set((participants || []).map((participant: { user_id: string }) => participant.user_id));
      if (!participantIds.has(user.id) || !participantIds.has(agent.user_id)) {
        throw new HttpError(403, "conversation_access_denied", "You are not allowed to use this agent in this conversation");
      }
    }

    let conversationHistory: Array<{ role: "assistant" | "user"; content: string }> = [];

    if (conversationId) {
      const { data: messages } = await serviceClient
        .from("messages")
        .select("content, sender_id, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(20);

      conversationHistory = messages?.map((m: { sender_id: string; content: string }) => ({
        role: m.sender_id === agent.user_id ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })) || [];
    } else if (Array.isArray(body.conversationHistory)) {
      conversationHistory = body.conversationHistory.map((m: any) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      }));
    }

    const { data: trainingData } = await serviceClient
      .from("ai_agent_training")
      .select("question, answer")
      .eq("agent_id", agentId)
      .limit(10);

    const trainingContext = trainingData?.map((t: { question: string; answer: string }) =>
      `Q: ${t.question}\nA: ${t.answer}`
    ).join("\n\n") || "";

    const systemPrompt = `You are ${agent.agent_name}, an AI assistant.
Description: ${agent.agent_description}
Personality: ${agent.agent_personality}
Purpose: ${agent.agent_purpose}
${agent.knowledge_base ? `Knowledge Base:\n${agent.knowledge_base}\n` : ""}
${trainingContext ? `Training Examples:\n${trainingContext}\n` : ""}
Keep responses concise and helpful (2-3 sentences).`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: "user" as const, content: message },
    ];

    if (isStream) {
      const streamRes = await streamChat({
        messages: chatMessages,
        maxTokens: 500,
        temperature: 0.7,
      });

      return new Response(streamRes.body, {
        headers: {
          ...corsHeaders(req),
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const aiResult = await completeChat({
      messages: chatMessages,
      maxTokens: 500,
      temperature: 0.7,
    });

    const reply = aiResult.content;
    if (!reply) throw new Error("No response from AI");

    if (conversationId) {
      await serviceClient.from("messages").insert({
        conversation_id: conversationId,
        sender_id: agent.user_id,
        content: reply,
        message_type: "text",
      });
    }

    await auditSecurityEvent(serviceClient, {
      userId: user.id,
      eventType: "ai_agent_reply_created",
      metadata: { agentId, conversationId },
    });

    return jsonResponse(req, { reply, agentName: agent.agent_name });
  } catch (error) {
    console.error("Error in ai-agent-chat:", error);
    return errorResponse(req, error);
  }
});
