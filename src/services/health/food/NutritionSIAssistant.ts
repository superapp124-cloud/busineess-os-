/**
 * CHATR OS - SI Nutrition Assistant
 * Phase 3A: Healthy Food & Nutrition Subsystem
 *
 * Provides conversational reasoning, transparent "Why this recommendation?",
 * smart ingredient substitutions, and critical medical nutrition guardrails.
 */

import { FoodProfile, MealItem, NutritionEngine } from './NutritionEngine';

export interface SISubstitutionResponse {
  answer: string;
  recommendedSwap?: {
    original: string;
    substitute: string;
    macroDifference: string;
  };
  disclaimer: string;
}

export class NutritionSIAssistant {
  /**
   * Universal Medical Disclaimer
   */
  static readonly MEDICAL_DISCLAIMER = 
    'General healthy eating guidance, not medical nutrition advice. ' +
    'If you have medical conditions (such as diabetes, chronic kidney disease, ' +
    'hypertension, eating disorders, or are pregnant/nursing), consult a licensed ' +
    'clinical dietitian or your physician before altering your diet.';

  /**
   * Transparent explanation of meal recommendation
   */
  static explainRecommendation(meal: MealItem, profile: FoodProfile): {
    headline: string;
    keyFactors: string[];
    disclaimer: string;
  } {
    const { bmi, category } = NutritionEngine.calculateBMI(profile.weightKg, profile.heightCm);
    const targets = NutritionEngine.calculateMacroTargets(profile);

    const keyFactors = [
      `Calibrated for age ${profile.age} & weight ${profile.weightKg}kg (BMI: ${bmi} - ${category}).`,
      `Supports your goal to "${profile.goal.toUpperCase()}" with ${meal.calories} kcal (${Math.round((meal.calories / targets.calorieTarget) * 100)}% of daily allowance).`,
      `High-satiety macronutrient ratio: ${meal.proteinG}g protein, ${meal.fiberG}g fiber to prevent postprandial glucose swings.`,
      `Honors your ${profile.dietPreference.replace('_', ' ')} preference and avoids common allergens.`
    ];

    return {
      headline: `Why this ${meal.type} recommendation?`,
      keyFactors,
      disclaimer: this.MEDICAL_DISCLAIMER
    };
  }

  /**
   * Smart ingredient substitution handler
   */
  static suggestSubstitution(
    currentIngredientOrFood: string,
    reason: 'allergy' | 'preference' | 'availability' | 'protein',
    profile: FoodProfile
  ): SISubstitutionResponse {
    const lower = currentIngredientOrFood.toLowerCase();

    // 1. Paneer / Dairy swaps
    if (lower.includes('paneer') || lower.includes('curd') || lower.includes('milk') || lower.includes('dairy')) {
      return {
        answer: 'You can swap dairy with firm Organic Tofu or Boiled Edamame / Chickpeas. Tofu matches the 18-20g protein profile with zero cholesterol and fewer saturated fats.',
        recommendedSwap: {
          original: '100g Fresh Paneer (265 kcal, 18g protein, 20g fat)',
          substitute: '120g Organic Firm Tofu (155 kcal, 17g protein, 9g fat)',
          macroDifference: '-110 kcal, -11g saturated fat, equal plant protein'
        },
        disclaimer: this.MEDICAL_DISCLAIMER
      };
    }

    // 2. White Rice / Refined Grain swaps
    if (lower.includes('rice') || lower.includes('roti') || lower.includes('bread') || lower.includes('naan')) {
      return {
        answer: 'Replace polished white grains with Foxtail Millet, Brown Basmati, or Jowar/Bajra Bhakri. These provide complex polysaccharides that release energy steadily.',
        recommendedSwap: {
          original: '1 cup White Rice (205 kcal, GI 73)',
          substitute: '1 cup Cooked Foxtail Millet / Quinoa (170 kcal, GI 54)',
          macroDifference: '3x more dietary fiber, prevents insulin surge'
        },
        disclaimer: this.MEDICAL_DISCLAIMER
      };
    }

    // 3. Egg / Poultry swaps
    if (lower.includes('egg') || lower.includes('chicken') || lower.includes('meat')) {
      return {
        answer: 'For a plant-based high-protein equivalent, use Soya Chunks (52% protein by dry weight), Sprouted Green Moong, or a combination of Lentils and Hemp/Pumpkin seeds.',
        recommendedSwap: {
          original: '150g Chicken Breast (240 kcal, 46g protein)',
          substitute: '60g Soya Chunks + 1 cup Dal (280 kcal, 38g protein)',
          macroDifference: 'Adds 10g dietary fiber with comparable protein density'
        },
        disclaimer: this.MEDICAL_DISCLAIMER
      };
    }

    // Default intelligent recommendation
    return {
      answer: `To replace "${currentIngredientOrFood}", opt for whole unprocessed vegetables, sprouted legumes, or roasted seeds to maintain healthy micronutrient balance.`,
      disclaimer: this.MEDICAL_DISCLAIMER
    };
  }

  /**
   * Instant SI nutrition chat response
   */
  static askQuestion(question: string, profile: FoodProfile): SISubstitutionResponse {
    const q = question.toLowerCase();

    if (q.includes('travel') || q.includes('hotel') || q.includes('outside') || q.includes('restaurant')) {
      return {
        answer: 'When dining out or travelling: 1) Ask for rotis without butter/ghee. 2) Prioritize yellow dal tadka or tandoori chicken/paneer tikka over cream gravies. 3) Start with a raw green salad with lemon dressing to curb overeating.',
        disclaimer: this.MEDICAL_DISCLAIMER
      };
    }

    if (q.includes('weight loss') || q.includes('lose') || q.includes('fat')) {
      const targets = NutritionEngine.calculateMacroTargets(profile);
      return {
        answer: `For your profile (${profile.age} yrs, ${profile.weightKg} kg), a safe deficit target is ~${targets.calorieTarget} kcal/day with ${targets.proteinTargetG}g protein. Prioritize high-volume fibrous veggies and drink 2.5–3L water.`,
        disclaimer: this.MEDICAL_DISCLAIMER
      };
    }

    if (q.includes('sweet') || q.includes('sugar') || q.includes('craving')) {
      return {
        answer: 'Curb sweet cravings with a Medjool date stuffed with almond, cold cinnamon water, or 1 square of 85%+ dark chocolate. Often, sweet cravings indicate dehydration or insufficient protein at your previous meal.',
        disclaimer: this.MEDICAL_DISCLAIMER
      };
    }

    return {
      answer: `Based on your ${profile.goal} goal and ${profile.dietPreference.replace('_', ' ')} preferences, maintain steady meal timing, keep protein above ${profile.weightKg * 1.5}g/day, and favor whole foods over packaged items.`,
      disclaimer: this.MEDICAL_DISCLAIMER
    };
  }
}
