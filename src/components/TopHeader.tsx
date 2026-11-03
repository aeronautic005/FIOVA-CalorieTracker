import React, { useState } from 'react';
import {
  Search,
  Calendar as CalendarIcon,
  Bell,
  Menu,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PeriodView, UserProfile } from '../types';
import { formatReadableDate } from '../utils/storage';

interface TopHeaderProps {
  title: string;
  periodView: PeriodView;
  onSelectPeriod: (period: PeriodView) => void;
  selectedDate: string;
  onOpenGoalsModal: () => void;
  onOpenMobileMenu: () => void;
  profile: UserProfile;
  onQuickLogSubmit?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  periodView,
  onSelectPeriod,
  selectedDate,
  onOpenGoalsModal,
  onOpenMobileMenu,
  profile,
  onQuickLogSubmit,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const periods: PeriodView[] = ['Day', 'Week', 'Month', 'Year'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim() && onQuickLogSubmit) {
      onQuickLogSubmit(quickSearch.trim());
      setQuickSearch('');
    }
  };

  return (
    <header className="w-full flex flex-col gap-4 mb-6">
      {/* Top Row: Title, AI Search / Quick-Log bar, Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            onClick={onOpenMobileMenu}
            className="p-2.5 rounded-2xl bg-white shadow-xs border border-slate-200/60 lg:hidden text-slate-700 hover:text-slate-900"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
        </div>

        {/* AI Quick-Log Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="hidden md:flex items-center flex-1 max-w-md mx-4 relative"
        >
          <div className="input-soft w-full flex items-center px-4 py-2.5 gap-2.5 text-sm text-slate-600 bg-white">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Ask AI or log: '2 eggs, avocado toast'..."
              className="w-full bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400"
            />
            {quickSearch.trim() ? (
              <button
                type="submit"
                className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 hover:bg-slate-800 cursor-pointer"
              >
                <span>Log</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </div>
        </form>

        {/* Right Actions: Notifications & Avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200/50 flex items-center justify-center text-slate-600 hover:text-slate-900 relative transition-transform active:scale-95 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={onOpenGoalsModal}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-white shadow-xs border border-slate-200/50 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {profile.gender === 'female' ? '👩' : '🧑'}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {profile.goal === 'lose_weight'
                ? 'Fat Loss'
                : profile.goal === 'gain_muscle'
                ? 'Hypertrophy'
                : 'Maintenance'}
            </span>
          </button>
        </div>
      </div>

      {/* Second Row: Period Switcher & Date Range indicator */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        {/* Period Switcher Pills (Day, Week, Month, Year) */}
        <div className="flex items-center bg-white/70 backdrop-blur-xs p-1 rounded-full border border-slate-200/60 shadow-2xs">
          {periods.map((p) => {
            const isActive = periodView === p;
            return (
              <button
                key={p}
                onClick={() => onSelectPeriod(p)}
                className={`pill-tab ${isActive ? 'pill-tab-dark' : ''} cursor-pointer`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Date Range Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-2xs border border-slate-200/60 text-xs font-semibold text-slate-700 tabular-nums">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatReadableDate(selectedDate)}</span>
        </div>
      </div>
    </header>
  );
};
