import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Heart, Shield, Activity, 
  ChevronRight, Sparkles, User, Scale, Flame
} from 'lucide-react';
import { 
  FoodProfile, NutritionEngine, DietPreference, 
  CuisinePreference, Goal, ActivityLevel, Sex 
} from '@/services/health/food/NutritionEngine';
import { cn } from '@/lib/utils';

interface FoodProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FoodProfile;
  onSave: (updated: FoodProfile) => void;
}

export const FoodProfileModal: React.FC<FoodProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState<FoodProfile>({ ...profile });
  const [allergyInput, setAllergyInput] = useState('');

  if (!isOpen) return null;

  const bmiInfo = NutritionEngine.calculateBMI(formData.weightKg, formData.heightCm);
  const macroTargets = NutritionEngine.calculateMacroTargets(formData);

  const toggleAllergy = (allergen: string) => {
    setFormData(prev => {
      const exists = prev.allergies.includes(allergen);
      return {
        ...prev,
        allergies: exists 
          ? prev.allergies.filter(a => a !== allergen)
          : [...prev.allergies, allergen]
      };
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const commonAllergens = ['Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Shellfish'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-[28px] bg-[#121622] border border-white/10 text-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-hide my-auto"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white leading-tight">
                Personalized Food Profile
              </h2>
              <p className="text-[12px] text-slate-400">
                Tailoring calories & nutrition to your biometrics
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live BMI & Energy Preview */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">BMI</span>
            <span className="text-[18px] font-extrabold text-white">{bmiInfo.bmi}</span>
            <span className="text-[10px] font-semibold text-emerald-400 block">{bmiInfo.category}</span>
          </div>
          <div className="border-x border-white/[0.08] px-2">
            <span className="text-[11px] font-medium text-slate-400 block">Calorie Target</span>
            <span className="text-[18px] font-extrabold text-cyan-400">{macroTargets.calorieTarget}</span>
            <span className="text-[10px] text-slate-400 block">kcal/day</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Protein Target</span>
            <span className="text-[18px] font-extrabold text-emerald-400">{macroTargets.proteinTargetG}g</span>
            <span className="text-[10px] text-slate-400 block">daily goal</span>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 text-left">
          
          {/* Biometrics Grid: Age, Sex, Height, Weight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11.5px] font-medium text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                min="12"
                max="105"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) || 25 })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold text-[14px] focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-slate-300 block mb-1">Sex</label>
              <select
                value={formData.sex}
                onChange={e => setFormData({ ...formData, sex: e.target.value as Sex })}
                className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-2.5 py-2 text-white font-semibold text-[13px] focus:outline-none focus:border-emerald-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unspecified">Unspecified</option>
              </select>
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-slate-300 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="240"
                value={formData.heightCm}
                onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) || 170 })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold text-[14px] focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-slate-300 block mb-1">Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) || 65 })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold text-[14px] focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Nutrition Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['lose', 'maintain', 'gain'] as const).map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal })}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[12.5px] font-bold capitalize transition-all border",
                    formData.goal === goal
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  {goal === 'lose' ? 'Lose Weight' : goal === 'gain' ? 'Build Muscle' : 'Maintain'}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Activity Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sedentary', label: 'Sedentary (Desk job)' },
                { id: 'light', label: 'Light (1-2 workouts/wk)' },
                { id: 'moderate', label: 'Moderate (3-5 workouts)' },
                { id: 'very_active', label: 'Very Active (Athlete)' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, activityLevel: item.id as ActivityLevel })}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-[11.5px] font-medium text-left transition-all border",
                    formData.activityLevel === item.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preference */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Dietary Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'non_vegetarian', label: 'Non-Veg' },
                { id: 'eggitarian', label: 'Eggitarian' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietPreference: item.id as DietPreference })}
                  className={cn(
                    "py-2 px-2 rounded-xl text-[12px] font-bold transition-all border text-center",
                    formData.dietPreference === item.id
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Preference */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Cuisine Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['indian', 'continental', 'mixed'] as const).map(cuisine => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => setFormData({ ...formData, cuisinePreference: cuisine })}
                  className={cn(
                    "py-1.5 px-2 rounded-xl text-[12px] font-medium capitalize transition-all border text-center",
                    formData.cuisinePreference === cuisine
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies / Exclusions */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Food Allergies & Sensitivities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {commonAllergens.map(allergen => {
                const isSelected = formData.allergies.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergy(allergen)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                      isSelected
                        ? "bg-red-500/20 text-red-300 border-red-500/50"
                        : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]"
                    )}
                  >
                    {allergen} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medical Safety Guardrail */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p>
              <strong>Important Notice:</strong> This provides general healthy lifestyle eating guidance based on established nutritional science, not medical treatment. If you have diabetes, chronic kidney disease, severe allergies or are pregnant, consult your physician.
            </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-[14px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
          >
            Save & Update Meal Plan
          </button>
        </div>

      </div>
    </div>
  );
};
