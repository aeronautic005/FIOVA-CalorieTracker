import React, { useState, useEffect, useMemo } from 'react';
import {
  loadFlowState,
  saveFlowState,
  clearFlowState,
  getTodayKey,
  calculateTotals,
} from './utils/storage';
import { FlowStorageState, PeriodView } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CalorieAndMacroHero } from './components/CalorieAndMacroHero';

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

        {/* Top 4 KPI Cards: Dark Hero Calorie + 3 White Macro Cards */}
        <CalorieAndMacroHero
          totals={currentTotals}
          targets={state.targets}
          profile={state.profile}
          onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
        />
      </div>
    </div>
  );
}
