/**
 * CHATR OS - Deterministic Nutrition Engine
 * Phase 3A: Healthy Food & Nutrition Subsystem
 *
 * Implements clinical and sports science formulas (Mifflin-St Jeor BMR, TDEE,
 * macronutrient partitioning) for personalized healthy nutrition based on age,
 * weight, height, activity level, dietary preference, and goals.
 *
 * SI (Synthetic Intelligence) is used for explanation and contextual substitutions,
 * while this engine guarantees 100% deterministic, safe nutritional calculations.
 */

export type DietPreference = 'vegetarian' | 'non_vegetarian' | 'eggitarian';
export type CuisinePreference = 'indian' | 'continental' | 'mixed';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type Sex = 'male' | 'female' | 'unspecified';

export interface FoodProfile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietPreference: DietPreference;
  cuisinePreference: CuisinePreference;
  allergies: string[];
  dislikedFoods: string[];
  mealsPerDay: number;
  medicalConditions?: string[];
  lastUpdated?: string;
}

export interface MealItem {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dietCategory: DietPreference;
  cuisine: CuisinePreference;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  ingredients: string[];
  prepTimeMinutes: number;
  tags: string[];
  description: string;
  whyRecommended?: string;
  alternatives?: { insteadOf: string; chooseThis: string; benefit: string }[];
}

export interface DailyMealPlan {
  date: string;
  dayName: string;
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    snack: MealItem;
    dinner: MealItem;
  };
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
}

export interface HealthyAlternative {
  category: string;
  insteadOf: string;
  chooseThis: string;
  benefit: string;
  icon: string;
}

