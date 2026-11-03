import React, { useState, useEffect, useMemo } from 'react';
import {
  loadFlowState,
  saveFlowState,
  clearFlowState,
  getTodayKey,
  calculateTotals,
} from './utils/storage';
import { FlowStorageState, PeriodView, DailyInsight } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CalorieAndMacroHero } from './components/CalorieAndMacroHero';
import { WeeklyChartCard } from './components/WeeklyChartCard';
import { CalendarCard } from './components/CalendarCard';
import { AiInsightsCard } from './components/AiInsightsCard';

export default function App() {
  const [state, setState] = useState<FlowStorageState>(() => loadFlowState());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayKey());
  const [periodView, setPeriodView] = useState<PeriodView>('Month');
  const [activeNav, setActiveNav] = useState<string>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [stagedMealQuery, setStagedMealQuery] = useState<string>('');

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

  const handleSaveInsight = (date: string, insight: DailyInsight) => {
    setState((prev) => ({
      ...prev,
      insightsByDate: {
        ...prev.insightsByDate,
        [date]: insight,
      },
    }));
  };

  const handleStageMeal = (mealText: string) => {
    setStagedMealQuery(mealText);
  };

  const handleQuickLog = (query: string) => {
    setStagedMealQuery(query);
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

        {/* Row 1: Top 4 KPI Cards */}
        <CalorieAndMacroHero
          totals={currentTotals}
          targets={state.targets}
          profile={state.profile}
          onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
        />

        {/* Row 2: Middle Split (60% Weekly Bar Chart + 40% Mini Calendar & Adherence Ring) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 mb-6">
          <div className="lg:col-span-7 xl:col-span-8">
            <WeeklyChartCard
              logsByDate={state.logsByDate}
              targetCalories={state.targets.calories}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <CalendarCard
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              totals={currentTotals}
              targets={state.targets}
            />
          </div>
        </div>

        {/* Row 3: AI Daily Insights Coaching Card */}
        <AiInsightsCard
          insight={state.insightsByDate[selectedDate]}
          totals={currentTotals}
          targets={state.targets}
          profile={state.profile}
          meals={currentDayMeals}
          selectedDate={selectedDate}
          onSaveInsight={handleSaveInsight}
          onStageSuggestedMeal={handleStageMeal}
        />
      </div>
    </div>
  );
}
