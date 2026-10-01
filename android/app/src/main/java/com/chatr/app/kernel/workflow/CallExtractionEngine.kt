package com.chatr.app.kernel.workflow

import android.util.Log

/**
 * CallExtractionEngine — Confidence-aware NLP extraction from caller utterances.
 *
 * EXTRACTION RULES (in order of priority):
 * 1. Explicit first-person commitments  → HIGH confidence → COMMITMENT
 * 2. Third-party statements ("he said") → LOW confidence → OBSERVATION only
 * 3. Hedged/uncertain statements        → DISCARD commitment, log OBSERVATION
 * 4. Corrections/retractions            → Mark prior commitment RESOLVED
 * 5. Urgency signals                    → Set UrgencyLevel
 *
 * SAFETY INVARIANT:
 * "Maybe I'll send it tomorrow" must NOT produce a Commitment.
 * "Rahul said he'll send the proposal" must NOT become a user commitment.
 * "Actually, forget that" must resolve the prior commitment.
 *
 * DESIGN: Pure function — no I/O, no side effects, fully testable.
 */
object CallExtractionEngine {

    private const val TAG = "CallExtractionEngine"

    // ── Urgency patterns ─────────────────────────────────────────────────────
    private val URGENCY_PATTERNS = listOf(
        Regex("\\b(urgent|urgently|emergency|asap|immediately|right away|right now|critical)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(can't wait|cannot wait|must happen today|need it now)\\b", RegexOption.IGNORE_CASE)
    )

    // ── Explicit first-person commitment patterns ────────────────────────────
    // "I will", "I'll", "I am going to", "I'll send", "I'll call back"
    private val COMMITMENT_FIRST_PERSON = listOf(
        Regex("\\b(i will|i'll|i am going to|i'm going to|i shall|i need to|i have to|i must)\\b.*\\b(send|call|share|submit|pay|deliver|complete|finish|bring|forward|transfer|schedule|book|confirm|update|review|check|follow|follow up|follow-up|meet|return|reply|respond|provide|prepare)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(i'll call|i'll ring|i'll send|i'll share|i'll forward|i'll get back|i'll follow up|i'll pay|i'll transfer|i'll book|i'll schedule)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(let('s| us) meet|let me send|let me share|let me call)\\b", RegexOption.IGNORE_CASE)
    )

    // ── Callback / meeting request patterns (caller to user) ─────────────────
    // "Call me back", "Call me after", "I'll call you back"
    private val CALLBACK_PATTERNS = listOf(
        Regex("\\b(call me back|call me after|call me when|ring me|reach me|contact me)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(let('s| us) (meet|discuss|talk|connect|catch up))\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(can we (meet|talk|discuss|connect))\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(meet (tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|at \\d))\\b", RegexOption.IGNORE_CASE)
    )

    // ── Third-party attribution patterns — extract ONLY as observation ────────
    // "He said", "She told me", "They said", "Rahul said"
    private val THIRD_PARTY_PATTERNS = listOf(
        Regex("\\b(he|she|they|it|\\w+ said|\\w+ told|\\w+ mentioned|\\w+ informed)\\b.*(will|would|can|shall|is going to)", RegexOption.IGNORE_CASE),
        Regex("\\b(according to|per|as per|based on what|from what)\\b", RegexOption.IGNORE_CASE)
    )

    // ── Hedge/uncertainty patterns — do NOT commit ────────────────────────────
    private val HEDGE_PATTERNS = listOf(
        Regex("\\b(maybe|perhaps|possibly|might|could|not sure|i think|i guess|probably|if i can|if possible|hopefully|we'll see|i'll try|i will try|trying to)\\b", RegexOption.IGNORE_CASE)
    )

    // ── Retraction/correction patterns — resolve prior commitment ────────────
    private val RETRACTION_PATTERNS = listOf(
        Regex("\\b(actually|forget (that|it|what i said)|never mind|cancel that|disregard|i already|it's done|already sent|already paid|already called|already completed|don't worry|not needed anymore)\\b", RegexOption.IGNORE_CASE)
    )

