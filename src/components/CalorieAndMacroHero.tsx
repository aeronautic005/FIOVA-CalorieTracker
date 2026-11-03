import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Target, Zap, Shield, Sparkles } from 'lucide-react';
import { DailyTotals, NutritionTargets, UserProfile } from '../types';

interface CalorieAndMacroHeroProps {
  totals: DailyTotals;
  targets: NutritionTargets;
  profile: UserProfile;
  onOpenGoalsModal: () => void;
}

export const CalorieAndMacroHero: React.FC<CalorieAndMacroHeroProps> = ({
  totals,
  targets,
  profile,
  onOpenGoalsModal,
}) => {
  const caloriePercent = Math.min(100, Math.round((totals.calories / Math.max(1, targets.calories)) * 100));
  const isOverCalorieTarget = totals.calories > targets.calories;
  const remainingCalories = targets.calories - totals.calories;

  const proteinPercent = Math.min(100, Math.round((totals.protein / Math.max(1, targets.protein)) * 100));
  const remainingProtein = Math.max(0, targets.protein - totals.protein);

  const carbsPercent = Math.min(100, Math.round((totals.carbs / Math.max(1, targets.carbs)) * 100));
  const remainingCarbs = Math.max(0, targets.carbs - totals.carbs);

  const fatPercent = Math.min(100, Math.round((totals.fat / Math.max(1, targets.fat)) * 100));
  const remainingFat = Math.max(0, targets.fat - totals.fat);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
      {/* 1. Signature Dark Hero Card: Daily Calories */}
      <div className="card-dark p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Total Energy
          </span>
          <button
            onClick={onOpenGoalsModal}
            className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Adjust Target
          </button>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white">
              {totals.calories.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-zinc-400 tabular-nums">
              / {targets.calories.toLocaleString()} kcal
            </span>
          </div>

          {/* Micro Progress Bar inside Dark Card */}
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mt-3 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caloriePercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className={`h-full rounded-full transition-colors ${
                isOverCalorieTarget
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-400'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div
            className={`flex items-center gap-1 font-semibold ${
              isOverCalorieTarget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isOverCalorieTarget ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{(totals.calories - targets.calories).toLocaleString()} kcal over</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{remainingCalories.toLocaleString()} kcal remaining</span>
              </>
            )}
          </div>
          <span className="text-zinc-500 font-mono text-[11px] tabular-nums">
            {caloriePercent}%
          </span>
        </div>
      </div>

      {/* 2. White Card: Protein */}
      <div className="card-white p-6 flex flex-col justify-between min-h-[160px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            Protein
          </span>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums font-medium">
            {proteinPercent}%
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {totals.protein}
            </span>
            <span className="text-sm font-medium text-slate-400 tabular-nums">
              / {targets.protein}g
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${proteinPercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{remainingProtein > 0 ? `${remainingProtein}g left` : 'Goal met!'}</span>
          </div>
          <span className="text-slate-400 text-[11px]">Muscle repair</span>
        </div>
      </div>

      {/* 3. White Card: Carbohydrates */}
      <div className="card-white p-6 flex flex-col justify-between min-h-[160px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Carbohydrates
          </span>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums font-medium">
            {carbsPercent}%
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {totals.carbs}
            </span>
            <span className="text-sm font-medium text-slate-400 tabular-nums">
              / {targets.carbs}g
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${carbsPercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-semibold text-amber-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{remainingCarbs > 0 ? `${remainingCarbs}g left` : 'Target reached'}</span>
          </div>
          <span className="text-slate-400 text-[11px]">Daily energy</span>
        </div>
      </div>

      {/* 4. White Card: Dietary Fat */}
      <div className="card-white p-6 flex flex-col justify-between min-h-[160px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            Dietary Fat
          </span>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums font-medium">
            {fatPercent}%
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {totals.fat}
            </span>
            <span className="text-sm font-medium text-slate-400 tabular-nums">
              / {targets.fat}g
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fatPercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{remainingFat > 0 ? `${remainingFat}g left` : 'Target reached'}</span>
          </div>
          <span className="text-slate-400 text-[11px]">Hormonal health</span>
        </div>
      </div>
    </section>
  );
};
