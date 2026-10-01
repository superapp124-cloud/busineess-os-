import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, AlertCircle, Check, 
  Scale, Flame, Heart, Activity, User, ShieldCheck
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { 
  FoodProfile, NutritionEngine, DietPreference, 
  CuisinePreference, Goal, ActivityLevel, Sex 
} from '@/services/health/food/NutritionEngine';
import { cn } from '@/lib/utils';

export default function FoodProfileScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FoodProfile>(() => NutritionEngine.loadProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    NutritionEngine.saveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/health/food');
    }, 600);
  };

  const commonAllergens = ['Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Shellfish'];

  return (
    <div 
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #16172B 0%, #0B0E14 50%, #07090E 100%)'
      }}
    >
      <SEOHead title="Nutrition Profile | CHATR OS" description="Calibrate your personalized biometric nutrition" />

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
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h1 className="text-[19px] font-extrabold tracking-tight text-white">
                Nutrition Profile
              </h1>
            </div>
          </div>
        </header>

        {/* Live Calculation Preview Banner */}
        <div className="rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">BMI</span>
            <span className="text-[20px] font-black text-white">{bmiInfo.bmi}</span>
            <span className="text-[11px] font-semibold text-emerald-400 block">{bmiInfo.category}</span>
          </div>
          <div className="border-x border-white/[0.08] px-2">
            <span className="text-[11px] font-medium text-slate-400 block">Daily Target</span>
            <span className="text-[20px] font-black text-cyan-400">{macroTargets.calorieTarget}</span>
            <span className="text-[11px] text-slate-400 block">kcal</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Protein Goal</span>
            <span className="text-[20px] font-black text-emerald-400">{macroTargets.proteinTargetG}g</span>
            <span className="text-[11px] text-slate-400 block">per day</span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="rounded-[28px] bg-white/[0.04] border border-white/[0.08] p-5 space-y-4">
          
          {/* Biometrics */}
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
              Target Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['lose', 'maintain', 'gain'] as const).map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal })}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-[12.5px] font-bold capitalize transition-all border",
                    formData.goal === goal
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  {goal === 'lose' ? 'Lose Weight' : goal === 'gain' ? 'Gain Muscle' : 'Maintain'}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Daily Activity Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sedentary', label: 'Sedentary (Desk work)' },
                { id: 'light', label: 'Lightly Active (1-2x/wk)' },
                { id: 'moderate', label: 'Moderately Active (3-5x/wk)' },
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

          {/* Diet Preference */}
          <div>
            <label className="text-[12px] font-semibold text-slate-300 block mb-1.5">
              Dietary Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                { id: 'eggitarian', label: 'Eggitarian' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietPreference: item.id as DietPreference })}
                  className={cn(
                    "py-2.5 px-2 rounded-xl text-[12px] font-bold transition-all border text-center",
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

          {/* Allergies */}
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
                      "px-3 py-1.5 rounded-xl text-[11.5px] font-medium transition-all border",
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

          {/* Medical Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p>
              <strong>Clinical Guardrail:</strong> Recommendations are calculated using sports science & nutritional guidelines for general healthy living. Patients with kidney dysfunction, diabetes, or pregnancy should seek formal clinical consultation.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-[14px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Profile Calibrated & Saved!</span>
                </>
              ) : (
                <span>Save Profile & Recalculate Nutrition</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
