#!/usr/bin/env python3
"""
write_coding_dataset.py — Generates datasets/raw/coding_sft_v2_data.json
Avoids ALL string escaping issues by using explicit list/dict construction.
Run once from the chatrchat repo root.
"""
import json
from pathlib import Path

CODING_SYSTEM = (
    "You are the CHATR coding assistant. You help developers build on the CHATR Intent OS platform. "
    "You understand the CHATR Kernel ABI v0.9 RC, Intent Object schema, EDL (Execution Definition Language), "
    "capability pack authoring, provider manifests, TypeScript and Python SDK patterns, "
    "and CHATR architecture decisions (ADRs). "
    "Provide working, correct code examples for CHATR integration."
)


def row(user, assistant):
    return {"messages": [
        {"role": "system", "content": CODING_SYSTEM},
        {"role": "user", "content": user},
        {"role": "assistant", "content": assistant}
    ]}


ROWS = [
    row(
        "How do I define a CHATR Intent Object in TypeScript?",
        "Use an IntentObject interface with: id (UUID v4, immutable), version (semver), "
        "user_text (verbatim original utterance, immutable), capability (domain.verb format), "
        "lifecycle ({phase: 'CREATED'|'PLANNED'|'EXECUTING'|'STEWARDED'|'ARCHIVED', "
        "condition: 'HEALTHY'|'DEGRADED'|'FAILED'|null}), policy ({version, owner, applies_to}), "
        "stewardship (present only when phase=STEWARDED), history (append-only string[]), "
        "created_at/updated_at (ISO 8601 UTC), and optional fields execution_result, "
        "verification_result, plan, tags (all null by default). "
        "Factory: const intent = createIntentObject(userText, capability, policyOwner) "
        "sets phase=CREATED, condition=HEALTHY, history=[], timestamps=now."
    ),
    row(
        "How do I author a CHATR EDL capability pack object in JSON?",
        "An EDL object JSON has these top-level fields: "
        "urn (string, format: urn:chatr:object:domain:type), "
        "type (PascalCase string like Candidate or Aircraft), "
        "name (human-readable), "
        "primitiveType (LivingObject for stateful business entities), "
        "metadata (object), "
        "properties (array of {key, type, required}), "
        "relationships (array of {predicate, class, targetType, required, multiple}), "
        "lifecycle ({initialState, states:[{name}], "
        "transitions:[{from:[], to, triggeredByEvent, requiredPolicies?:[]}]}), "
        "eventsProduced (string[]). "
        "Example: Candidate EDL has 6 lifecycle states (applied->screening->interview->offer->hired|rejected), "
        "transition to offer requires policy urn:chatr:policy:background-check, "
        "and emits CandidateCreated and CandidateTransitioned events."
    ),
    row(
        "How do I call the CHATR Ollama chatr:general-v2 model from Python?",
        "Use the Ollama REST API: POST http://localhost:11434/api/chat "
        "with body: model=chatr:general-v2, messages=[{role:user, content:question}], stream=false. "
        "Parse response.json()[message][content]. "
        "Identity test: assert 'Intent' in answer and 'Operating System' in answer. "
        "If model returns 'Chatroulette' or 'chatroom', the model is not fine-tuned — retrain. "
        "Set timeout=120 for generation. Use requests.post() with json= param."
    ),
    row(
        "What is the correct soup.yaml config for QLoRA SFT on Qwen 2.5 7B on a T4 GPU?",
        "Critical settings for T4: "
        "model.name=Qwen/Qwen2.5-7B-Instruct, model.trust_remote_code=true, "
        "training.method=sft, training.precision=fp16 (NEVER bf16 on T4 — breaks gradient scaler), "
        "training.batch_size=2, training.gradient_accumulation_steps=8 (effective batch 16), "
        "training.learning_rate=2.0e-4, training.lr_scheduler=cosine, training.warmup_ratio=0.05, "
        "training.seed=1234, training.max_seq_length=2048, "
        "peft.method=lora, peft.r=16, peft.alpha=32, peft.dropout=0.05, "
        "peft.target_modules=[q_proj,v_proj,k_proj,o_proj,gate_proj,up_proj,down_proj], "
        "quantization.load_in_4bit=true, quantization.bnb_4bit_quant_type=nf4, "
        "quantization.bnb_4bit_compute_dtype=float16 (not bfloat16), "
        "output.merge=true, output.export_gguf=true, output.gguf_quant=q4_k_m. "
        "Data: data.format=chatml for Qwen 2.5 ChatML chat template."
    ),
    row(
        "How do I validate a CHATR JSONL training dataset in Python?",
        "Read file bytes, compute SHA-256 with hashlib.sha256(). "
        "Parse each non-empty line as JSON (json.loads). "
        "For each row: check messages is a list with >= 2 entries, "
        "extract roles set, assert 'user' in roles and 'assistant' in roles, "
        "check each message has non-empty role and content >= 10 chars. "
        "Accumulate errors. Return (is_valid, sha256_digest, errors). "
        "Store digest in data/_registry.json sha256 field for integrity verification. "
        "Duplicate detection: use set() of (user_text, assistant_text) tuples."
    ),
    row(
        "How do I run a real SOUP training job and verify it produced real weights?",
        "Run: python -m soup train --config configs/general_sft_v2.yaml --output runs/chatr_general_v2. "
        "Verify: adapter_path = runs/chatr_general_v2/adapter_model.safetensors must exist. "
        "adapter_path.stat().st_size must be >= 1_000_000 bytes (1 MB). "
        "The original CHATR mock wrote 60-byte ASCII stubs — reject any adapter < 1 MB. "
        "Real QLoRA adapters for Qwen 2.5 7B r=16 targeting 7 modules are 50-200 MB. "
        "Also check that adapter_config.json exists and contains correct base_model and lora_r fields."
    ),
    row(
        "How do I export a trained model to GGUF for Ollama?",
        "Primary: python -m soup export --model runs/chatr_general_v2_merged "
        "--format gguf --quant q4_k_m --output data/models/chatr_general_v2.gguf. "
        "Fallback (if soup export fails): "
        "(1) python llama.cpp/convert_hf_to_gguf.py runs/chatr_general_v2_merged "
        "--outtype f16 --outfile runs/chatr_general_v2.f16.gguf. "
        "(2) llama.cpp/quantize runs/chatr_general_v2.f16.gguf "
        "data/models/chatr_general_v2.gguf Q4_K_M. "
        "Verify: GGUF file must exist and be >= 100 MB before proceeding to Ollama registration."
    ),
    row(
        "How do I use TRL SFTTrainer as a fallback when soup train fails on T4?",
        "Configure BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', "
        "bnb_4bit_compute_dtype=torch.float16, bnb_4bit_use_double_quant=True). "
        "Load Qwen/Qwen2.5-7B-Instruct with quantization_config and device_map='auto'. "
        "Apply LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, "
        "target_modules=[q_proj,v_proj,k_proj,o_proj,gate_proj,up_proj,down_proj], bias='none'). "
        "SFTConfig: fp16=True, bf16=False (critical — bf16 breaks T4 gradient scaler). "
        "After training: model.merge_and_unload() then save_pretrained to merged dir. "
        "Then convert merged HF model to GGUF via llama.cpp."
    ),
    row(
        "How do I register a CHATR model in Ollama with a Modelfile?",
        "Build Modelfile content: "
        "Line 1: FROM /absolute/path/to/data/models/chatr_general_v2.gguf "
        "(must be absolute path to real GGUF >= 100 MB). "
        "PARAMETER lines: temperature 0.7, top_p 0.9, top_k 40, num_ctx 4096, repeat_penalty 1.1. "
        "SYSTEM block: capability-specific system prompt in triple-quoted string. "
        "Write to temp file, run: ollama create chatr:general-v2 -f /tmp/Modelfile. "
        "Then: ollama tag chatr:general-v2 chatr:general-latest. "
        "Verify with: ollama run chatr:general-v2 'What is CHATR?' and assert 'Intent' in response."
    ),
    row(
        "How do I verify a registered chatr:general-v2 model is real?",
        "Run 4 verification checks: "
        "(1) Identity: ollama run chatr:general-v2 'What is CHATR?' — "
        "assert 'Intent' in response AND 'Operating System' in response "
        "AND 'Chatroulette' NOT in response. "
        "(2) Domain knowledge: ask 'What is the 80% Interface Removal Mandate?' — "
        "assert '4' in response and 'anchor' in response.lower(). "
        "(3) Regression: ask 'What is 2+2?' — assert '4' in response. "
        "(4) Weight divergence: ollama show --json chatr:general-v2, "
        "assert digest field differs from phi3:mini digest. "
        "All 4 must pass. Failure = model is vanilla phi3:mini or not trained."
    ),
    row(
        "How do I add a Human Approval Gate in CHATR TypeScript?",
        "Before executing any intent, call checkApprovalGates(intent, context). "
        "Financial gate: if context.amount_inr > 50_000, return "
        "{allowed:false, requiresHumanApproval:true, policyUrn:'urn:chatr:policy:payout-threshold-50k'}. "
        "PII gate: if capability starts with 'data.export' AND context.containsPii, "
        "return {allowed:false, policyUrn:'urn:chatr:policy:pii-export-restriction'}. "
        "If not allowed: transitionLifecycle(intent, 'NEEDS_APPROVAL'), "
        "emitEvent('ApprovalGateTriggered', {intentId, policyUrn}), then RETURN. "
        "NEVER skip approval gates. Policy always precedes execution (Kernel Constitution Principle 2)."
    ),
    row(
        "How do I write a CHATR provider manifest JSON?",
        "Provider manifest JSON structure: "
        "manifest_version (string), provider_id (dot-delimited: domain.provider like stripe.payments), "
        "display_name, description, auth ({type:'oauth2', scopes:[...]}), "
        "capabilities (array of {id, description, input_schema, output_schema, policies_required}), "
        "events_subscribed (string[]), events_emitted (string[]). "
        "Each capability input/output schema field: {type:'string'|'integer'|'array'|'boolean', required:true/false}. "
        "policies_required lists policy URNs: urn:chatr:policy:payment-authorization. "
        "Event names use PascalCase past-tense verbs: PaymentCompleted, CandidateHired."
    ),
    row(
        "How do I create a recurring stewarded intent in CHATR?",
        "Call kernel.createIntent({user_text, capability, policy}). "
        "Then kernel.transitionLifecycle(intent.id, 'STEWARDED', {stewardship: {"
        "next_trigger_at: ISO8601 UTC string, trigger_type: string, trigger_count: 0}}). "
        "On kernel restart, StewardshipRuntime.restore() re-activates all STEWARDED intents (OS Principle 20). "
        "The kernel owns lifecycle — runtimes implement behavior (Constitution Principle 5). "
        "History is append-only — never delete or modify history entries. "
        "Stewardship metadata is written only by the Stewardship Runtime, not by user code."
    ),
    row(
        "How does CHATR Policy Engine prevent unauthorized fund transfers in code?",
        "The Policy Engine checks every external action BEFORE execution (OS Principle 12). "
        "Financial check: compare amount_inr to threshold (50000 INR). "
        "If exceeded: do NOT execute, transition intent to NEEDS_APPROVAL phase, "
        "emit ApprovalGateTriggered event with policyUrn='urn:chatr:policy:payout-threshold-50k', "
        "wait for CFO approval. Only proceed if an approved CFO approval exists in the database within 24h. "
        "Log all checks with traceId, policy_urn, requester_id, amount_inr for immutable audit. "
        "Every external action must be policy-checked (Kernel Constitution Principle 2)."
    ),
    row(
        "How do I stream real-time intent execution state in CHATR via WebSocket?",
        "Emit IntentStreamEvent objects: {type, intentId, step, timestamp}. "
        "type values and icons: thinking=brain (parsing intent), planning=clipboard (composing DAG), "
        "executing=gear (running connector calls), needs_approval=pause (Human Approval Gate triggered), "
        "completed=checkmark (verification passed), error=X (pipeline failed). "
        "Send via ws.send(JSON.stringify(event)). "
        "This satisfies CHATR OS Principle 9: everything important is observable. "
        "UI must display these states to maintain CHATR's trust contract with users."
    ),
    row(
        "How do I write a CHATR SFT training row in Python?",
        "A CHATR SFT training row: {messages: [{role:system, content:SYSTEM_PROMPT}, "
        "{role:user, content:question}, {role:assistant, content:answer}]}. "
        "Validation: user content must be non-empty string, "
        "assistant content must be >= 50 chars (short = low quality), "
        "system must be non-empty. "
        "Write with json.dumps(row, ensure_ascii=False) per line to JSONL. "
        "ChatML format is compatible with Qwen 2.5 when soup.yaml uses data.format=chatml."
    ),
    row(
        "How do I register TalentXcel capabilities in the CHATR kernel?",
        "Use registry.registerCapability() for each: "
        "recruitment.screen_candidate: inputSchema={candidate_id:string required, role_id:string required}, "
        "outputSchema={score:number, recommendation:string, next_stage:string}, "
        "policies=['urn:chatr:policy:background-check'], "
        "eventsEmitted=['CandidateScreeningStarted','CandidateTransitioned']. "
        "recruitment.schedule_interview: inputSchema={candidate_id:string required, interviewer_ids:array required}, "
        "outputSchema={interview_id:string, scheduled_at:string, meeting_link:string}, "
        "policies=[], eventsEmitted=['CandidateInterviewScheduled']. "
        "Capability IDs use domain.verb format. Provider=hr.talentxcel_core."
    ),
    row(
        "How do I validate a CHATR Intent Object schema in Python?",
        "Check these rules: "
        "id must match UUID v4 regex (^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$). "
        "version must match semver (^\\d+\\.\\d+\\.\\d+$). "
        "user_text must be non-empty string. "
        "capability must match domain.verb (^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$). "
        "lifecycle.phase must be in {CREATED,PLANNED,EXECUTING,STEWARDED,ARCHIVED}. "
        "lifecycle.condition must be in {HEALTHY,DEGRADED,FAILED,None}. "
        "If phase=ARCHIVED then condition must be None. "
        "history must be a list. "
        "created_at and updated_at must parse as ISO 8601 UTC."
    ),
    row(
        "How do I use the CHATR adapter registry Python API?",
        "Import: from scripts.ai_training.adapter_registry import register_adapter, resolve_runtime_model, print_registry_summary. "
        "Register after real training: register_adapter(capability='general', version='v2.0.0', "
        "base_model='Qwen/Qwen2.5-7B-Instruct', adapter_path='data/models/chatr_general_v2.gguf', "
        "dataset_id='general_sft_v2', soup_version='0.73.3', "
        "metrics={'loss':0.42,'accuracy':0.91,'verdict':'SHIP'}, state='VALIDATED_REAL'). "
        "state must be 'VALIDATED_REAL' — never 'SHIP' or 'VALIDATED_PHASE0' for untrained models. "
        "resolve_runtime_model('general') returns the Ollama model tag: chatr:general-v2."
    ),
    row(
        "What is the correct Ollama Modelfile structure for a CHATR capability model?",
        "Line 1: FROM /absolute/path/to/data/models/chatr_CAPABILITY_v2.gguf "
        "(MUST be absolute path, file must exist and be >= 100 MB). "
        "PARAMETER block: temperature 0.7, top_p 0.9, top_k 40, num_ctx 4096, repeat_penalty 1.1. "
        "SYSTEM block: capability-specific prompt — "
        "General: 'You are the CHATR AI assistant. CHATR is an Intent-First Business Operating System...', "
        "Coding: 'You are the CHATR coding assistant...', "
        "Meera: 'You are Meera, a vibrant 22-year-old content creator from Delhi...'. "
        "Register: ollama create chatr:CAPABILITY-v2 -f Modelfile. "
        "Tag: ollama tag chatr:CAPABILITY-v2 chatr:CAPABILITY-latest."
    ),
]

output_path = Path("c:/Users/Arshid.Wani/chatrchat/datasets/raw/coding_sft_v2_data.json")
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps(ROWS, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Written {len(ROWS)} coding rows to {output_path}")
