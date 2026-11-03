import React, { useState, useEffect, useMemo } from 'react';
import {
  loadFlowState,
  saveFlowState,
  clearFlowState,
  getTodayKey,
  calculateTotals,
  calculateLocalFallbackTargets,
} from './utils/storage';
import { FlowStorageState, PeriodView } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';

export default function App() {
  const [state, setState] = useState<FlowStorageState>(() => loadFlowState());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayKey());
  const [periodView, setPeriodView] = useState<PeriodView>('Month');
  const [activeNav, setActiveNav] = useState<string>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);

  // Persist state changes to localStorage
  useEffect(() => {
    saveFlowState(state);
  }, [state]);

  const currentDayMeals = useMemo(() => {
    return state.logsByDate[selectedDate] || [];
  }, [state.logsByDate, selectedDate]);

  const currentTotals = useMemo(() => {
    return calculateTotals(currentDayMeals);
  }, [currentDayMeals]);

  const handleResetData = () => {
    clearFlowState();
    const fresh = loadFlowState();
    setState(fresh);
    setSelectedDate(getTodayKey());
  };

  const handleQuickLog = (query: string) => {
    console.log('Quick log submitted:', query);
    // In Step 9 this will trigger the natural language meal logger
  };

  return (
    <div className="min-h-screen bg-[#EAE8ED] flex text-slate-900 antialiased font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        profile={state.profile}
        targets={state.targets}
        onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
        onResetData={handleResetData}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
        {/* Top Header */}
        <TopHeader
          title={activeNav}
          periodView={periodView}
          onSelectPeriod={setPeriodView}
          selectedDate={selectedDate}
          onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          profile={state.profile}
          onQuickLogSubmit={handleQuickLog}
        />

        {/* Placeholder slot for Step 6: Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
          <div className="card-dark p-6 flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Calories
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold tracking-tight tabular-nums text-white">
                {currentTotals.calories.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 ml-1.5 font-medium">
                / {state.targets.calories.toLocaleString()} kcal
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span>↑ 4.2%</span>
              <span className="text-zinc-400 font-normal">from daily average</span>
            </div>
          </div>

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
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span>↑ 1.7%</span>
              <span className="text-slate-400 font-normal">muscle repair goal</span>
            </div>
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
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
              <span>↓ 2.9%</span>
              <span className="text-slate-400 font-normal">glycogen replenishment</span>
            </div>
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
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span>↑ 0.9%</span>
              <span className="text-slate-400 font-normal">essential lipids</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
