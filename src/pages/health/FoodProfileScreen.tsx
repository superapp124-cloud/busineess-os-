import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, AlertCircle, Check, 
  Plus, Minus, ChevronLeft
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { 
  FoodProfile, NutritionEngine, DietPreference, 
  CuisinePreference, Goal, ActivityLevel, Sex 
} from '@/services/health/food/NutritionEngine';
import { cn } from '@/lib/utils';

/* ─── Stepper Component ────────────────────────────────────────────── */
function Stepper({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-[22px] bg-white/[0.04] border border-white/10 shadow-sm">
      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 text-white active:scale-90 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center min-w-[56px]">
          <span className="text-[28px] font-black text-white leading-none">{value}</span>
          <span className="text-[12px] text-slate-400 block mt-0.5">{unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-emerald-400 active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Pill Selection Grid ─────────────────────────────────────────── */
function PillGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  cols = 3,
  colorActive = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
}: {
  label: string;
  options: { id: T; label: string; icon?: string }[];
  value: T;
  onChange: (val: T) => void;
  cols?: number;
  colorActive?: string;
}) {
  return (
    <div>
      <label className="text-[13px] font-bold text-slate-300 block mb-2">{label}</label>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'py-3 px-2 rounded-2xl text-[13px] font-bold transition-all border text-center active:scale-95 leading-snug',
              value === opt.id
                ? colorActive
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            )}
          >
            {opt.icon && <span className="block text-[18px] mb-0.5">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FoodProfileScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FoodProfile>(() => NutritionEngine.loadProfile());
  const [saved, setSaved] = useState(false);

  const bmi = NutritionEngine.calculateBMI(formData.weightKg, formData.heightCm);
  const macros = NutritionEngine.calculateMacroTargets(formData);

  const set = <K extends keyof FoodProfile>(key: K, val: FoodProfile[K]) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    NutritionEngine.saveProfile(formData);
    setTimeout(() => {
      navigate('/health/food');
    }, 600);
  };

  const commonAllergens = ['Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Shellfish'];

  return (
    <div 
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #161a2e 0%, #0b0e17 50%, #060810 100%)'
      }}
    >
      <SEOHead title="Nutrition Profile | CHATR OS" description="Calibrate your personalized biometric nutrition" />

      <div className="mx-auto max-w-[540px] w-full px-4 pt-4 space-y-5">
        
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/health/food')}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h1 className="text-[20px] font-black tracking-tight text-white">
                Nutrition Profile
              </h1>
            </div>
          </div>
        </header>

        {/* ── Live Calculation Preview Banner ── */}
        <div
          className="rounded-[28px] p-5 grid grid-cols-3 gap-3 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.08)'
          }}
        >
          <div>
            <span className="text-[12px] font-semibold text-slate-400 block mb-1">BMI</span>
            <span className="text-[28px] font-black text-white leading-none">{bmi.bmi}</span>
            <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">{bmi.category}</span>
          </div>
          <div className="border-x border-white/[0.08] px-2">
            <span className="text-[12px] font-semibold text-slate-400 block mb-1">Daily kcal</span>
            <span className="text-[28px] font-black text-cyan-400 leading-none">{macros.calorieTarget}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">target</span>
          </div>
          <div>
            <span className="text-[12px] font-semibold text-slate-400 block mb-1">Protein</span>
            <span className="text-[28px] font-black text-emerald-400 leading-none">{macros.proteinTargetG}g</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">per day</span>
          </div>
        </div>

        {/* ── Biometrics Steppers ── */}
        <div className="space-y-3">
          <h3 className="text-[14px] font-bold text-white px-1">📏 Biometrics</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stepper label="Age" unit="years" value={formData.age} min={12} max={105}
              onChange={v => set('age', v)} />
            <Stepper label="Weight" unit="kg" value={formData.weightKg} min={25} max={300} step={0.5}
              onChange={v => set('weightKg', parseFloat(v.toFixed(1)))} />
            <Stepper label="Height" unit="cm" value={formData.heightCm} min={100} max={250}
              onChange={v => set('heightCm', v)} />
            <Stepper label="Meals/day" unit="meals" value={formData.mealsPerDay} min={2} max={6}
              onChange={v => set('mealsPerDay', v)} />
          </div>
        </div>

        {/* ── Sex ── */}
        <PillGrid<Sex>
          label="🧬 Biological Sex (affects BMR)"
          options={[
            { id: 'male', label: 'Male' },
            { id: 'female', label: 'Female' },
            { id: 'unspecified', label: 'Prefer not to say' },
          ]}
          value={formData.sex}
          onChange={v => set('sex', v)}
          cols={3}
        />

        {/* ── Goal ── */}
        <PillGrid<Goal>
          label="🎯 Target Goal"
          options={[
            { id: 'lose', label: 'Lose Weight', icon: '🔥' },
            { id: 'maintain', label: 'Maintain', icon: '⚖️' },
            { id: 'gain', label: 'Gain Muscle', icon: '💪' },
          ]}
          value={formData.goal}
          onChange={v => set('goal', v)}
          cols={3}
          colorActive="bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
        />

        {/* ── Activity Level ── */}
        <PillGrid<ActivityLevel>
          label="🏃 Daily Activity Level"
          options={[
            { id: 'sedentary', label: 'Sedentary (desk work)' },
            { id: 'light', label: 'Light (1–2×/wk)' },
            { id: 'moderate', label: 'Moderate (3–5×/wk)' },
            { id: 'very_active', label: 'Very Active (Athlete)' },
          ]}
          value={formData.activityLevel}
          onChange={v => set('activityLevel', v)}
          cols={2}
          colorActive="bg-amber-500/20 text-amber-300 border-amber-500/40"
        />

        {/* ── Diet Preference ── */}
        <PillGrid<DietPreference>
          label="🥗 Diet Preference"
          options={[
            { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
            { id: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
            { id: 'eggitarian', label: 'Eggitarian', icon: '🥚' },
            { id: 'vegan', label: 'Vegan', icon: '🥑' },
          ]}
          value={formData.dietPreference}
          onChange={v => set('dietPreference', v)}
          cols={2}
          colorActive="bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        />

        {/* ── Cuisine Preference ── */}
        <PillGrid<CuisinePreference>
          label="🍛 Preferred Cuisine"
          options={[
            { id: 'north_indian', label: 'North Indian' },
            { id: 'south_indian', label: 'South Indian' },
            { id: 'pan_indian', label: 'Pan-Indian' },
            { id: 'mediterranean', label: 'Mediterranean' },
            { id: 'continental', label: 'Continental' },
            { id: 'asian', label: 'Asian Fusion' },
          ]}
          value={formData.cuisinePreference}
          onChange={v => set('cuisinePreference', v)}
          cols={3}
        />

        {/* ── Allergies & Intolerances ── */}
        <div>
          <label className="text-[13px] font-bold text-slate-300 block mb-2">
            ⚠️ Allergies & Intolerances (auto-filtered)
          </label>
          <div className="flex flex-wrap gap-2">
            {commonAllergens.map(allergen => {
              const isOn = formData.allergies.includes(allergen);
              return (
                <button
                  key={allergen}
                  type="button"
                  onClick={() =>
                    set('allergies', isOn
                      ? formData.allergies.filter(a => a !== allergen)
                      : [...formData.allergies, allergen]
                    )
                  }
                  className={cn(
                    'px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all border active:scale-95',
                    isOn
                      ? 'bg-red-500/25 text-red-300 border-red-500/40'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08]'
                  )}
                >
                  {allergen} {isOn && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Clinical Guardrail ── */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-200/80 leading-relaxed">
            <strong>Clinical Guardrail:</strong> Recommendations use Mifflin-St Jeor BMR + sports science macros.
            Consult a registered dietitian for kidney disease, diabetes, pregnancy, or eating disorders.
          </p>
        </div>

        {/* ── Save Button ── */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 rounded-[22px] text-[16px] font-extrabold text-slate-950 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-xl"
          style={{
            background: saved
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.35)'
          }}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Profile Saved & Recalculated!
            </>
          ) : (
            'Save Profile & Recalculate'
          )}
        </button>

      </div>
    </div>
  );
}
