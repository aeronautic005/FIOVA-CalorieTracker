import React, { useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight, Utensils, CheckCircle2 } from 'lucide-react';
import { DailyInsight, DailyTotals, FoodItem, NutritionTargets, UserProfile } from '../types';

interface AiInsightsCardProps {
  insight?: DailyInsight;
  totals: DailyTotals;
  targets: NutritionTargets;
  profile: UserProfile;
  meals: FoodItem[];
  selectedDate: string;
  onSaveInsight: (date: string, insight: DailyInsight) => void;
  onStageSuggestedMeal: (mealText: string) => void;
}

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({
  insight,
  totals,
  targets,
  profile,
  meals,
  selectedDate,
  onSaveInsight,
  onStageSuggestedMeal,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/daily-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: profile.goal,
          targets,
          currentTotals: totals,
          meals,
          date: selectedDate,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not fetch AI insight');
      }

      const data: DailyInsight = await res.json();
      onSaveInsight(selectedDate, data);
    } catch {
      // Local algorithmic fallback when offline or without API key
      const remainingCal = targets.calories - totals.calories;
      const remainingP = targets.protein - totals.protein;
      const remainingC = targets.carbs - totals.carbs;
      const remainingF = targets.fat - totals.fat;

      let fallbackSummary = `You have consumed ${totals.calories} of your ${targets.calories} kcal target (${Math.round(
        (totals.calories / Math.max(1, targets.calories)) * 100
      )}%).`;

      if (remainingP > 40) {
        fallbackSummary += ` Protein is currently pacing behind by ${remainingP}g. Prioritize high-protein sources in your upcoming meal.`;
      } else {
        fallbackSummary += ` Great job on macronutrient balance! Pacing is steady across your meals.`;
      }

      let fallbackMeal = 'Grilled Chicken Breast with Jasmine Rice & Steamed Broccoli';
      if (remainingCal < 400) {
        fallbackMeal = 'Greek Yogurt Bowl with Scoop of Protein & Fresh Berries';
      } else if (remainingP > 45) {
        fallbackMeal = 'Pan-seared Salmon Fillet with Quinoa and Roasted Asparagus';
      }

      const fallbackInsight: DailyInsight = {
        summary: fallbackSummary,
        suggestedMeal: fallbackMeal,
        reasoning: `Provides ~${Math.max(25, Math.min(50, remainingP))}g protein and clean micronutrients to fill your remaining ${Math.max(100, remainingCal)} kcal budget.`,
        timestamp: Date.now(),
      };

      onSaveInsight(selectedDate, fallbackInsight);
    } finally {
      setLoading(false);
    }
  };

  const currentInsight = insight || {
    summary:
      'Pacing looks solid today. Tracking your meals consistently ensures accurate metabolic calibration and energy balance.',
    suggestedMeal:
      'Grilled Chicken Breast with Roasted Sweet Potato & Steamed Green Beans',
    reasoning:
      'High-protein and nutrient-dense to support muscle recovery and steady glycemic energy.',
    timestamp: Date.now(),
  };

  return (
    <div className="card-white p-6 sm:p-7 mb-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              AI Nutrition Intelligence
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Gemini 3.8 Flash Contextual Coaching
            </span>
          </div>
        </div>

        <button
          onClick={fetchInsight}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Refresh Coach'}</span>
        </button>
      </div>

      {/* Main Body */}
      {loading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
          <div className="h-4 bg-slate-200/80 rounded-md w-1/2" />
          <div className="h-16 bg-slate-100 rounded-2xl mt-4" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {currentInsight.summary}
          </p>

          {/* Suggested Meal Callout Well */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  Next Meal Recommendation
                </span>
                <span className="text-xs text-slate-400">Tailored to remaining macros</span>
              </div>
              <p className="text-sm font-bold text-slate-900 pt-0.5">
                {currentInsight.suggestedMeal}
              </p>
              {currentInsight.reasoning && (
                <p className="text-xs text-slate-500 italic">
                  {currentInsight.reasoning}
                </p>
              )}
            </div>

            <button
              onClick={() => onStageSuggestedMeal(currentInsight.suggestedMeal)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Stage to Logger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
