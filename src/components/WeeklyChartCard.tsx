import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, TrendingUp, Info } from 'lucide-react';
import { FoodItem } from '../types';
import {
  getPastNDays,
  getShortDayName,
  calculateTotals,
  parseDateKey,
} from '../utils/storage';

interface WeeklyChartCardProps {
  logsByDate: Record<string, FoodItem[]>;
  targetCalories: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const WeeklyChartCard: React.FC<WeeklyChartCardProps> = ({
  logsByDate,
  targetCalories,
  selectedDate,
  onSelectDate,
}) => {
  // Compute rolling 7-day window ending on selectedDate (or current week)
  const past7Days = useMemo(() => {
    return getPastNDays(selectedDate, 7);
  }, [selectedDate]);

  const chartData = useMemo(() => {
    return past7Days.map((dKey) => {
      const items = logsByDate[dKey] || [];
      const totals = calculateTotals(items);
      const isSelected = dKey === selectedDate;
      const dayName = getShortDayName(dKey);
      const dayNum = parseDateKey(dKey).getDate();

      return {
        dateKey: dKey,
        dayName,
        dayNum,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        isSelected,
        isOver: totals.calories > targetCalories,
      };
    });
  }, [past7Days, logsByDate, selectedDate, targetCalories]);

  // Find max value to calibrate bar heights
  const maxCalories = useMemo(() => {
    const highestLogged = Math.max(...chartData.map((d) => d.calories), 0);
    return Math.max(targetCalories * 1.2, highestLogged, 2400);
  }, [chartData, targetCalories]);

  // Average intake calculation
  const averageCalories = useMemo(() => {
    const total = chartData.reduce((acc, curr) => acc + curr.calories, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  // Target line Y-percentage (from bottom)
  const targetLinePercent = Math.min(100, Math.round((targetCalories / maxCalories) * 100));

  return (
    <div className="card-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
      {/* Header matching mockup */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            Calorie Intake Trends
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 font-medium">
              7-Day Average: <strong className="text-slate-800 tabular-nums">{averageCalories.toLocaleString()} kcal</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Target {targetCalories.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="View detailed analytics"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bar Chart Area */}
      <div className="relative pt-6 pb-2">
        {/* Dashed Target Reference Line */}
        <div
          className="absolute left-10 right-0 border-b border-dashed border-slate-300 z-10 pointer-events-none flex items-center justify-end"
          style={{ bottom: `calc(${targetLinePercent}% + 32px)` }}
        >
          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-white/90 px-1 -translate-y-1/2 rounded-sm tabular-nums">
            Target {targetCalories}
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-52">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between h-full pb-8 text-[11px] font-mono text-slate-400 tabular-nums select-none shrink-0 w-8">
            <span>{Math.round(maxCalories / 1000)}k</span>
            <span>{Math.round((maxCalories * 0.66) / 1000)}k</span>
            <span>{Math.round((maxCalories * 0.33) / 1000)}k</span>
            <span>0</span>
          </div>

          {/* Vertical Pill Bars (matching mockup) */}
          <div className="flex-1 flex items-end justify-between gap-1.5 sm:gap-3 h-full pb-8">
            {chartData.map((day) => {
              const heightPercent = Math.min(100, Math.max(8, Math.round((day.calories / maxCalories) * 100)));

              return (
                <div
                  key={day.dateKey}
                  onClick={() => onSelectDate(day.dateKey)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-lg whitespace-nowrap z-30 shadow-lg tabular-nums">
                    {day.calories.toLocaleString()} kcal
                  </div>

                  {/* The Rounded Pill Bar */}
                  <div className="w-full max-w-[38px] sm:max-w-[48px] h-full flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                      className={`w-full rounded-2xl transition-all duration-200 ${
                        day.isSelected
                          ? 'bg-[#71717A] shadow-md ring-2 ring-slate-900/10'
                          : day.isOver
                          ? 'bg-rose-500/80 hover:bg-rose-500'
                          : 'bg-[#18181B] hover:bg-[#27272A]'
                      }`}
                    />
                  </div>

                  {/* Day Label below bar */}
                  <div className="absolute -bottom-1 flex flex-col items-center">
                    <span
                      className={`text-xs font-semibold tracking-tight transition-colors ${
                        day.isSelected ? 'text-slate-900 font-bold' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
