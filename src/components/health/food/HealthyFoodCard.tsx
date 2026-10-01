import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChevronRight, Sun, Utensils, Coffee, 
  Moon, SlidersHorizontal, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';
import { 
  FoodProfile, DailyMealPlan, NutritionEngine, 
  DietPreference, MealItem 
} from '@/services/health/food/NutritionEngine';
import { FoodProfileModal } from './FoodProfileModal';
import { FoodDetailModal } from './FoodDetailModal';
import { cn } from '@/lib/utils';

export const HealthyFoodCard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FoodProfile>(() => NutritionEngine.loadProfile());
  const [mealPlan, setMealPlan] = useState<DailyMealPlan>(() => NutritionEngine.getTodaysMealPlan(profile));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);

  // Update meal plan when profile changes
  useEffect(() => {
    setMealPlan(NutritionEngine.getTodaysMealPlan(profile));
  }, [profile]);

  const handleDietChange = (diet: DietPreference) => {
    const updated = { ...profile, dietPreference: diet };
    setProfile(updated);
    NutritionEngine.saveProfile(updated);
  };

  const handleSaveProfile = (updated: FoodProfile) => {
    setProfile(updated);
    NutritionEngine.saveProfile(updated);
  };

  const bmiInfo = NutritionEngine.calculateBMI(profile.weightKg, profile.heightCm);

  return (
    <>
      <div 
        className="rounded-[28px] bg-white/[0.04] border border-white/[0.08] p-5 backdrop-blur-xl shadow-lg shadow-black/25 relative overflow-hidden space-y-4 hover:border-white/15 transition-all"
      >
        {/* Subtle ambient gradient highlight */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── Top Header Row ────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => navigate('/health/food')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 fill-emerald-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-extrabold text-white tracking-tight leading-none group-hover:text-emerald-300 transition-colors">
                  Healthy Food
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Personalized for age {profile.age}, {profile.weightKg}kg • {profile.goal}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold transition-all active:scale-95"
            title="Edit biometrics & goals"
          >
            <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
            <span>Profile</span>
          </button>
        </div>

        {/* ── Diet Preference Filter Pills ───────────────── */}
        <div className="flex items-center gap-2 pt-0.5">
          {[
            { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
            { id: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
            { id: 'eggitarian', label: 'Eggitarian', icon: '🥚' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => handleDietChange(d.id as DietPreference)}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-xl text-[12px] font-bold transition-all border flex items-center justify-center gap-1.5 active:scale-95",
                profile.dietPreference === d.id
                  ? "bg-white/[0.14] text-white border-white/30 shadow-sm"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-300"
              )}
            >
              <span>{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {/* ── Today's Plan Section ──────────────────────── */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Today's Plan</span>
            <span className="text-emerald-400 font-semibold lowercase">
              {mealPlan.totalCalories} kcal • {mealPlan.totalProteinG}g protein
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Breakfast */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.breakfast)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Breakfast
                  </span>
                  <p className="text-[13px] font-semibold text-white leading-tight truncate group-hover:text-amber-200 transition-colors">
                    {mealPlan.meals.breakfast.name}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-bold text-slate-300 block">
                  {mealPlan.meals.breakfast.calories} kcal
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {mealPlan.meals.breakfast.proteinG}g P
                </span>
              </div>
            </div>

            {/* Lunch */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.lunch)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Lunch
                  </span>
                  <p className="text-[13px] font-semibold text-white leading-tight truncate group-hover:text-emerald-200 transition-colors">
                    {mealPlan.meals.lunch.name}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-bold text-slate-300 block">
                  {mealPlan.meals.lunch.calories} kcal
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {mealPlan.meals.lunch.proteinG}g P
                </span>
              </div>
            </div>

            {/* Snack */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.snack)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                  <Coffee className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                    Evening Snack
                  </span>
                  <p className="text-[13px] font-semibold text-white leading-tight truncate group-hover:text-orange-200 transition-colors">
                    {mealPlan.meals.snack.name}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-bold text-slate-300 block">
                  {mealPlan.meals.snack.calories} kcal
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {mealPlan.meals.snack.proteinG}g P
                </span>
              </div>
            </div>

            {/* Dinner */}
            <div
              onClick={() => setSelectedMeal(mealPlan.meals.dinner)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    Dinner
                  </span>
                  <p className="text-[13px] font-semibold text-white leading-tight truncate group-hover:text-indigo-200 transition-colors">
                    {mealPlan.meals.dinner.name}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-bold text-slate-300 block">
                  {mealPlan.meals.dinner.calories} kcal
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {mealPlan.meals.dinner.proteinG}g P
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── View Full Meal Plan CTA ──────────────────── */}
        <div className="pt-1">
          <button
            onClick={() => navigate('/health/food')}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white font-bold text-[13px] flex items-center justify-center gap-2 active:scale-98 transition-all group"
          >
            <span>View full meal plan</span>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
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
    </>
  );
};
