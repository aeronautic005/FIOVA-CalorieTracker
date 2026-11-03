import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import {
  parseDateKey,
  formatDateKey,
  formatMonthYear,
  getShortDayName,
  getPastNDays,
} from '../utils/storage';
import { DailyTotals, NutritionTargets } from '../types';

interface CalendarCardProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  totals: DailyTotals;
  targets: NutritionTargets;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  selectedDate,
  onSelectDate,
  totals,
  targets,
}) => {
  // Generate a 5-day window centered around or leading to selectedDate
  const daysWindow = useMemo(() => {
    const selectedObj = parseDateKey(selectedDate);
    const days: { dateKey: string; dayName: string; dayNum: number; isSelected: boolean }[] = [];

    for (let offset = -2; offset <= 2; offset++) {
      const d = new Date(selectedObj);
      d.setDate(d.getDate() + offset);
      const key = formatDateKey(d);
      days.push({
        dateKey: key,
        dayName: getShortDayName(key),
        dayNum: d.getDate(),
        isSelected: key === selectedDate,
      });
    }

    return days;
  }, [selectedDate]);

  const handlePrevDay = () => {
    const current = parseDateKey(selectedDate);
    current.setDate(current.getDate() - 1);
    onSelectDate(formatDateKey(current));
  };

  const handleNextDay = () => {
    const current = parseDateKey(selectedDate);
    current.setDate(current.getDate() + 1);
    onSelectDate(formatDateKey(current));
  };

  // Target completion score calculation (0 - 100%)
  const calorieScore = Math.min(100, Math.round((totals.calories / Math.max(1, targets.calories)) * 100));

  // Circular progress ring math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calorieScore / 100) * circumference;

  return (
    <div className="card-white p-6 sm:p-7 flex flex-col justify-between">
      {/* 1. Calendar Header: < Month Year > */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={handlePrevDay}
            className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-slate-900 tracking-tight">
            {formatMonthYear(selectedDate)}
          </span>

          <button
            onClick={handleNextDay}
            className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Days Strip (matching mockup with dark pill for active day) */}
        <div className="grid grid-cols-5 gap-2 text-center pb-6 border-b border-slate-100">
          {daysWindow.map((item) => (
            <button
              key={item.dateKey}
              onClick={() => onSelectDate(item.dateKey)}
              className={`flex flex-col items-center py-2.5 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                item.isSelected
                  ? 'bg-[#71717A] text-white shadow-md shadow-zinc-400/20'
                  : 'hover:bg-slate-100/70 text-slate-600'
              }`}
            >
              <span
                className={`text-[11px] font-semibold mb-1 ${
                  item.isSelected ? 'text-zinc-200' : 'text-slate-400'
                }`}
              >
                {item.dayName}
              </span>
              <span
                className={`text-base font-bold tabular-nums ${
                  item.isSelected ? 'text-white' : 'text-slate-800'
                }`}
              >
                {item.dayNum}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bottom Metric & Circular Progress Ring (matching mockup's "Community growth 65%") */}
      <div className="flex items-center justify-between pt-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Daily Goal Adherence
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+0.9% adherence</span>
            <span className="text-slate-400 font-normal">on pacing</span>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            {/* Background Track */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#F4F4F5"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#18181B"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-slate-900 tabular-nums">
            {calorieScore}%
          </span>
        </div>
      </div>
    </div>
  );
};
