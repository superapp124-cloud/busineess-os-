import React, { useState } from 'react';
import {
  X, Check, AlertCircle, Sparkles,
  Plus, Minus, ChevronLeft
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

/* ─── Stepper Control ─────────────────────────────────────────────── */
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
    <div className="flex flex-col items-center gap-2 p-4 rounded-[20px] bg-white/[0.05] border border-white/10">
      <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 text-white active:scale-90 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center min-w-[52px]">
          <span className="text-[26px] font-black text-white leading-none">{value}</span>
          <span className="text-[11px] text-slate-400 block">{unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-emerald-400 active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── SelectPill Grid ──────────────────────────────────────────────── */
function PillGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  cols = 3,
  colorActive = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
}: {
  label: string;
  options: { id: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
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

/* ─── Main Modal ──────────────────────────────────────────────────── */
export const FoodProfileModal: React.FC<FoodProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<FoodProfile>({ ...profile });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const bmi = NutritionEngine.calculateBMI(formData.weightKg, formData.heightCm);
  const macros = NutritionEngine.calculateMacroTargets(formData);

  const set = <K extends keyof FoodProfile>(key: K, val: FoodProfile[K]) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    onSave(formData);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  const commonAllergens = ['Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Shellfish'];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-xl animate-in fade-in duration-150">
      {/* ── Full-screen scrollable sheet ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: 'radial-gradient(circle at 50% 0%, #131a2e 0%, #090c13 60%, #060810 100%)' }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.07]"
          style={{ background: 'rgba(9,12,19,0.95)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[14px] font-semibold">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[16px] font-extrabold text-white">Edit Profile</span>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>

        <div className="px-5 py-5 space-y-6 pb-10">

          {/* ── Live Calculation Banner ── */}
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
          <div>
            <h3 className="text-[14px] font-bold text-white mb-3">📏 Biometrics</h3>
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
            label="🎯 Goal"
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
            label="🏃 Activity Level"
            options={[
              { id: 'sedentary', label: 'Sedentary\n(desk work)' },
              { id: 'light', label: 'Light\n(1–2×/wk)' },
              { id: 'moderate', label: 'Moderate\n(3–5×/wk)' },
              { id: 'very_active', label: 'Very Active\n(Athlete)' },
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
            ]}
            value={formData.dietPreference}
            onChange={v => set('dietPreference', v)}
            cols={3}
            colorActive="bg-rose-500/20 text-rose-300 border-rose-500/40"
          />

          {/* ── Cuisine ── */}
          <PillGrid<CuisinePreference>
            label="🍛 Cuisine Style"
            options={[
              { id: 'indian', label: 'Indian' },
              { id: 'continental', label: 'Continental' },
              { id: 'mixed', label: 'Mixed' },
            ]}
            value={formData.cuisinePreference}
            onChange={v => set('cuisinePreference', v)}
            cols={3}
            colorActive="bg-violet-500/20 text-violet-300 border-violet-500/40"
          />

          {/* ── Allergies ── */}
          <div>
            <label className="text-[13px] font-bold text-slate-300 block mb-2">
              ⚠️ Food Allergies
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

          {/* ── Medical Disclaimer ── */}
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
    </div>
  );
};
