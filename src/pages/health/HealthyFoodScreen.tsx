import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, SlidersHorizontal, Calendar,
  Sun, Utensils, Coffee, Moon, ChevronRight, Droplets,
  Shuffle, CheckCircle2, Circle, Flame, Zap, ArrowRight,
  TrendingDown, Heart, Info, Send
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import {
  FoodProfile, DailyMealPlan, NutritionEngine,
  DietPreference, CuisinePreference, MealItem
} from '@/services/health/food/NutritionEngine';
import { NutritionSIAssistant } from '@/services/health/food/NutritionSIAssistant';
import { FoodProfileModal } from '@/components/health/food/FoodProfileModal';
import { FoodDetailModal } from '@/components/health/food/FoodDetailModal';
import { cn } from '@/lib/utils';

// Helper for food emojis
function getMealEmoji(name: string, type: string): string {
  const n = name.toLowerCase();
  if (n.includes('poha')) return '🥣';
  if (n.includes('oats')) return '🥣';
  if (n.includes('egg') || n.includes('omelette')) return '🍳';
  if (n.includes('chilla')) return '🥞';
  if (n.includes('yogurt')) return '🫐';
  if (n.includes('chicken')) return '🍗';
  if (n.includes('fish') || n.includes('salmon')) return '🐟';
  if (n.includes('dal')) return '🍲';
  if (n.includes('quinoa') || n.includes('salad')) return '🥗';
  if (n.includes('paneer') || n.includes('tofu')) return '🧀';
  if (n.includes('makhana') || n.includes('snack')) return '🍿';
  if (n.includes('fruit') || n.includes('apple')) return '🍎';
  if (n.includes('stew') || n.includes('soup')) return '🍲';
  if (type === 'breakfast') return '🥣';
  if (type === 'lunch') return '🥗';
  if (type === 'snack') return '🍿';
  return '🍲';
}

