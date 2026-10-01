import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, SlidersHorizontal, Calendar, 
  Sun, Utensils, Coffee, Moon, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronRight, Droplets, CheckCircle, 
  AlertTriangle, RefreshCw, Send, MessageSquare
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

export default function HealthyFoodScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FoodProfile>(() => NutritionEngine.loadProfile());
  const [mealPlan, setMealPlan] = useState<DailyMealPlan>(() => NutritionEngine.getTodaysMealPlan(profile));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(6);
  
  // SI Copilot Chat state
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: 'user' | 'si'; text: string; swap?: any }>>([
    {
      sender: 'si',
      text: `Hello! I'm your SI Nutrition Copilot. Based on your profile (${profile.age} yrs, ${profile.weightKg}kg, ${profile.goal} goal), I've designed your plan with ${mealPlan.calorieTarget} kcal and ${mealPlan.proteinTargetG}g protein. Need any ingredient substitutions or restaurant advice?`
    }
  ]);

  // Recalculate meal plan when profile changes
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

  const handleSendCopilotQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotQuestion.trim()) return;

    const q = copilotQuestion.trim();
    setCopilotQuestion('');
    setCopilotHistory(prev => [...prev, { sender: 'user', text: q }]);

    setTimeout(() => {
      const response = NutritionSIAssistant.askQuestion(q, profile);
      setCopilotHistory(prev => [
        ...prev, 
        { 
          sender: 'si', 
          text: response.answer,
          swap: response.recommendedSwap
        }
      ]);
    }, 400);
  };

  const bmiInfo = NutritionEngine.calculateBMI(profile.weightKg, profile.heightCm);

  // Nutrition progress metrics calculated against target
  const proteinPercent = Math.min(100, Math.round((mealPlan.totalProteinG / mealPlan.proteinTargetG) * 100));
  const fiberPercent = Math.min(100, Math.round((mealPlan.totalFiberG / mealPlan.fiberTargetG) * 100));
  const caloriesPercent = Math.min(100, Math.round((mealPlan.totalCalories / mealPlan.calorieTarget) * 100));

  return (
    <div 
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #16172B 0%, #0B0E14 50%, #07090E 100%)'
      }}
    >
      <SEOHead title="Healthy Food & Nutrition | CHATR OS" description="Personalized deterministic nutrition backed by SI intelligence" />

      <div className="mx-auto max-w-[540px] w-full px-4 pt-3.5 space-y-4">
        
        {/* ── Top Bar ───────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/health')}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              <h1 className="text-[19px] font-extrabold tracking-tight text-white">
                Healthy Food
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/health/food/plan')}
              className="flex h-9 px-3 items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white text-[12px] font-semibold active:scale-95 transition-all"
            >
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>7-Day Plan</span>
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
              title="Edit Profile"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Your Profile Summary Card ─────────────────────── */}
        <div className="rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Health Profile
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-[11.5px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
            >
              Edit <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block font-medium">Age</span>
              <span className="text-[15px] font-extrabold text-white">{profile.age}</span>
              <span className="text-[9.5px] text-slate-500 block">years</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block font-medium">Weight</span>
              <span className="text-[15px] font-extrabold text-white">{profile.weightKg}</span>
              <span className="text-[9.5px] text-slate-500 block">kg</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block font-medium">Height</span>
              <span className="text-[15px] font-extrabold text-white">{profile.heightCm}</span>
              <span className="text-[9.5px] text-slate-500 block">cm</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block font-medium">Goal</span>
              <span className="text-[14px] font-bold text-cyan-400 capitalize truncate block">
                {profile.goal}
              </span>
              <span className="text-[9.5px] text-emerald-400 block">BMI {bmiInfo.bmi}</span>
            </div>
          </div>
        </div>

        {/* ── Diet Preference Filter Bar ────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {[
              { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
              { id: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
              { id: 'eggitarian', label: 'Eggitarian', icon: '🥚' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => handleDietChange(d.id as DietPreference)}
                className={cn(
                  "flex-1 py-2 px-2.5 rounded-2xl text-[12.5px] font-bold transition-all border flex items-center justify-center gap-1.5 active:scale-95",
                  profile.dietPreference === d.id
                    ? "bg-white/[0.16] text-white border-white/30 shadow-md"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-200"
                )}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          {/* Cuisine sub-filters */}
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[11px] text-slate-400 font-medium">Cuisine:</span>
            {(['indian', 'continental', 'mixed'] as const).map(c => (
              <button
                key={c}
                onClick={() => handleCuisineChange(c)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize transition-all border",
                  profile.cuisinePreference === c
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/[0.02] text-slate-400 border-white/[0.05] hover:text-slate-200"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Today's Nutrition Progress (Visual Bars) ──────── */}
        <div className="rounded-[28px] bg-white/[0.04] border border-white/[0.08] p-5 backdrop-blur-xl shadow-lg shadow-black/25 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-extrabold text-white">
                Today's Nutrition
              </h2>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Target: {mealPlan.calorieTarget} kcal • Planned: {mealPlan.totalCalories} kcal
              </p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold">
              <span>{caloriesPercent}% Target</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Protein Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-300">Protein</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {mealPlan.totalProteinG}g / {mealPlan.proteinTargetG}g ({proteinPercent}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Fiber Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-300">Fiber</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {mealPlan.totalFiberG}g / {mealPlan.fiberTargetG}g ({fiberPercent}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${fiberPercent}%` }}
                />
              </div>
            </div>

            {/* Vegetables & Greens */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-300">Vegetables</span>
                <span className="font-mono text-amber-400 font-bold">420g / 500g (84%)</span>
              </div>
              <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: '84%' }}
                />
              </div>
            </div>

            {/* Fruits & Micronutrients */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-300">Fruits</span>
                <span className="font-mono text-rose-400 font-bold">200g / 250g (80%)</span>
              </div>
              <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: '80%' }}
                />
              </div>
            </div>
          </div>

          {/* Quick Water Tracker */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[12px] font-bold text-white block">Hydration</span>
                <span className="text-[10.5px] text-slate-400">{waterGlasses * 250} ml / 2500 ml target</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-extrabold text-cyan-400 mr-1">{waterGlasses} glasses</span>
              <button
                onClick={() => setWaterGlasses(prev => Math.min(16, prev + 1))}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 active:scale-95 transition-all"
              >
                + 1 Glass
              </button>
            </div>
          </div>
        </div>

        {/* ── Meals Section ─────────────────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15.5px] font-bold text-white">
              Today's Meals
            </h2>
            <span className="text-[11.5px] text-slate-400">
              Tap any meal for "Why this food?" & swaps
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 1. Breakfast */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.breakfast)}
              className="p-4 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-amber-400">
                    Breakfast
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-extrabold text-white">
                    {mealPlan.meals.breakfast.calories} kcal
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <p className="text-[14px] font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                {mealPlan.meals.breakfast.name}
              </p>
              <p className="text-[12px] text-slate-400 line-clamp-1">
                {mealPlan.meals.breakfast.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-400 border-t border-white/[0.04]">
                <span className="text-emerald-400">{mealPlan.meals.breakfast.proteinG}g Protein</span>
                <span>{mealPlan.meals.breakfast.carbsG}g Carbs</span>
                <span>{mealPlan.meals.breakfast.fatG}g Fat</span>
                <span className="text-cyan-400">{mealPlan.meals.breakfast.fiberG}g Fiber</span>
              </div>
            </div>

            {/* 2. Lunch */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.lunch)}
              className="p-4 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-400">
                    Lunch
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-extrabold text-white">
                    {mealPlan.meals.lunch.calories} kcal
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <p className="text-[14px] font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                {mealPlan.meals.lunch.name}
              </p>
              <p className="text-[12px] text-slate-400 line-clamp-1">
                {mealPlan.meals.lunch.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-400 border-t border-white/[0.04]">
                <span className="text-emerald-400">{mealPlan.meals.lunch.proteinG}g Protein</span>
                <span>{mealPlan.meals.lunch.carbsG}g Carbs</span>
                <span>{mealPlan.meals.lunch.fatG}g Fat</span>
                <span className="text-cyan-400">{mealPlan.meals.lunch.fiberG}g Fiber</span>
              </div>
            </div>

            {/* 3. Snack */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.snack)}
              className="p-4 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-orange-400">
                    Evening Snack
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-extrabold text-white">
                    {mealPlan.meals.snack.calories} kcal
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <p className="text-[14px] font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                {mealPlan.meals.snack.name}
              </p>
              <p className="text-[12px] text-slate-400 line-clamp-1">
                {mealPlan.meals.snack.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-400 border-t border-white/[0.04]">
                <span className="text-emerald-400">{mealPlan.meals.snack.proteinG}g Protein</span>
                <span>{mealPlan.meals.snack.carbsG}g Carbs</span>
                <span>{mealPlan.meals.snack.fatG}g Fat</span>
                <span className="text-cyan-400">{mealPlan.meals.snack.fiberG}g Fiber</span>
              </div>
            </div>

            {/* 4. Dinner */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.dinner)}
              className="p-4 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-indigo-400">
                    Dinner
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-extrabold text-white">
                    {mealPlan.meals.dinner.calories} kcal
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <p className="text-[14px] font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                {mealPlan.meals.dinner.name}
              </p>
              <p className="text-[12px] text-slate-400 line-clamp-1">
                {mealPlan.meals.dinner.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-400 border-t border-white/[0.04]">
                <span className="text-emerald-400">{mealPlan.meals.dinner.proteinG}g Protein</span>
                <span>{mealPlan.meals.dinner.carbsG}g Carbs</span>
                <span>{mealPlan.meals.dinner.fatG}g Fat</span>
                <span className="text-cyan-400">{mealPlan.meals.dinner.fiberG}g Fiber</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Healthy Alternatives Section ──────────────────── */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15.5px] font-bold text-white">
              Healthy Alternatives
            </h2>
            <span className="text-[11.5px] text-slate-400 font-medium">
              Instead of → Choose
            </span>
          </div>

          <div className="space-y-2">
            {NutritionEngine.HEALTHY_ALTERNATIVES.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-[20px] bg-white/[0.03] border border-white/[0.06] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>{item.icon}</span> {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12.5px]">
                  <span className="text-rose-400/90 line-through truncate max-w-[45%]">
                    {item.insteadOf}
                  </span>
                  <span className="text-slate-500 font-bold shrink-0">→</span>
                  <span className="text-emerald-400 font-semibold truncate flex-1">
                    {item.chooseThis}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 {item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SI Nutrition Copilot (Conversational Assistant) ── */}
        <div className="rounded-[28px] bg-emerald-950/20 border border-emerald-500/25 p-4 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            <h3 className="text-[14.5px] font-extrabold tracking-tight text-white">
              SI Nutrition Copilot
            </h3>
          </div>

          {/* Chat history */}
          <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide pr-1">
            {copilotHistory.map((msg, i) => (
              <div 
                key={i}
                className={cn(
                  "p-3 rounded-2xl text-[12px] leading-relaxed max-w-[92%]",
                  msg.sender === 'user'
                    ? "ml-auto bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                    : "mr-auto bg-black/40 text-slate-200 border border-white/10"
                )}
              >
                <p>{msg.text}</p>
                {msg.swap && (
                  <div className="mt-2 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] space-y-0.5">
                    <div className="text-rose-300">Swap: {msg.swap.original}</div>
                    <div className="text-emerald-300 font-semibold">With: {msg.swap.substitute}</div>
                    <div className="text-cyan-400 text-[10px]">{msg.swap.macroDifference}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick query chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              "Swap paneer/dairy today",
              "Travelling options",
              "Low calorie snack idea",
              "How to stop sweet cravings?"
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCopilotQuestion(q);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 active:scale-95 transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendCopilotQuestion} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Ask SI about meals, swaps, or goals..."
              value={copilotQuestion}
              onChange={e => setCopilotQuestion(e.target.value)}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-[12.5px] focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={!copilotQuestion.trim()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold active:scale-95 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ── Medical Nutrition Disclaimer (Non-Negotiable) ─── */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-slate-400 text-[11px] flex items-start gap-2.5 leading-relaxed">
          <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <div>
            <span className="font-bold text-slate-300 block mb-0.5">Clinical Boundary Notice</span>
            <p>{NutritionSIAssistant.MEDICAL_DISCLAIMER}</p>
          </div>
        </div>

      </div>

      {/* Profile Edit Modal */}
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
