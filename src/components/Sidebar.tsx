import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  RotateCcw,
  Flame,
  ChevronRight,
  Target,
} from 'lucide-react';
import { UserProfile, NutritionTargets } from '../types';

interface SidebarProps {
  activeNav: string;
  onSelectNav: (nav: string) => void;
  profile: UserProfile;
  targets: NutritionTargets;
  onOpenGoalsModal: () => void;
  onResetData: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  profile,
  targets,
  onOpenGoalsModal,
  onResetData,
  mobileOpen,
  onCloseMobile,
}) => {
  const mainNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Meal Log', label: 'Meal Log', icon: UtensilsCrossed },
    { id: 'AI Coach', label: 'AI Coach', icon: Sparkles },
    { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-r border-slate-200/60 lg:border-none p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-7">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Fiova
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block -mt-1">
                AI Nutrition
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectNav(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Section */}
        <div className="space-y-5 pt-4">
          {/* Pro / Nutrition Targets Card (Mockup Upgrade Card) */}
          <div className="card-dark p-4.5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Target Calibrated
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              Goal: <strong className="text-white capitalize">{profile.goal.replace('_', ' ')}</strong> · {targets.calories} kcal
            </p>
            <button
              onClick={onOpenGoalsModal}
              className="w-full py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-98 text-white text-xs font-semibold backdrop-blur-sm transition-all text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Recalibrate Targets</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
            </button>
          </div>

          {/* Secondary Links */}
          <div className="space-y-1 border-t border-slate-200/60 pt-3">
            <button
              onClick={onOpenGoalsModal}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Profile</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset all saved food logs and restore demo seed data?')) {
                  onResetData();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors text-left cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