export default function HealthyFoodScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FoodProfile>(() => NutritionEngine.loadProfile());
  const [mealPlan, setMealPlan] = useState<DailyMealPlan>(() => NutritionEngine.getTodaysMealPlan(profile));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);

  // Gamified interactive state: Logged meals
  const [loggedMeals, setLoggedMeals] = useState<Record<string, boolean>>({});

  // Interactive Hydration (0-8 glasses)
  const [waterGlasses, setWaterGlasses] = useState(6);

  // Interactive Smart Swap Game State
  const [swapCategoryIndex, setSwapCategoryIndex] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false);
  const [swapToast, setSwapToast] = useState<string | null>(null);

  // Quick SI Question
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [activeTip, setActiveTip] = useState<string>(
    '💡 Squeeze fresh lemon over your dal or salad to double your body’s iron absorption!'
  );

  useEffect(() => {
    setMealPlan(NutritionEngine.getTodaysMealPlan(profile));
  }, [profile]);

  const handleDietChange = (diet: DietPreference) => {
    const updated = { ...profile, dietPreference: diet };
    setProfile(updated);
    NutritionEngine.saveProfile(updated);
  };

  const handleCuisineChange = (cuisine: CuisinePreference) => {
    const updated = { ...profile, cuisinePreference: cuisine };
    setProfile(updated);
    NutritionEngine.saveProfile(updated);
  };

  const handleSaveProfile = (updated: FoodProfile) => {
    setProfile(updated);
    NutritionEngine.saveProfile(updated);
  };

  // Toggle meal as logged / eaten
  const toggleMealLog = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoggedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Instant in-place meal shuffle
  const handleShuffleMeal = (type: MealItem['type'], e: React.MouseEvent) => {
    e.stopPropagation();
    const available = NutritionEngine.getAvailableMeals(type, profile);
    if (available.length <= 1) return;

    const currentMeal = mealPlan.meals[type];
    const currentIndex = available.findIndex(m => m.id === currentMeal.id);
    const nextIndex = (currentIndex + 1) % available.length;
    const nextMeal = { ...available[nextIndex] };
    nextMeal.whyRecommended = NutritionEngine.generateWhyRecommended(nextMeal, profile);

    setMealPlan(prev => {
      const updatedMeals = { ...prev.meals, [type]: nextMeal };
      const totalCalories =
        updatedMeals.breakfast.calories +
        updatedMeals.lunch.calories +
        updatedMeals.snack.calories +
        updatedMeals.dinner.calories;
      const totalProteinG =
        updatedMeals.breakfast.proteinG +
        updatedMeals.lunch.proteinG +
        updatedMeals.snack.proteinG +
        updatedMeals.dinner.proteinG;
      return {
        ...prev,
        meals: updatedMeals,
        totalCalories,
        totalProteinG
      };
    });
  };

  // Dynamic calorie total based on logged meals
  const mealEntries = [
    { key: 'breakfast', label: 'Breakfast', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/15', meal: mealPlan.meals.breakfast },
    { key: 'lunch', label: 'Lunch', icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/15', meal: mealPlan.meals.lunch },
    { key: 'snack', label: 'Snack', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/15', meal: mealPlan.meals.snack },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/15', meal: mealPlan.meals.dinner },
  ] as const;

  const eatenCalories = mealEntries.reduce((sum, item) => {
    return sum + (loggedMeals[item.key] ? item.meal.calories : 0);
  }, 0);

  const eatenProtein = mealEntries.reduce((sum, item) => {
    return sum + (loggedMeals[item.key] ? item.meal.proteinG : 0);
  }, 0);

  const loggedCount = Object.values(loggedMeals).filter(Boolean).length;
  const bmiInfo = NutritionEngine.calculateBMI(profile.weightKg, profile.heightCm);

  // Smart Swaps Data
  const smartSwaps = [
    {
      category: 'Snack Craving',
      icon: '🍿',
      unhealthy: { name: 'Fried Samosa & Bhujia', kcal: 450, tag: 'High Trans Fat' },
      healthy: { name: 'Roasted Spiced Makhana', kcal: 120, tag: 'Zero Trans Fat' },
      savings: '🔥 Saves 330 kcal · −80% Bad Fats',
      actionTitle: 'Makhana'
    },
    {
      category: 'Drink Craving',
      icon: '🥤',
      unhealthy: { name: 'Cold Soda / Packaged Juice', kcal: 220, tag: '35g Liquid Sugar' },
      healthy: { name: 'Tender Coconut Water', kcal: 45, tag: 'Natural Electrolytes' },
      savings: '⚡ Saves 175 kcal · Zero Glucose Spike',
      actionTitle: 'Coconut Water'
    },
    {
      category: 'Bread Craving',
      icon: '🌾',
      unhealthy: { name: 'Refined Maida Naan', kcal: 320, tag: 'High Glycemic Index' },
      healthy: { name: 'Millet Roti (Jowar / Bajra)', kcal: 140, tag: '3x More Fiber' },
      savings: '🥑 Saves 180 kcal · Slow Energy Burn',
      actionTitle: 'Millet Roti'
    },
    {
      category: 'Gravy Craving',
      icon: '🍛',
      unhealthy: { name: 'Heavy Butter Cashew Cream', kcal: 480, tag: '35g Saturated Fat' },
      healthy: { name: 'Tomato-Curd Bhuna Gravy', kcal: 190, tag: 'Pure Spices & Curd' },
      savings: '💚 Saves 290 kcal · Light on Heart',
      actionTitle: 'Curd Bhuna'
    }
  ];

  const currentSwap = smartSwaps[swapCategoryIndex];

  const handleApplySwap = () => {
    setSwapToast(`Added ${currentSwap.healthy.name} to today's recommendations! ⭐`);
    setTimeout(() => setSwapToast(null), 2500);
  };

  const quickChips = [
    { label: '🍋 Iron Boost', tip: '💡 Squeeze fresh lemon over lentils or greens to double natural iron absorption!' },
    { label: '🍫 Sweet Tooth', tip: '💡 Craving sugar? 2 squares of 85% dark chocolate or 1 medjool date with almond butter satisfies the brain with zero crash.' },
    { label: '🏋️ Post-Workout', tip: '💡 Consume 20-30g protein within 60 mins of training for maximum muscle recovery.' },
    { label: '💧 Dehydration Trick', tip: '💡 60% of hunger pangs are actually thirst. Drink a tall glass of water 15m before snacking.' },
  ];

  return (
    <div
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{ background: 'radial-gradient(ellipse at 50% -10%, #0d1f2f 0%, #07090f 55%, #050609 100%)' }}
    >
      <SEOHead title="Healthy Food | CHATR OS" description="Interactive, gamified nutrition" />

      <div className="mx-auto max-w-[540px] w-full px-5 pt-4 space-y-4">

        {/* ── Top Bar ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/health')}
              className="p-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white active:scale-90 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/20">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-[22px] font-black tracking-tight text-white">Healthy Food</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/health/food/plan')}
              className="flex h-10 px-3.5 items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-200 text-[13px] font-bold active:scale-95 transition-all"
            >
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span>7-Day Plan</span>
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
              title="Edit Profile"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* ── Interactive Biometric Header Pill ───────────────── */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          className="rounded-[24px] p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 100%)',
            border: '1px solid rgba(16,185,129,0.18)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-[15px]">
              {profile.age}y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-extrabold text-white">{profile.weightKg} kg · {profile.heightCm} cm</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  BMI {bmiInfo.bmi}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 capitalize mt-0.5 font-medium">
                Goal: <span className="text-cyan-400 font-bold">{profile.goal}</span> · {profile.activityLevel.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-emerald-400">
            <span>Edit</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* ── Interactive Diet Selector Buttons ──────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
            { id: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
            { id: 'eggitarian', label: 'Eggitarian', icon: '🥚' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => handleDietChange(d.id as DietPreference)}
              className={cn(
                'py-2.5 px-2 rounded-2xl text-[13px] font-extrabold transition-all border flex items-center justify-center gap-1.5 active:scale-95 shadow-sm',
                profile.dietPreference === d.id
                  ? 'bg-white/[0.14] text-white border-white/30 shadow-lg'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]'
              )}
            >
              <span className="text-[18px]">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {/* ── Interactive Gamified Nutrition Dial & Progress ──── */}
        <div
          className="rounded-[28px] p-5 space-y-4"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-black text-white">Today's Nutrition Plate</h2>
              <p className="text-[12.5px] text-slate-400 mt-0.5">
                {loggedCount} of 4 meals logged today
              </p>
            </div>
            <div className="text-right">
              <span className="text-[20px] font-black text-emerald-400 block leading-none">
                {loggedCount > 0 ? eatenCalories : mealPlan.totalCalories}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                / {mealPlan.calorieTarget} kcal target
              </span>
            </div>
          </div>

          {/* Quick macro visual chips */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[11px] font-bold text-slate-400 block">PROTEIN</span>
              <span className="text-[18px] font-black text-emerald-400 leading-tight">
                {loggedCount > 0 ? eatenProtein : mealPlan.totalProteinG}g
              </span>
              <span className="text-[10px] text-slate-500 block">/ {mealPlan.proteinTargetG}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <span className="text-[11px] font-bold text-slate-400 block">FIBER</span>
              <span className="text-[18px] font-black text-cyan-400 leading-tight">
                {mealPlan.totalFiberG}g
              </span>
              <span className="text-[10px] text-slate-500 block">/ {mealPlan.fiberTargetG}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[11px] font-bold text-slate-400 block">BALANCE</span>
              <span className="text-[18px] font-black text-amber-400 leading-tight">
                {Math.round(((loggedCount > 0 ? eatenCalories : mealPlan.totalCalories) / mealPlan.calorieTarget) * 100)}%
              </span>
              <span className="text-[10px] text-slate-500 block">of goal</span>
            </div>
          </div>

          {/* ── Interactive Hydration Tap Tracker ── */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Hydration</span>
              </span>
              <span className="text-[13px] font-black text-cyan-300">
                {waterGlasses * 250} ml / 2,000 ml ({waterGlasses}/8)
              </span>
            </div>
            {/* 8 Tap-to-Fill Glasses */}
            <div className="grid grid-cols-8 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                const isFilled = i <= waterGlasses;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setWaterGlasses(isFilled && i === waterGlasses ? i - 1 : i)}
                    className={cn(
                      'h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border',
                      isFilled
                        ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-600 hover:text-slate-400'
                    )}
                  >
                    <Droplets className={cn('w-4 h-4', isFilled ? 'fill-cyan-400 text-cyan-400' : 'text-slate-600')} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Interactive Meals Section ("Plate View" + Shuffle) ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[19px] font-black text-white">Today's Meals</h2>
            <span className="text-[12px] text-slate-400">
              Tap 🔀 to swap dish · 🍽️ to log
            </span>
          </div>

          <div className="space-y-2.5">
            {mealEntries.map(item => {
              const isLogged = Boolean(loggedMeals[item.key]);
              const emoji = getMealEmoji(item.meal.name, item.key);

              return (
                <div
                  key={item.key}
                  onClick={() => setSelectedMeal(item.meal)}
                  className={cn(
                    'p-4 rounded-[24px] border cursor-pointer transition-all active:scale-[0.99] group space-y-2.5 relative overflow-hidden',
                    isLogged
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-950/30'
                      : 'bg-white/[0.03] border-white/[0.07] hover:border-white/20'
                  )}
                >
                  {/* Top Meal Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-7 w-7 items-center justify-center rounded-xl', item.bg)}>
                        <item.icon className={cn('w-3.5 h-3.5', item.color)} />
                      </div>
                      <span className={cn('text-[12px] font-black uppercase tracking-wider', item.color)}>
                        {item.label}
                      </span>
                    </div>

                    {/* Calories + Log Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-extrabold text-white">
                        {item.meal.calories} kcal
                      </span>
                      {isLogged ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Logged
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Main Dish Info */}
                  <div className="flex items-start gap-3">
                    <span className="text-[28px] shrink-0 leading-none mt-0.5">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                        {item.meal.name}
                      </h3>
                      {/* Visual micro-chips instead of sentences */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400">
                          {item.meal.proteinG}g Protein
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white/[0.05] text-slate-300">
                          {item.meal.carbsG}g Carbs
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white/[0.05] text-slate-300">
                          {item.meal.fatG}g Fat
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-cyan-500/15 text-cyan-300">
                          {item.meal.fiberG}g Fiber
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                    {/* Shuffle / Swap button */}
                    <button
                      type="button"
                      onClick={(e) => handleShuffleMeal(item.key, e)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[12px] font-bold border border-white/10 active:scale-95 transition-all"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Swap Dish</span>
                    </button>

                    {/* Log Eaten Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleMealLog(item.key, e)}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-extrabold transition-all active:scale-95 border',
                        isLogged
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400'
                      )}
                    >
                      {isLogged ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eaten ✓</span>
                        </>
                      ) : (
                        <>
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Log Meal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Interactive "Smart Swap" Arena (No Walls of Text!) ─ */}
        <div
          className="rounded-[28px] p-5 space-y-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(244,63,94,0.06) 0%, rgba(16,185,129,0.08) 100%)',
            border: '1px solid rgba(16,185,129,0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-[17px] font-black text-white">Smart Swap Arena</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Cut Empty Calories
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {smartSwaps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSwapCategoryIndex(idx);
                  setIsSwapped(false);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all border flex items-center gap-1 active:scale-95',
                  swapCategoryIndex === idx
                    ? 'bg-white/[0.18] text-white border-white/30 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                )}
              >
                <span>{s.icon}</span>
                <span>{s.category}</span>
              </button>
            ))}
          </div>

          {/* Interactive Face-off Arena Card */}
          <div className="p-4 rounded-[22px] bg-black/40 border border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Craving */}
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Craving</span>
                <span className="text-[14px] font-extrabold text-white block leading-tight">{currentSwap.unhealthy.name}</span>
                <span className="text-[13px] font-black text-rose-400 block">{currentSwap.unhealthy.kcal} kcal</span>
                <span className="text-[10px] text-slate-400 block">{currentSwap.unhealthy.tag}</span>
              </div>

              {/* Healthy Swap */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Choose This</span>
                <span className="text-[14px] font-extrabold text-white block leading-tight">{currentSwap.healthy.name}</span>
                <span className="text-[13px] font-black text-emerald-400 block">{currentSwap.healthy.kcal} kcal</span>
                <span className="text-[10px] text-emerald-300 block">{currentSwap.healthy.tag}</span>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-center">
              <span className="text-[13px] font-extrabold text-amber-300">{currentSwap.savings}</span>
            </div>

            {/* Interactive Adopt Button */}
            <button
              type="button"
              onClick={handleApplySwap}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[13px] active:scale-98 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Adopt this Swap Today</span>
            </button>
          </div>

          {swapToast && (
            <div className="p-2.5 rounded-xl bg-emerald-500/30 border border-emerald-400/50 text-[12px] font-bold text-emerald-200 text-center animate-in fade-in">
              {swapToast}
            </div>
          )}
        </div>

        {/* ── Interactive 1-Line Smart Pro Tips ──────────────── */}
        <div className="rounded-[24px] bg-white/[0.03] border border-white/[0.07] p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[14px] font-extrabold text-white">Quick Nutrition Hacks</h3>
          </div>

          {/* Interactive Chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTip(c.tip)}
                className="px-2.5 py-1 rounded-xl text-[11.5px] font-bold bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 active:scale-95 transition-all"
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[13px] text-slate-200 leading-relaxed font-medium">
            {activeTip}
          </div>
        </div>

      </div>

      {/* Profile Modal */}
      <FoodProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Meal Detail Modal */}
      <FoodDetailModal
        meal={selectedMeal}
        profile={profile}
        isOpen={Boolean(selectedMeal)}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
}
