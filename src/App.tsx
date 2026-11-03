import React, { useState, useEffect, useMemo } from 'react';
import {
  loadFlowState,
  saveFlowState,
  clearFlowState,
  getTodayKey,
  calculateTotals,
  getPastNDays,
  getShortDayName,
  formatReadableDate,
} from './utils/storage';
import {
  FlowStorageState,
  PeriodView,
  DailyInsight,
  FoodItem,
  QuickFoodTemplate,
  MealCategory,
  UserProfile,
  NutritionTargets,
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CalorieAndMacroHero } from './components/CalorieAndMacroHero';
import { WeeklyChartCard } from './components/WeeklyChartCard';
import { CalendarCard } from './components/CalendarCard';
import { AiInsightsCard } from './components/AiInsightsCard';
import { NaturalLanguageLogger } from './components/NaturalLanguageLogger';
import { MealGroupsSection } from './components/MealGroupsSection';
import { OnboardingModal } from './components/OnboardingModal';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  UtensilsCrossed,
  Shield,
  Target,
  Zap,
  Send,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<FlowStorageState>(() => loadFlowState());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayKey());
  const [periodView, setPeriodView] = useState<PeriodView>('Month');
  const [activeNav, setActiveNav] = useState<string>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [stagedMealQuery, setStagedMealQuery] = useState<string>('');

  // AI Coach Chat State
  const [coachQuestion, setCoachQuestion] = useState<string>('');
  const [coachResponse, setCoachResponse] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState<boolean>(false);

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

  // 7-day Analytics Data
  const past7DaysData = useMemo(() => {
    const days = getPastNDays(selectedDate, 7);
    return days.map((dKey) => {
      const meals = state.logsByDate[dKey] || [];
      const totals = calculateTotals(meals);
      return {
        dateKey: dKey,
        dayName: getShortDayName(dKey),
        readable: formatReadableDate(dKey),
        ...totals,
        diff: totals.calories - state.targets.calories,
      };
    });
  }, [selectedDate, state.logsByDate, state.targets.calories]);

  const weeklyAverage = useMemo(() => {
    const totalCal = past7DaysData.reduce((acc, d) => acc + d.calories, 0);
    const totalP = past7DaysData.reduce((acc, d) => acc + d.protein, 0);
    const totalC = past7DaysData.reduce((acc, d) => acc + d.carbs, 0);
    const totalF = past7DaysData.reduce((acc, d) => acc + d.fat, 0);
    const len = Math.max(1, past7DaysData.length);

    return {
      calories: Math.round(totalCal / len),
      protein: Math.round(totalP / len),
      carbs: Math.round(totalC / len),
      fat: Math.round(totalF / len),
    };
  }, [past7DaysData]);

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
    setActiveNav('Meal Log');
  };

  const handleCommitItems = (newItems: FoodItem[]) => {
    setState((prev) => {
      const existing = prev.logsByDate[selectedDate] || [];
      return {
        ...prev,
        logsByDate: {
          ...prev.logsByDate,
          [selectedDate]: [...existing, ...newItems],
        },
      };
    });
  };

  const handleLogQuickFood = (template: QuickFoodTemplate, mealGroup: MealCategory) => {
    const newItem: FoodItem = {
      id: `qf-log-${Date.now()}`,
      mealGroup,
      name: template.name,
      portion: template.portion,
      calories: template.calories,
      protein: template.protein,
      carbs: template.carbs,
      fat: template.fat,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const existingMeals = prev.logsByDate[selectedDate] || [];
      const updatedQuickFoods = prev.quickFoods.map((q) =>
        q.id === template.id ? { ...q, count: q.count + 1, lastLogged: Date.now() } : q
      );

      return {
        ...prev,
        logsByDate: {
          ...prev.logsByDate,
          [selectedDate]: [...existingMeals, newItem],
        },
        quickFoods: updatedQuickFoods,
      };
    });
  };

  const handleDeleteItem = (id: string) => {
    setState((prev) => {
      const existing = prev.logsByDate[selectedDate] || [];
      return {
        ...prev,
        logsByDate: {
          ...prev.logsByDate,
          [selectedDate]: existing.filter((item) => item.id !== id),
        },
      };
    });
  };

  const handleUpdateItem = (updated: FoodItem) => {
    setState((prev) => {
      const existing = prev.logsByDate[selectedDate] || [];
      return {
        ...prev,
        logsByDate: {
          ...prev.logsByDate,
          [selectedDate]: existing.map((item) => (item.id === updated.id ? updated : item)),
        },
      };
    });
  };

  const handleSaveProfileAndTargets = (newProfile: UserProfile, newTargets: NutritionTargets) => {
    setState((prev) => ({
      ...prev,
      onboarded: true,
      profile: newProfile,
      targets: newTargets,
    }));
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuestion.trim() || coachLoading) return;

    setCoachLoading(true);
    setCoachResponse(null);

    try {
      const res = await fetch('/api/daily-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: state.profile.goal,
          targets: state.targets,
          currentTotals,
          meals: currentDayMeals,
          date: selectedDate,
          userQuestion: coachQuestion.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to query AI Coach');

      const data = await res.json();
      setCoachResponse(
        `${data.summary} Based on your inquiry, here is my suggestion: ${data.suggestedMeal}. ${data.reasoning || ''}`
      );
    } catch {
      // Local smart response
      const remainingCal = state.targets.calories - currentTotals.calories;
      const remainingP = state.targets.protein - currentTotals.protein;
      setCoachResponse(
        `For your inquiry "${coachQuestion}", I recommend focusing on lean protein and nutrient-dense carbohydrates. You have ${remainingCal} kcal and ${remainingP}g protein left today. A meal like grilled chicken with quinoa and asparagus fits your ${state.profile.goal.replace(
          '_',
          ' '
        )} goal perfectly!`
      );
    } finally {
      setCoachLoading(false);
      setCoachQuestion('');
    }
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
          onQuickLogSubmit={handleStageMeal}
        />

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD (Full unified overview matching mockup)      */}
        {/* ------------------------------------------------------------- */}
        {activeNav === 'Dashboard' && (
          <div className="space-y-6">
            {/* Row 1: Top 4 KPI Cards */}
            <CalorieAndMacroHero
              totals={currentTotals}
              targets={state.targets}
              profile={state.profile}
              onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
            />

            {/* Row 2: Middle Split (60% Weekly Bar Chart + 40% Mini Calendar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
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

            {/* Row 3: AI Daily Insights Card */}
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

            {/* Row 4: AI Natural-Language Meal Logger */}
            <NaturalLanguageLogger
              onCommitItems={handleCommitItems}
              quickFoods={state.quickFoods}
              onLogQuickFood={handleLogQuickFood}
              externalQuery={stagedMealQuery}
              onClearExternalQuery={() => setStagedMealQuery('')}
            />

            {/* Row 5: Grouped Daily Meals Table */}
            <MealGroupsSection
              items={currentDayMeals}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: MEAL LOG (Focused Food Intake & Logging View)          */}
        {/* ------------------------------------------------------------- */}
        {activeNav === 'Meal Log' && (
          <div className="space-y-6">
            {/* Quick Macro Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card-white p-4.5 text-center">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Today's Calories
                </span>
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {currentTotals.calories}
                </span>
                <span className="text-xs text-slate-400 block">/ {state.targets.calories} kcal</span>
              </div>
              <div className="card-white p-4.5 text-center">
                <span className="text-[11px] font-bold uppercase text-indigo-600 block mb-1">
                  Protein
                </span>
                <span className="text-2xl font-extrabold text-indigo-950 tabular-nums">
                  {currentTotals.protein}g
                </span>
                <span className="text-xs text-indigo-400 block">/ {state.targets.protein}g</span>
              </div>
              <div className="card-white p-4.5 text-center">
                <span className="text-[11px] font-bold uppercase text-amber-600 block mb-1">
                  Carbohydrates
                </span>
                <span className="text-2xl font-extrabold text-amber-950 tabular-nums">
                  {currentTotals.carbs}g
                </span>
                <span className="text-xs text-amber-400 block">/ {state.targets.carbs}g</span>
              </div>
              <div className="card-white p-4.5 text-center">
                <span className="text-[11px] font-bold uppercase text-emerald-600 block mb-1">
                  Dietary Fat
                </span>
                <span className="text-2xl font-extrabold text-emerald-950 tabular-nums">
                  {currentTotals.fat}g
                </span>
                <span className="text-xs text-emerald-400 block">/ {state.targets.fat}g</span>
              </div>
            </div>

            {/* Prominent Natural Language Logger */}
            <NaturalLanguageLogger
              onCommitItems={handleCommitItems}
              quickFoods={state.quickFoods}
              onLogQuickFood={handleLogQuickFood}
              externalQuery={stagedMealQuery}
              onClearExternalQuery={() => setStagedMealQuery('')}
            />

            {/* Detailed Meal Table */}
            <MealGroupsSection
              items={currentDayMeals}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: AI COACH (Personalized Nutrition Intelligence & Advice)*/}
        {/* ------------------------------------------------------------- */}
        {activeNav === 'AI Coach' && (
          <div className="space-y-6">
            {/* Primary Coaching Card */}
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

            {/* Interactive Ask AI Coach Consultation Card */}
            <div className="card-white p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Consult Your Nutrition Coach
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ask Gemini 3.8 Flash about recipes, macro balancing, or meal timing
                  </p>
                </div>
              </div>

              <form onSubmit={handleAskCoach} className="relative">
                <div className="input-soft flex items-center p-2 pl-4 pr-2 bg-slate-50/70 border border-slate-200/80">
                  <input
                    type="text"
                    value={coachQuestion}
                    onChange={(e) => setCoachQuestion(e.target.value)}
                    placeholder="e.g. 'What can I eat for dinner with 45g protein and under 500 kcal?'"
                    disabled={coachLoading}
                    className="w-full bg-transparent border-none outline-hidden text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!coachQuestion.trim() || coachLoading}
                    className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{coachLoading ? 'Consulting...' : 'Ask Coach'}</span>
                  </button>
                </div>
              </form>

              {coachResponse && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                      Coach Response
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    {coachResponse}
                  </p>
                </div>
              )}

              {/* Sample Prompts */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Sample Inquiries
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'How can I hit my protein goal today?',
                    'High protein breakfast ideas without eggs',
                    'Best post-workout recovery snack',
                    'How much water should I drink?',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setCoachQuestion(prompt)}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: ANALYTICS (7-Day Trends & Macro Split Statistics)      */}
        {/* ------------------------------------------------------------- */}
        {activeNav === 'Analytics' && (
          <div className="space-y-6">
            {/* Weekly Bar Chart */}
            <WeeklyChartCard
              logsByDate={state.logsByDate}
              targetCalories={state.targets.calories}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* 7-Day Performance Averages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-white p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Weekly Avg Calories
                </span>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {weeklyAverage.calories.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">kcal/day</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">
                  Target: {state.targets.calories} kcal
                </span>
              </div>

              <div className="card-white p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Avg Protein
                </span>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-indigo-950 tabular-nums">
                    {weeklyAverage.protein}g
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">/ day</span>
                </div>
                <span className="text-xs text-indigo-600 font-semibold">
                  Goal: {state.targets.protein}g
                </span>
              </div>

              <div className="card-white p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Avg Carbs
                </span>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-amber-950 tabular-nums">
                    {weeklyAverage.carbs}g
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">/ day</span>
                </div>
                <span className="text-xs text-amber-600 font-semibold">
                  Goal: {state.targets.carbs}g
                </span>
              </div>

              <div className="card-white p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Avg Fat
                </span>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-emerald-950 tabular-nums">
                    {weeklyAverage.fat}g
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">/ day</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">
                  Goal: {state.targets.fat}g
                </span>
              </div>
            </div>

            {/* 7-Day History Table */}
            <div className="card-white p-6 sm:p-7">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                7-Day Historical Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 px-4">Calories</th>
                      <th className="pb-3 px-4">Protein</th>
                      <th className="pb-3 px-4">Carbs</th>
                      <th className="pb-3 px-4">Fat</th>
                      <th className="pb-3 pl-4 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {past7DaysData.map((d) => (
                      <tr
                        key={d.dateKey}
                        onClick={() => setSelectedDate(d.dateKey)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          d.dateKey === selectedDate ? 'bg-slate-50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 pr-4">
                          <span className="font-bold text-slate-900 block">{d.dayName}</span>
                          <span className="text-[11px] text-slate-400">{d.readable}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold tabular-nums text-slate-900">
                          {d.calories.toLocaleString()} kcal
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-indigo-700">
                          {d.protein}g
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-amber-700">
                          {d.carbs}g
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-emerald-700">
                          {d.fat}g
                        </td>
                        <td className="py-3.5 pl-4 text-right tabular-nums">
                          {d.diff > 0 ? (
                            <span className="text-rose-500 font-bold">+{d.diff} kcal</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">{d.diff} kcal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding & Goals Adjustment Modal */}
      <OnboardingModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        currentProfile={state.profile}
        currentTargets={state.targets}
        onSave={handleSaveProfileAndTargets}
      />
    </div>
  );
}
