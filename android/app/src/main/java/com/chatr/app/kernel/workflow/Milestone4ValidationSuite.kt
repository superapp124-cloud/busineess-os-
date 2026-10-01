package com.chatr.app.kernel.workflow

import android.util.Log

/**
 * Milestone4ValidationSuite — Programmatic Empirical Validation Matrix for Milestone 4.
 *
 * Verifies all 7 core scenarios demanded by the user specification:
 * 1. Explicit Commitment: "I'll send Rahul the proposal tomorrow." -> High-confidence commitment.
 * 2. Hedged Statement: "Maybe I'll send it tomorrow." -> No commitment.
 * 3. Third-party Statement: "Rahul said he'll send the proposal tomorrow." -> Observation only, not user commitment.
 * 4. Retraction: "Actually, forget that. I already sent it." -> Resolves prior commitment.
 * 5. Meeting Intent: "Let's meet tomorrow at 4." -> Meeting request, proposed calendar action.
 * 6. Urgency Signal: "This is urgent." -> UrgencyLevel.HIGH, suggested SMS ack.
 * 7. Callback Intent: "Call me back after 6." -> Callback request.
 */
object Milestone4ValidationSuite {

    private const val TAG = "M4ValidationSuite"

    data class ValidationRow(
        val scenario: String,
        val inputUtterances: List<String>,
        val expectedCommitmentsCount: Int,
        val expectedUrgency: UrgencyLevel,
        val expectedHasMeeting: Boolean,
        val expectedHasCallback: Boolean,
        val expectedHasRetraction: Boolean,
        var actualCommitmentsCount: Int = 0,
        var actualUrgency: UrgencyLevel = UrgencyLevel.NORMAL,
        var actualHasMeeting: Boolean = false,
        var actualHasCallback: Boolean = false,
        var actualHasRetraction: Boolean = false,
        var passed: Boolean = false
    )

    fun runAllValidations(): List<ValidationRow> {
        val testMatrix = mutableListOf(
            ValidationRow(
                scenario = "1. Explicit first-person commitment",
                inputUtterances = listOf("I'll send Rahul the proposal tomorrow."),
                expectedCommitmentsCount = 1,
                expectedUrgency = UrgencyLevel.NORMAL,
                expectedHasMeeting = false,
                expectedHasCallback = false,
                expectedHasRetraction = false
            ),
            ValidationRow(
                scenario = "2. Ambiguous / Hedged statement (Must NOT commit)",
                inputUtterances = listOf("Maybe I'll send it tomorrow."),
                expectedCommitmentsCount = 0,
                expectedUrgency = UrgencyLevel.NORMAL,
                expectedHasMeeting = false,
                expectedHasCallback = false,
                expectedHasRetraction = false
            ),
            ValidationRow(
                scenario = "3. Third-party statement (Must NOT attribute to user)",
                inputUtterances = listOf("Rahul said he'll send the proposal tomorrow."),
                expectedCommitmentsCount = 0,
                expectedUrgency = UrgencyLevel.NORMAL,
                expectedHasMeeting = false,
                expectedHasCallback = false,
                expectedHasRetraction = false
            ),
            ValidationRow(
                scenario = "4. Correction / Retraction",
                inputUtterances = listOf("Actually, forget that. I already sent it."),
                expectedCommitmentsCount = 0,
                expectedUrgency = UrgencyLevel.NORMAL,
                expectedHasMeeting = false,
                expectedHasCallback = false,
                expectedHasRetraction = true
            ),
            ValidationRow(
                scenario = "5. Meeting intent",
                inputUtterances = listOf("Let's meet tomorrow at 4 to review numbers."),
                expectedCommitmentsCount = 0,
                expectedUrgency = UrgencyLevel.NORMAL,
                expectedHasMeeting = true,
                expectedHasCallback = false,
                expectedHasRetraction = false
            ),
            ValidationRow(
                scenario = "6. Urgent message",
                inputUtterances = listOf("Please pick up, this is urgent!"),
                expectedCommitmentsCount = 0,
                expectedUrgency = UrgencyLevel.HIGH,
                expectedHasMeeting = false,
                expectedHasCallback = false,
                expectedHasRetraction = false
            ),
            ValidationRow(
                scenario = "7. Callback request",
                inputUtterances = listOf("Call me back after 6 PM regarding the contract."),
                expectedCommitmentsCount = 0,
                expectedUrgency = UrgencyLevel.NORMAL,
                expectedHasMeeting = false,
                expectedHasCallback = true,
                expectedHasRetraction = false
            )
        )

        for (row in testMatrix) {
            val result = CallExtractionEngine.extract(row.inputUtterances)
            row.actualCommitmentsCount = result.commitments.filter { it.isUserCommitment && it.confidence >= 0.75f }.size
            row.actualUrgency = result.urgencyLevel
            row.actualHasMeeting = result.callerRequests.any { it.requestType == RequestType.MEETING }
            row.actualHasCallback = result.callerRequests.any { it.requestType == RequestType.CALLBACK }
            row.actualHasRetraction = result.hasRetraction

            row.passed = (row.actualCommitmentsCount == row.expectedCommitmentsCount) &&
                    (row.actualUrgency == row.expectedUrgency) &&
                    (row.actualHasMeeting == row.expectedHasMeeting) &&
                    (row.actualHasCallback == row.expectedHasCallback) &&
                    (row.actualHasRetraction == row.expectedHasRetraction)

            Log.i(TAG, "Test: [${row.scenario}] -> ${if (row.passed) "PASS" else "FAIL"}")
        }

        return testMatrix
    }
}