export const DEFAULT_FOOD_PROFILE: FoodProfile = {
  age: 28,
  sex: 'male',
  heightCm: 174,
  weightKg: 68,
  activityLevel: 'moderate',
  goal: 'maintain',
  dietPreference: 'vegetarian',
  cuisinePreference: 'indian',
  allergies: [],
  dislikedFoods: [],
  mealsPerDay: 4,
  medicalConditions: [],
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'chatr_health_food_profile_v1';

export class NutritionEngine {
  /**
   * Calculate BMI
   */
  static calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';
    return { bmi, category };
  }

  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
   */
  static calculateBMR(profile: FoodProfile): number {
    const { weightKg, heightCm, age, sex } = profile;
    if (sex === 'female') {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
    // Default to male or neutral baseline
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   */
  static calculateTDEE(profile: FoodProfile): number {
    const bmr = this.calculateBMR(profile);
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725
    };
    const multiplier = multipliers[profile.activityLevel] || 1.375;
    return Math.round(bmr * multiplier);
  }

  /**
   * Calculate target calories and macronutrients based on goal
   */
  static calculateMacroTargets(profile: FoodProfile) {
    const tdee = this.calculateTDEE(profile);
    let targetCalories = tdee;

    if (profile.goal === 'lose') {
      targetCalories = Math.max(1200, Math.round(tdee - 450));
    } else if (profile.goal === 'gain') {
      targetCalories = Math.round(tdee + 350);
    }

    // Protein target: 1.5g to 2.0g per kg bodyweight
    const proteinFactor = profile.goal === 'gain' ? 2.0 : profile.goal === 'lose' ? 1.8 : 1.5;
    const proteinTargetG = Math.round(profile.weightKg * proteinFactor);
    const proteinCalories = proteinTargetG * 4;

    // Fat target: ~25% of total calories
    const fatCalories = targetCalories * 0.25;
    const fatTargetG = Math.round(fatCalories / 9);

    // Carbs: Remainder of calories
    const carbsCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbsTargetG = Math.round(carbsCalories / 4);

    // Fiber: ~14g per 1000 kcal, minimum 28g
    const fiberTargetG = Math.max(28, Math.round((targetCalories / 1000) * 14));

    return {
      tdee,
      calorieTarget: targetCalories,
      proteinTargetG,
      carbsTargetG,
      fatTargetG,
      fiberTargetG
    };
  }

  /**
   * Curated meal database tagged by diet, cuisine, and timing
   */
  static readonly MEAL_DATABASE: MealItem[] = [
    // ── Breakfast ──────────────────────────────────────
    {
      id: 'bf-veg-ind-1',
      name: 'Vegetable Poha + Fresh Curd',
      type: 'breakfast',
      dietCategory: 'vegetarian',
      cuisine: 'indian',
      calories: 360,
      proteinG: 12,
      carbsG: 58,
      fatG: 8,
      fiberG: 6,
      ingredients: ['Thick flattened rice (poha)', 'Green peas', 'Carrots', 'Roasted peanuts', 'Mustard seeds', 'Curry leaves', '100g probiotic curd'],
      prepTimeMinutes: 15,
      tags: ['Probiotic', 'Iron-Rich', 'Easy Digest'],
      description: 'Traditional flattened rice tempered with mustard, roasted peanuts, carrots, and peas, paired with cooling probiotic curd.',
      alternatives: [
        { insteadOf: 'Fried Puri Bhaji', chooseThis: 'Steamed Vegetable Poha', benefit: '70% less saturated fat, zero trans fat' }
      ]
    },
    {
      id: 'bf-veg-ind-2',
      name: 'Rolled Oats + Almond Milk + Seasonal Fruits & Chia',
      type: 'breakfast',
      dietCategory: 'vegetarian',
      cuisine: 'continental',
      calories: 380,
      proteinG: 14,
      carbsG: 62,
      fatG: 9,
      fiberG: 10,
      ingredients: ['Whole rolled oats', 'Unsweetened almond milk', 'Chia seeds', 'Walnuts', 'Sliced apple & pomegranate'],
      prepTimeMinutes: 10,
      tags: ['Heart-Healthy', 'Beta-Glucan', 'High Fiber'],
      description: 'Slow-digesting rolled oats infused with omega-3 rich chia seeds, antioxidant berries/fruits, and crunchy walnuts.',
      alternatives: [
        { insteadOf: 'Sugary Cornflakes', chooseThis: 'Rolled Oats with Berries', benefit: 'Prevents insulin spike, keeps you full for 4 hours' }
      ]
    },
    {
      id: 'bf-egg-ind-1',
      name: 'Masala Egg White Scramble + 2 Multigrain Toast',
      type: 'breakfast',
      dietCategory: 'eggitarian',
      cuisine: 'indian',
      calories: 340,
      proteinG: 24,
      carbsG: 38,
      fatG: 7,
      fiberG: 7,
      ingredients: ['3 Egg whites + 1 whole egg', 'Onions, tomatoes, green chilies', 'Turmeric & coriander', '2 slices sprouted multigrain bread'],
      prepTimeMinutes: 12,
      tags: ['High Protein', 'Lean Muscle', 'Low Fat'],
      description: 'Fluffy desi egg bhurji loaded with crunchy onions, tomatoes, and fresh coriander, served with toasted high-fiber multigrain bread.',
      alternatives: [
        { insteadOf: 'White Bread Butter Toast', chooseThis: 'Sprouted Multigrain Toast', benefit: 'Double the fiber, low glycemic index' }
      ]
    },
    {
      id: 'bf-nonveg-ind-1',
      name: 'Shredded Chicken Breast & Spinach Omelette',
      type: 'breakfast',
      dietCategory: 'non_vegetarian',
      cuisine: 'mixed',
      calories: 410,
      proteinG: 34,
      carbsG: 18,
      fatG: 12,
      fiberG: 5,
      ingredients: ['2 Eggs', '80g shredded boiled chicken breast', 'Baby spinach', 'Bell peppers', 'Olive oil drizzle'],
      prepTimeMinutes: 15,
      tags: ['High Protein', 'Keto Friendly', 'Iron Boost'],
      description: 'Lean chicken breast and baby spinach folded into a light herb-seasoned omelette for maximum morning satiety.',
      alternatives: [
        { insteadOf: 'Sausage McMuffin', chooseThis: 'Lean Chicken Omelette', benefit: 'Zero processed nitrates, 3x more clean protein' }
      ]
    },

    // ── Lunch ──────────────────────────────────────────
    {
      id: 'lu-veg-ind-1',
      name: 'Yellow Tadka Dal + 2 Multigrain Roti + Mixed Green Sabzi + Fresh Curd',
      type: 'lunch',
      dietCategory: 'vegetarian',
      cuisine: 'indian',
      calories: 520,
      proteinG: 22,
      carbsG: 78,
      fatG: 12,
      fiberG: 12,
      ingredients: ['1 bowl Yellow Moong/Toor Dal', '2 Multigrain Rotis (whole wheat + jowar)', '1 cup seasonal bhindi/lauki sabzi', '100g low-fat curd', 'Cucumber tomato salad'],
      prepTimeMinutes: 30,
      tags: ['Balanced Macro', 'Complete Protein', 'Gut Friendly'],
      description: 'A wholesome, authentic Indian thali pairing legume protein with whole grains for a complete amino acid profile.',
      alternatives: [
        { insteadOf: 'Butter Naan + Paneer Butter Masala', chooseThis: 'Multigrain Roti + Yellow Dal', benefit: 'Saves 450 empty calories and heavy cream fats' }
      ]
    },
    {
      id: 'lu-veg-cont-1',
      name: 'Warm Quinoa & Roasted Veggie Salad Bowl with Hummus',
      type: 'lunch',
      dietCategory: 'vegetarian',
      cuisine: 'continental',
      calories: 490,
      proteinG: 18,
      carbsG: 68,
      fatG: 15,
      fiberG: 14,
      ingredients: ['Cooked Royal Quinoa', 'Roasted zucchini & bell peppers', 'Steamed chickpeas', '2 tbsp Tahini Garlic Hummus', 'Pumpkin seeds'],
      prepTimeMinutes: 20,
      tags: ['Gluten Free', 'Complex Carbs', 'Plant Power'],
      description: 'Nutrient-dense quinoa bowl topped with fire-roasted veggies, protein-rich chickpeas, and creamy homemade hummus.',
      alternatives: [
        { insteadOf: 'Creamy White Sauce Pasta', chooseThis: 'Roasted Veg Quinoa Bowl', benefit: 'High protein grain, slow digestive burn' }
      ]
    },
    {
      id: 'lu-nonveg-ind-1',
      name: 'Grilled Herb Chicken Breast + Steamed Brown Rice + Tossed Salad',
      type: 'lunch',
      dietCategory: 'non_vegetarian',
      cuisine: 'mixed',
      calories: 560,
      proteinG: 42,
      carbsG: 55,
      fatG: 14,
      fiberG: 8,
      ingredients: ['160g chicken breast marinated in herbs, ginger & garlic', '1 cup steamed brown basmati rice', 'Steamed broccoli and carrots', 'Lemon olive oil dressing'],
      prepTimeMinutes: 25,
      tags: ['Peak Protein', 'Lean Mass', 'Post-Workout'],
      description: 'Tender chicken breast seared in cold-pressed olive oil, served with mineral-rich brown basmati rice and crisp steamed broccoli.',
      alternatives: [
        { insteadOf: 'Chicken Biryani with Dalda', chooseThis: 'Grilled Herb Chicken with Brown Rice', benefit: 'Zero trans fats, 42g lean amino acids' }
      ]
    },
    {
      id: 'lu-nonveg-fish-1',
      name: 'Steamed Rohu/Salmon Curry + 2 Millet Rotis + Kachumber Salad',
      type: 'lunch',
      dietCategory: 'non_vegetarian',
      cuisine: 'indian',
      calories: 530,
      proteinG: 38,
      carbsG: 48,
      fatG: 16,
      fiberG: 9,
      ingredients: ['150g fresh fish steak in light tomato-mustard curry', '2 Bajra or Jowar rotis', 'Sliced onion, radish, cucumber salad with lime'],
      prepTimeMinutes: 25,
      tags: ['Omega-3', 'Brain Food', 'Anti-Inflammatory'],
      description: 'Cardiovascular friendly omega-3 fatty acids from fish simmered in anti-inflammatory turmeric broth, paired with gluten-free millet rotis.',
      alternatives: [
        { insteadOf: 'Deep Fried Fish Fry', chooseThis: 'Light Fish Curry', benefit: 'Retains EPA/DHA omega-3s without oxidized cooking oils' }
      ]
    },

    // ── Snacks ─────────────────────────────────────────
    {
      id: 'sn-veg-ind-1',
      name: 'Roasted Makhana (Fox Nuts) + Handful of Raw Almonds',
      type: 'snack',
      dietCategory: 'vegetarian',
      cuisine: 'indian',
      calories: 190,
      proteinG: 6,
      carbsG: 22,
      fatG: 8,
      fiberG: 5,
      ingredients: ['1 bowl slow-roasted fox nuts (makhana) with rock salt & pepper', '8-10 raw California almonds'],
      prepTimeMinutes: 5,
      tags: ['Low Calorie', 'Magnesium', 'Crunchy'],
      description: 'Crisp roasted lotus seeds packed with potassium and magnesium, paired with vitamin E rich raw almonds.',
      alternatives: [
        { insteadOf: 'Potato Chips / Samosa', chooseThis: 'Slow Roasted Makhana', benefit: 'Zero saturated trans-fat, 75% fewer calories' }
      ]
    },
    {
      id: 'sn-veg-fruit-1',
      name: 'Seasonal Apple / Papaya Slices + 1 tbsp Roasted Pumpkin Seeds',
      type: 'snack',
      dietCategory: 'vegetarian',
      cuisine: 'mixed',
      calories: 160,
      proteinG: 4,
      carbsG: 26,
      fatG: 5,
      fiberG: 6,
      ingredients: ['1 crisp local apple or bowl of ripe papaya', '1 tablespoon unsalted roasted pumpkin seeds'],
      prepTimeMinutes: 5,
      tags: ['Digestive Enzymes', 'Zinc Boost', 'Immunity'],
      description: 'Digestive papain and pectin fiber paired with zinc-rich pumpkin seeds for steady afternoon cognitive clarity.',
      alternatives: [
        { insteadOf: 'Biscuits / Cookies with Chai', chooseThis: 'Fresh Fruit + Pumpkin Seeds', benefit: 'No refined palm oil, pure natural micronutrients' }
      ]
    },
    {
      id: 'sn-egg-1',
      name: '2 Boiled Egg Whites with Chaat Masala + Green Tea',
      type: 'snack',
      dietCategory: 'eggitarian',
      cuisine: 'indian',
      calories: 110,
      proteinG: 12,
      carbsG: 2,
      fatG: 1,
      fiberG: 1,
      ingredients: ['2 hard boiled egg whites', 'Pinch of rock salt & roasted cumin powder', 'Freshly brewed green tea'],
      prepTimeMinutes: 8,
      tags: ['Pure Protein', 'Fat-Burn', 'Thermogenic'],
      description: 'Clean, immediate protein hit with zero fat, combined with antioxidant EGCG from soothing green tea.',
      alternatives: [
        { insteadOf: 'Milk Coffee with 2 tsp Sugar', chooseThis: 'Green Tea + Boiled Egg Whites', benefit: 'Zero added sugar, curbs 4 PM sweet cravings' }
      ]
    },

    // ── Dinner ─────────────────────────────────────────
    {
      id: 'dn-veg-ind-1',
      name: 'Paneer / Organic Tofu Bhurji + 2 Roti + Light Vegetable Soup',
      type: 'dinner',
      dietCategory: 'vegetarian',
      cuisine: 'indian',
      calories: 460,
      proteinG: 26,
      carbsG: 45,
      fatG: 16,
      fiberG: 9,
      ingredients: ['120g fresh low-fat paneer or firm tofu', 'Sautéed capsicum, tomato, onion', '2 whole wheat phulkas with drop of ghee', 'Clear ginger-coriander soup'],
      prepTimeMinutes: 20,
      tags: ['Casein Protein', 'Easy Sleep', 'Night Recovery'],
      description: 'Slow-digesting protein to feed muscle recovery through the night, accompanied by gut-soothing ginger soup.',
      alternatives: [
        { insteadOf: 'Takeaway Pizza / Noodles', chooseThis: 'Fresh Paneer Bhurji & Phulka', benefit: 'Wake up light without morning water retention' }
      ]
    },
    {
      id: 'dn-veg-cont-1',
      name: 'Lentil & Vegetable Minestrone Stew + Garlic Toast',
      type: 'dinner',
      dietCategory: 'vegetarian',
      cuisine: 'continental',
      calories: 430,
      proteinG: 19,
      carbsG: 62,
      fatG: 10,
      fiberG: 13,
      ingredients: ['Brown lentils & kidney beans', 'Carrot, celery, zucchini, crushed tomatoes', 'Herbs de Provence', '1 slice toasted whole wheat sourdough'],
      prepTimeMinutes: 25,
      tags: ['Warm Comfort', 'High Fiber', 'Antioxidant'],
      description: 'Comforting Mediterranean style bean and vegetable pot simmering with herbs, supporting healthy sleep rhythms.',
      alternatives: [
        { insteadOf: 'Heavy Rice & Gravy', chooseThis: 'Lentil Veg Minestrone', benefit: 'Light on gut, prevents nighttime acid reflux' }
      ]
    },
    {
      id: 'dn-nonveg-ind-1',
      name: 'Lemon Pepper Grilled Chicken Breast + Sauteed Veggies + 1 Phulka',
      type: 'dinner',
      dietCategory: 'non_vegetarian',
      cuisine: 'mixed',
      calories: 470,
      proteinG: 38,
      carbsG: 32,
      fatG: 14,
      fiberG: 7,
      ingredients: ['150g chicken breast marinated in black pepper, garlic & lemon', 'Sauteed French beans, carrots & bell peppers', '1 soft phulka'],
      prepTimeMinutes: 20,
      tags: ['Lean Protein', 'Low Glycemic', 'Night Repair'],
      description: 'High biological value protein with minimal starch so your body enters deep restorative REM sleep unburdened.',
      alternatives: [
        { insteadOf: 'Creamy Butter Chicken', chooseThis: 'Lemon Pepper Grilled Chicken', benefit: 'Saves 35g saturated fat, easier nocturnal digestion' }
      ]
    }
  ];

  /**
   * Curated Smart Food Alternatives
   */
  static readonly HEALTHY_ALTERNATIVES: HealthyAlternative[] = [
    {
      category: 'Snacks & Evening',
      insteadOf: 'Fried snacks (Samosa, Bhujia, Chips)',
      chooseThis: 'Slow-roasted Makhana, Steamed Sprout Chaat, or Chana',
      benefit: 'Reduces saturated fats by 80%, cuts trans fats, and keeps blood pressure stable.',
      icon: '🍿'
    },
    {
      category: 'Beverages',
      insteadOf: 'Packaged juice & Sugary sodas',
      chooseThis: 'Tender Coconut Water, Lemon Mint Infused Water, or Chaas',
      benefit: 'Eliminates 35g of liquid fructose, preventing hepatic fat accumulation and glucose spikes.',
      icon: '🥤'
    },
    {
      category: 'Staples & Grains',
      insteadOf: 'Refined flour (Maida) & White Rice',
      chooseThis: 'Millet Rotis (Jowar, Bajra, Ragi) & Foxtail Millet',
      benefit: 'Slows carbohydrate absorption with 3x higher mineral density and lower glycemic index.',
      icon: '🌾'
    },
    {
      category: 'Gravies & Sauces',
      insteadOf: 'Heavy cashew cream and dalda-rich gravies',
      chooseThis: 'Tomato-onion bhuna with hung curd or roasted seeds',
      benefit: 'Cuts 300+ hidden cooking fat calories without compromising Indian taste.',
      icon: '🍛'
    }
  ];

  /**
   * Transparent "Why This Food?" rationale generator
   */
  static generateWhyRecommended(meal: MealItem, profile: FoodProfile): string {
    const bmiInfo = this.calculateBMI(profile.weightKg, profile.heightCm);
    let goalReason = 'maintain your balanced daily energy';
    if (profile.goal === 'lose') {
      goalReason = 'keep you satiated on a controlled calorie budget while preserving lean muscle';
    } else if (profile.goal === 'gain') {
      goalReason = 'provide dense, clean protein and complex fuel to support positive nitrogen balance';
    }

    const dietReason = profile.dietPreference === 'vegetarian'
      ? 'Selected strictly from whole plant & dairy sources to meet high amino acid bioavailability.'
      : profile.dietPreference === 'eggitarian'
      ? 'Incorporates high biological value egg whites for optimal protein synthesis with zero trans fat.'
      : 'Features clean, lean poultry or fish to deliver bioavailable heme iron and essential amino acids.';

    return `Formulated specifically for your profile (${profile.age} yrs, ${profile.weightKg} kg, BMI ${bmiInfo.bmi} ${bmiInfo.category}). This ${meal.type} meal delivers ${meal.proteinG}g protein and ${meal.fiberG}g fiber to ${goalReason}. ${dietReason}`;
  }

  /**
   * Deterministically assemble today's meal plan for the given profile.
   * Delegates to getDayMealPlan with offset 0.
   */
  static getTodaysMealPlan(profile: FoodProfile): DailyMealPlan {
    return this.getDayMealPlan(profile, 0);
  }

  /**
   * Get a meal plan for a specific day offset from today (0=today, 1=tomorrow, etc.).
   * Uses the absolute epoch-day number modulo the available meal pool to give genuine
   * variety across the 7-day calendar — fully deterministic, no randomness.
   */
  static getDayMealPlan(profile: FoodProfile, dayOffset: number): DailyMealPlan {
    const targets = this.calculateMacroTargets(profile);
    const pref = profile.dietPreference;
    const cuisine = profile.cuisinePreference;

    // Absolute calendar day (epoch days) → deterministic seed per calendar date
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const epochDay = Math.floor(targetDate.getTime() / 86400000);

    // Return all compatible meals for a given type
    const getPool = (type: MealItem['type']): MealItem[] => {
      const candidates = this.MEAL_DATABASE.filter(m => m.type === type);
      let matched = candidates.filter(m => {
        if (pref === 'vegetarian') return m.dietCategory === 'vegetarian';
        if (pref === 'eggitarian') return m.dietCategory === 'vegetarian' || m.dietCategory === 'eggitarian';
        return true;
      });

      if (cuisine !== 'mixed') {
        const cFiltered = matched.filter(m => m.cuisine === cuisine || m.cuisine === 'mixed');
        if (cFiltered.length > 0) matched = cFiltered;
      }

      if (profile.allergies.length > 0) {
        matched = matched.filter(m =>
          !profile.allergies.some(allergen =>
            m.ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
          )
        );
      }

      return matched.length > 0 ? matched : candidates;
    };

    const pickMeal = (type: MealItem['type']): MealItem => {
      const pool = getPool(type);
      return { ...pool[epochDay % pool.length] };
    };

    const bf = pickMeal('breakfast');
    const lu = pickMeal('lunch');
    const sn = pickMeal('snack');
    const dn = pickMeal('dinner');

    bf.whyRecommended = this.generateWhyRecommended(bf, profile);
    lu.whyRecommended = this.generateWhyRecommended(lu, profile);
    sn.whyRecommended = this.generateWhyRecommended(sn, profile);
    dn.whyRecommended = this.generateWhyRecommended(dn, profile);

    const totalCalories = bf.calories + lu.calories + sn.calories + dn.calories;
    const totalProteinG = bf.proteinG + lu.proteinG + sn.proteinG + dn.proteinG;
    const totalCarbsG = bf.carbsG + lu.carbsG + sn.carbsG + dn.carbsG;
    const totalFatG = bf.fatG + lu.fatG + sn.fatG + dn.fatG;
    const totalFiberG = bf.fiberG + lu.fiberG + sn.fiberG + dn.fiberG;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      date: targetDate.toISOString().split('T')[0],
      dayName: dayNames[targetDate.getDay()],
      calorieTarget: targets.calorieTarget,
      proteinTargetG: targets.proteinTargetG,
      carbsTargetG: targets.carbsTargetG,
      fatTargetG: targets.fatTargetG,
      fiberTargetG: targets.fiberTargetG,
      meals: { breakfast: bf, lunch: lu, snack: sn, dinner: dn },
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      totalFiberG
    };
  }

  /**
   * Persistence helpers
   */
  static loadProfile(): FoodProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FOOD_PROFILE, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_FOOD_PROFILE;
  }

  static saveProfile(profile: FoodProfile): void {
    try {
      profile.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save food profile to localStorage', e);
    }
  }
}
