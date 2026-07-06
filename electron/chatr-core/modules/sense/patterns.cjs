'use strict';

/**
 * CHATR Intent Observer — Pattern Engine (Wave 2)
 *
 * Uses real deterministic classifiers to identify intents and resolve continuity references.
 */

const taskClassifier = require('./classifiers/TaskIntentClassifier.cjs');
const meetingClassifier = require('./classifiers/MeetingIntentClassifier.cjs');
const documentClassifier = require('./classifiers/DocumentIntentClassifier.cjs');

/**
 * Detect intents in a user message.
 *
 * @param {string} messageText - The outgoing user message
 * @returns {Array<{ type, confidence, reference, evidence }>}
 */
function detectIntents(messageText) {
  if (!messageText || typeof messageText !== 'string') return [];
  const text = messageText.trim();
  if (text.length < 8) return [];

  const detections = [];

  // Run classifiers
  const classifiers = [taskClassifier, meetingClassifier, documentClassifier];

  for (const classifier of classifiers) {
    const result = classifier.classify(text);
    if (result) {
      detections.push({
        type: result.type,         
        confidence: result.confidence,
        reference: result.reference,
        evidence: [result.raw],
        detectedAt: Date.now(),
      });
    }
  }

  // Sort by confidence descending
  return detections.sort((a, b) => b.confidence - a.confidence);
}

module.exports = { detectIntents };
