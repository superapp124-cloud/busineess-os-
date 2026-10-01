import React, { useState } from 'react';
import { 
  X, Sparkles, Clock, Flame, Shield, HelpCircle, 
  ArrowRightLeft, CheckCircle2, MessageSquare, AlertCircle
} from 'lucide-react';
import { MealItem, FoodProfile, NutritionEngine } from '@/services/health/food/NutritionEngine';
import { NutritionSIAssistant } from '@/services/health/food/NutritionSIAssistant';
import { cn } from '@/lib/utils';

interface FoodDetailModalProps {
  meal: MealItem | null;
  profile: FoodProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  meal,
  profile,
  isOpen,
  onClose
}) => {
  const [siActiveQuery, setSiActiveQuery] = useState<string | null>(null);
  const [siResponse, setSiResponse] = useState<any>(null);

  if (!isOpen || !meal) return null;

  const whyData = NutritionSIAssistant.explainRecommendation(meal, profile);

  const handleAskSi = (query: string, type: 'sub' | 'ask') => {
    setSiActiveQuery(query);
    if (type === 'sub') {
      const res = NutritionSIAssistant.suggestSubstitution(query, 'preference', profile);
      setSiResponse(res);
    } else {
      const res = NutritionSIAssistant.askQuestion(query, profile);
      setSiResponse(res);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-[28px] bg-[#121622] border border-white/10 text-white p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide my-auto"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {meal.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-white/[0.06] text-slate-300">
                {meal.dietCategory.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize bg-white/[0.04] text-slate-400">
                {meal.cuisine}
              </span>
            </div>
            <h2 className="text-[18px] font-extrabold text-white leading-snug">
              {meal.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nutritional Breakdown Row */}
        <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Calories</span>
            <span className="text-[17px] font-black text-rose-400">{meal.calories}</span>
            <span className="text-[9.5px] text-slate-500 block">kcal</span>
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Protein</span>
            <span className="text-[17px] font-black text-emerald-400">{meal.proteinG}g</span>
            <span className="text-[9.5px] text-slate-500 block">muscle repair</span>
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Carbs</span>
            <span className="text-[17px] font-black text-amber-400">{meal.carbsG}g</span>
            <span className="text-[9.5px] text-slate-500 block">clean energy</span>
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Fiber</span>
            <span className="text-[17px] font-black text-cyan-400">{meal.fiberG}g</span>
            <span className="text-[9.5px] text-slate-500 block">gut motility</span>
          </div>
        </div>

        {/* Ingredients & Prep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] font-bold text-slate-300">
            <span>Ingredients & Portions</span>
            <span className="flex items-center gap-1 text-[11px] font-normal text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {meal.prepTimeMinutes} mins prep
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            {meal.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[12.5px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{ing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Why This Food? (SI Transparency Layer) ─────────── */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-[13px]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Why this recommendation?</span>
          </div>
          <p className="text-[12px] text-slate-300 leading-relaxed">
            {meal.whyRecommended || whyData.keyFactors[0]}
          </p>
          <div className="space-y-1 pt-1">
            {whyData.keyFactors.map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-[11.5px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Smart Swaps & Alternatives ────────────────────── */}
        {meal.alternatives && meal.alternatives.length > 0 && (
          <div className="space-y-2">
            <span className="text-[12px] font-bold text-slate-300 block">
              Smart Health Alternative
            </span>
            {meal.alternatives.map((alt, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[12px] space-y-1"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="line-through text-red-400/80">{alt.insteadOf}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-semibold text-emerald-400">{alt.chooseThis}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 {alt.benefit}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── SI Assistant Interaction (Quick Queries) ──────── */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[12px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Ask Nutrition SI
            </span>
            <span className="text-[10.5px] text-slate-500">Instant answers</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleAskSi(meal.ingredients[0] || 'main ingredient', 'sub')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 active:scale-95 transition-all"
            >
              🔄 Swap primary ingredient
            </button>
            <button
              onClick={() => handleAskSi('Travelling / dining out today', 'ask')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 active:scale-95 transition-all"
            >
              ✈️ Eating out today?
            </button>
            <button
              onClick={() => handleAskSi('How to increase protein here?', 'ask')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 active:scale-95 transition-all"
            >
              💪 Boost protein
            </button>
          </div>

          {siResponse && (
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-1.5 animate-in fade-in text-left">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SI Nutrition Copilot:</span>
              </div>
              <p className="text-[12px] text-slate-200 leading-relaxed">
                {siResponse.answer}
              </p>
              {siResponse.recommendedSwap && (
                <div className="p-2 rounded-lg bg-black/30 border border-emerald-500/20 text-[11px] space-y-0.5">
                  <div className="text-slate-400">Replace: <span className="text-rose-300">{siResponse.recommendedSwap.original}</span></div>
                  <div className="text-slate-300">With: <span className="text-emerald-300 font-semibold">{siResponse.recommendedSwap.substitute}</span></div>
                  <div className="text-emerald-400 text-[10px] mt-0.5">Impact: {siResponse.recommendedSwap.macroDifference}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clinical Disclaimer */}
        <div className="pt-2">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10.5px] text-slate-500 flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p>{NutritionSIAssistant.MEDICAL_DISCLAIMER}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
