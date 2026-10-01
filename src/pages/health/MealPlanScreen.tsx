import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Sparkles, Sun, Utensils, 
  Coffee, Moon, CheckCircle2, ShoppingBag
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { 
  FoodProfile, NutritionEngine, DietPreference, MealItem 
} from '@/services/health/food/NutritionEngine';
import { FoodDetailModal } from '@/components/health/food/FoodDetailModal';
import { cn } from '@/lib/utils';

export default function MealPlanScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FoodProfile>(() => NutritionEngine.loadProfile());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'groceries'>('schedule');

  // Days ordered Mon–Sun; compute offset from today so each maps to a real calendar day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayJsDay = new Date().getDay(); // 0=Sun…6=Sat
  // Convert to Mon-based index (0=Mon … 6=Sun)
  const todayMonIdx = (todayJsDay + 6) % 7;

  // Offset from today to the selected day-of-week
  const selectedDayOffset = (selectedDayIndex - todayMonIdx + 7) % 7;

  // Memoize meal plan per selected day so we don't recompute every render
  const mealPlan = useMemo(
    () => NutritionEngine.getDayMealPlan(profile, selectedDayOffset),
    [profile, selectedDayOffset]
  );

  const handleDietChange = (diet: DietPreference) => {
    const updated = { ...profile, dietPreference: diet };
    setProfile(updated);
    NutritionEngine.saveProfile(updated);
  };

  const groceryItems = [
    { category: 'Proteins & Dairy', items: profile.dietPreference === 'vegetarian' ? ['Fresh Low-Fat Paneer (500g)', 'Firm Tofu (300g)', 'Probiotic Greek Curd (1kg)', 'Yellow Moong Dal (1kg)'] : ['Lean Chicken Breast (1kg)', 'Fresh Salmon / Fish Fillet (500g)', 'Eggs (12 pack)', 'Yellow Moong Dal (500g)'] },
    { category: 'Grains & Complex Carbs', items: ['Rolled Whole Oats (500g)', 'Multigrain Atta (Whole wheat + Jowar/Bajra)', 'Brown Basmati Rice (1kg)', 'Organic Quinoa (250g)'] },
    { category: 'Fresh Produce', items: ['Spinach & Methi leaves', 'Broccoli & Carrots', 'Bell Peppers & Cucumbers', 'Seasonal Apples & Papaya'] },
    { category: 'Healthy Fats & Superfoods', items: ['Fox Nuts (Makhana 200g)', 'Raw California Almonds', 'Chia Seeds', 'Cold Pressed Olive Oil'] }
  ];

  return (
    <div 
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #16172B 0%, #0B0E14 50%, #07090E 100%)'
      }}
    >
      <SEOHead title="7-Day Meal Plan | CHATR OS" description="Structured weekly nutrition plan tailored to your body" />

      <div className="mx-auto max-w-[540px] w-full px-4 pt-3.5 space-y-4">
        
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/health/food')}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h1 className="text-[19px] font-extrabold tracking-tight text-white">
                7-Day Meal Plan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                "px-3 py-1 rounded-full text-[12px] font-bold transition-all",
                activeTab === 'schedule' ? "bg-white/[0.16] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('groceries')}
              className={cn(
                "px-3 py-1 rounded-full text-[12px] font-bold transition-all flex items-center gap-1",
                activeTab === 'groceries' ? "bg-white/[0.16] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Groceries</span>
            </button>
          </div>
        </header>

        {/* Diet Preference toggle */}
        <div className="flex items-center gap-2">
          {[
            { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
            { id: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
            { id: 'eggitarian', label: 'Eggitarian', icon: '🥚' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => handleDietChange(d.id as DietPreference)}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-xl text-[12px] font-bold transition-all border flex items-center justify-center gap-1.5",
                profile.dietPreference === d.id
                  ? "bg-white/[0.14] text-white border-white/30 shadow-sm"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
              )}
            >
              <span>{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'schedule' ? (
          <>
            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {days.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold shrink-0 transition-all border",
                    selectedDayIndex === idx
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Target Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[12px]">
              <div>
                <span className="text-slate-400 block font-medium">{days[selectedDayIndex]} Targets</span>
                <span className="text-white font-extrabold text-[14px]">
                  {mealPlan.calorieTarget} kcal • {mealPlan.proteinTargetG}g Protein
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                100% Balanced
              </span>
            </div>

            {/* Meals for selected day */}
            <div className="space-y-2.5">
              {[
                { time: 'Breakfast', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/20', meal: mealPlan.meals.breakfast },
                { time: 'Lunch', icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/20', meal: mealPlan.meals.lunch },
                { time: 'Evening Snack', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/20', meal: mealPlan.meals.snack },
                { time: 'Dinner', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/20', meal: mealPlan.meals.dinner },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedMeal(item.meal)}
                  className="p-3.5 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", item.bg, item.color)}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className={cn("text-[10.5px] font-bold uppercase tracking-wider block", item.color)}>
                        {item.time}
                      </span>
                      <p className="text-[13px] font-bold text-white leading-tight truncate group-hover:text-cyan-200 transition-colors">
                        {item.meal.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-bold text-slate-300 block">
                      {item.meal.calories} kcal
                    </span>
                    <span className="text-[10.5px] text-emerald-400 font-semibold block">
                      {item.meal.proteinG}g P
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Smart Groceries Checklist */
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-[12px] text-cyan-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Smart Grocery Checklist generated for your 7-day nutritional targets.</span>
            </div>

            <div className="space-y-3">
              {groceryItems.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <h3 className="text-[13px] font-bold text-white flex items-center justify-between">
                    <span>{cat.category}</span>
                    <span className="text-[11px] font-normal text-slate-400">{cat.items.length} items</span>
                  </h3>
                  <div className="space-y-1.5">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2.5 text-[12.5px] text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <FoodDetailModal
        meal={selectedMeal}
        profile={profile}
        isOpen={Boolean(selectedMeal)}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
}
