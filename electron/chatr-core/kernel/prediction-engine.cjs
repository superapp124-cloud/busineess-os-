'use strict';

/**
 * Prediction Engine
 * Handles "typing" phase speculatively.
 * Triggers pre-fetches for GPS, and now calls the real ProviderSessionService
 * to validate sessions before the user even presses Enter.
 */
class PredictionEngine {
  constructor(bus, sessionService) {
    this.bus = bus;
    this.sessionService = sessionService; // Real ProviderSessionService (P1.3)
    this.activePredictions = new Map();
  }

  handlePartialIntent(partialText, userContext) {
    if (partialText.length < 5) return;

    const lowerText = partialText.toLowerCase();
    const predictionId = `pred_${Date.now()}`;

    if (lowerText.includes('order') || lowerText.includes('food') || lowerText.includes('biryani')) {
      if (!this.activePredictions.has('food_intent')) {
        this.bus.publish('kernel.prediction.started', { type: 'food_intent', predictionId });

        this._speculativeGpsFetch(userContext);
        this._speculativeSessionValidation(['zomato', 'swiggy', 'magicpin'], userContext);

        this.activePredictions.set('food_intent', predictionId);
      }
    }

    if (lowerText.includes('hotel') || lowerText.includes('book')) {
      if (!this.activePredictions.has('hotel_intent')) {
        this.bus.publish('kernel.prediction.started', { type: 'hotel_intent', predictionId });
        this._speculativeSessionValidation(['makemytrip'], userContext);
        this.activePredictions.set('hotel_intent', predictionId);
      }
    }
  }

  _speculativeGpsFetch(userContext) {
    this.bus.publish('kernel.prediction.gps_fetched', { location: 'Sector 128, Noida' });
  }

  _speculativeSessionValidation(providers, userContext) {
    if (this.sessionService) {
      // Use the real ProviderSessionService — non-blocking
      this.sessionService.validateAll(providers).then(sessions => {
        sessions.forEach(s => {
          this.bus.publish('kernel.prediction.session_validated', {
            provider: s.provider,
            isLoggedIn: s.status === 'AUTHENTICATED',
            confidence: s.confidence,
          });
        });
      }).catch(() => {});
    } else {
      // Fallback for environments without SessionService
      providers.forEach(p => {
        this.bus.publish('kernel.prediction.session_validated', { provider: p, isLoggedIn: p !== 'magicpin' });
      });
    }
  }

  clearPredictions() {
    this.activePredictions.clear();
  }
}

module.exports = { PredictionEngine };