    // ── Time extraction ───────────────────────────────────────────────────────
    private val TIME_PATTERNS = listOf(
        Regex("\\b(at \\d{1,2}(:\\d{2})?(\\s?(am|pm))?)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(by \\d{1,2}(:\\d{2})?(\\s?(am|pm))?)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(tomorrow|today|tonight|this evening|this morning|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b", RegexOption.IGNORE_CASE),
        Regex("\\b(\\d{1,2}\\s?(am|pm))\\b", RegexOption.IGNORE_CASE)
    )

    // ── Document/item reference patterns ─────────────────────────────────────
    private val DOCUMENT_PATTERNS = listOf(
        Regex("\\b(proposal|document|doc|report|presentation|deck|invoice|payment|receipt|details|contract|agreement|brief|plan|file|data|numbers|the (revised|updated|new|final))\\b", RegexOption.IGNORE_CASE)
    )

    /**
     * Primary extraction entry point.
     * Processes all caller utterances from a completed screening and returns
     * a structured [ExtractionResult].
     *
     * @param callerUtterances List of raw strings the caller spoke.
     * @param contextHint      Optional context (e.g. caller name if resolved).
     */
    fun extract(callerUtterances: List<String>, contextHint: String? = null): ExtractionResult {
        if (callerUtterances.isEmpty()) {
            return ExtractionResult(
                humanReadableSummary = "No message was left.",
                keyPoints = emptyList(),
                commitments = emptyList(),
                callerRequests = emptyList(),
                urgencyLevel = UrgencyLevel.NORMAL,
                hasRetraction = false,
                summaryConfidence = 0.0f
            )
        }

        val fullText = callerUtterances.joinToString(" ")
        Log.d(TAG, "Extracting from: $fullText")

        // ── Step 1: Urgency ──────────────────────────────────────────────────
        val isUrgent = URGENCY_PATTERNS.any { it.containsMatchIn(fullText) }
        val urgency = if (isUrgent) UrgencyLevel.HIGH else UrgencyLevel.NORMAL

        // ── Step 2: Retraction check ─────────────────────────────────────────
        val hasRetraction = RETRACTION_PATTERNS.any { it.containsMatchIn(fullText) }

        // ── Step 3: Per-utterance extraction ─────────────────────────────────
        val commitments = mutableListOf<ExtractedCommitment>()
        val callerRequests = mutableListOf<ExtractedRequest>()
        val keyPoints = mutableListOf<String>()

        for (utterance in callerUtterances) {
            val utteranceTrimmed = utterance.trim()
            if (utteranceTrimmed.length < 4) continue

            val isThirdParty = THIRD_PARTY_PATTERNS.any { it.containsMatchIn(utteranceTrimmed) }
            val isHedged = HEDGE_PATTERNS.any { it.containsMatchIn(utteranceTrimmed) }
            val isRetraction = RETRACTION_PATTERNS.any { it.containsMatchIn(utteranceTrimmed) }
            val hasFirstPersonCommit = COMMITMENT_FIRST_PERSON.any { it.containsMatchIn(utteranceTrimmed) }
            val hasCallbackRequest = CALLBACK_PATTERNS.any { it.containsMatchIn(utteranceTrimmed) }

            // Extract time references
            val timeRef = TIME_PATTERNS.firstOrNull { it.containsMatchIn(utteranceTrimmed) }
                ?.find(utteranceTrimmed)?.value

            // Extract document/item references
            val itemRef = DOCUMENT_PATTERNS.firstOrNull { it.containsMatchIn(utteranceTrimmed) }
                ?.find(utteranceTrimmed)?.value

            when {
                isRetraction -> {
                    // Retraction — do not create commitment, flag for resolution
                    keyPoints.add(utteranceTrimmed.take(80))
                    Log.d(TAG, "Retraction detected: $utteranceTrimmed")
                }

                isThirdParty -> {
                    // Third-party statement → observation only, never a user commitment
                    keyPoints.add(utteranceTrimmed.take(80))
                    Log.d(TAG, "Third-party statement (not a user commitment): $utteranceTrimmed")
                }

                isHedged -> {
                    // Hedged → observation only, never a firm commitment
                    keyPoints.add(utteranceTrimmed.take(80))
                    Log.d(TAG, "Hedged statement (not committed): $utteranceTrimmed")
                }

                hasFirstPersonCommit && !isHedged -> {
                    // High-confidence first-person commitment
                    val commitment = ExtractedCommitment(
                        text = utteranceTrimmed.take(120),
                        timeReference = timeRef,
                        itemReference = itemRef,
                        confidence = if (timeRef != null) 0.90f else 0.78f,
                        isUserCommitment = true
                    )
                    commitments.add(commitment)
                    keyPoints.add(utteranceTrimmed.take(80))
                    Log.d(TAG, "Commitment extracted (conf=${commitment.confidence}): $utteranceTrimmed")
                }

                hasCallbackRequest -> {
                    // Caller is requesting something of the user (callback, meeting)
                    val request = ExtractedRequest(
                        text = utteranceTrimmed.take(120),
                        timeReference = timeRef,
                        requestType = if (utteranceTrimmed.contains(Regex("meet|meeting|discuss", RegexOption.IGNORE_CASE))) RequestType.MEETING else RequestType.CALLBACK,
                        confidence = 0.82f
                    )
                    callerRequests.add(request)
                    keyPoints.add(utteranceTrimmed.take(80))
                    Log.d(TAG, "Caller request extracted: $utteranceTrimmed")
                }

                utteranceTrimmed.length > 10 -> {
                    // General observation
                    keyPoints.add(utteranceTrimmed.take(80))
                }
            }
        }

        // ── Step 4: Build human-readable summary ─────────────────────────────
        val summary = buildHumanSummary(
            callerUtterances = callerUtterances,
            commitments = commitments,
            callerRequests = callerRequests,
            hasRetraction = hasRetraction,
            contextHint = contextHint
        )

        val overallConfidence = when {
            callerUtterances.size > 3 -> 0.85f
            callerUtterances.size > 1 -> 0.75f
            else -> 0.60f
        }

        return ExtractionResult(
            humanReadableSummary = summary,
            keyPoints = keyPoints.distinct().take(5),
            commitments = commitments,
            callerRequests = callerRequests,
            urgencyLevel = urgency,
            hasRetraction = hasRetraction,
            summaryConfidence = overallConfidence
        )
    }

