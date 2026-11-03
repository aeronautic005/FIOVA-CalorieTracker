import React, { useState, useEffect, useMemo } from 'react';
import {
  loadFlowState,
  saveFlowState,
  getTodayKey,
  calculateTotals,
  formatReadableDate,
  formatMonthYear,
} from './utils/storage';
import { FlowStorageState, PeriodView } from './types';

export default function App() {
  const [state, setState] = useState<FlowStorageState>(() => loadFlowState());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayKey());
  const [periodView, setPeriodView] = useState<PeriodView>('Month');
  const [activeNav, setActiveNav] = useState<string>('Dashboard');

  // Persist state changes
  useEffect(() => {
    saveFlowState(state);
  }, [state]);

  const currentDayMeals = useMemo(() => {
    return state.logsByDate[selectedDate] || [];
  }, [state.logsByDate, selectedDate]);

  const currentTotals = useMemo(() => {
    return calculateTotals(currentDayMeals);
  }, [currentDayMeals]);

  return (
    <div className="min-h-screen bg-[#EAE8ED] flex flex-col antialiased">
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              {formatReadableDate(selectedDate)} · {formatMonthYear(selectedDate)}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
          {/* Hero Calorie Card */}
          <div className="card-dark p-6 flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Total Calorie Target
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold tracking-tight tabular-nums">
                {state.targets.calories.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 ml-1.5 font-medium">kcal/day</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span>●</span>
              <span>{state.profile.goal.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          {/* Quick macro cards */}
          <div className="card-white p-6 flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Protein
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {currentTotals.protein}g
              </span>
              <span className="text-xs text-slate-400 ml-1.5">/ {state.targets.protein}g</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Daily Muscle Support</span>
          </div>

          <div className="card-white p-6 flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Carbohydrates
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {currentTotals.carbs}g
              </span>
              <span className="text-xs text-slate-400 ml-1.5">/ {state.targets.carbs}g</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Energy & Glycogen</span>
          </div>

          <div className="card-white p-6 flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dietary Fat
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {currentTotals.fat}g
              </span>
              <span className="text-xs text-slate-400 ml-1.5">/ {state.targets.fat}g</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Hormonal Health</span>
          </div>
        </div>
      </main>
    </div>
  );
}