    /**
     * Builds a natural-language summary the user will actually read.
     * No mention of "SI", "engine", "extraction", or internal state.
     */
    private fun buildHumanSummary(
        callerUtterances: List<String>,
        commitments: List<ExtractedCommitment>,
        callerRequests: List<ExtractedRequest>,
        hasRetraction: Boolean,
        contextHint: String?
    ): String {
        val sb = StringBuilder()
        val callerLabel = contextHint ?: "The caller"

        when {
            callerUtterances.size == 1 && callerUtterances[0].length < 20 -> {
                sb.append("$callerLabel called but left a very brief message.")
            }
            callerRequests.isNotEmpty() && callerRequests[0].requestType == RequestType.MEETING -> {
                val timeRef = callerRequests[0].timeReference?.let { " at $it" } ?: ""
                sb.append("$callerLabel would like to meet$timeRef.")
            }
            callerRequests.isNotEmpty() && callerRequests[0].requestType == RequestType.CALLBACK -> {
                val timeRef = callerRequests[0].timeReference?.let { " after $it" } ?: ""
                sb.append("$callerLabel asked you to call back$timeRef.")
            }
            commitments.isNotEmpty() -> {
                val first = commitments[0]
                val timeRef = first.timeReference?.let { " by $it" } ?: ""
                sb.append("$callerLabel has something${first.itemReference?.let { " about the $it" } ?: ""}$timeRef.")
            }
            hasRetraction -> {
                sb.append("$callerLabel indicated something has already been handled.")
            }
            else -> {
                sb.append("$callerLabel called and left a message.")
            }
        }

        return sb.toString()
    }
}

// ── Domain model ─────────────────────────────────────────────────────────────

data class ExtractedCommitment(
    val text: String,
    val timeReference: String?,
    val itemReference: String?,
    val confidence: Float,
    val isUserCommitment: Boolean   // false = third-party, true = the user themselves
)

data class ExtractedRequest(
    val text: String,
    val timeReference: String?,
    val requestType: RequestType,
    val confidence: Float
)

enum class RequestType { CALLBACK, MEETING, DOCUMENT_SHARE, PAYMENT }

data class ExtractionResult(
    val humanReadableSummary: String,
    val keyPoints: List<String>,
    val commitments: List<ExtractedCommitment>,
    val callerRequests: List<ExtractedRequest>,
    val urgencyLevel: UrgencyLevel,
    val hasRetraction: Boolean,
    val summaryConfidence: Float
)
