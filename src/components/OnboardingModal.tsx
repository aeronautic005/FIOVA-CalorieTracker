import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calculator,
  RefreshCw,
  Check,
  Target,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import {
  UserProfile,
  NutritionTargets,
  Gender,
  ActivityLevel,
  NutritionGoal,
} from '../types';
import { calculateLocalFallbackTargets } from '../utils/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  currentTargets: NutritionTargets;
  onSave: (profile: UserProfile, targets: NutritionTargets) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  currentTargets,
  onSave,
}) => {
  if (!isOpen) return null;

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [profile, setProfile] = useState<UserProfile>(currentProfile);
  const [targets, setTargets] = useState<NutritionTargets>(currentTargets);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Height conversion helpers
  const heightFeet = Math.floor(profile.heightCm / 30.48);
  const heightInches = Math.round((profile.heightCm % 30.48) / 2.54);

  // Weight conversion helper
  const weightLbs = Math.round(profile.weightKg * 2.20462);

  const handleCalculateAiTargets = async () => {
    setIsCalculating(true);

    try {
      const res = await fetch('/api/calculate-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error('AI calculation failed');

      const data: NutritionTargets = await res.json();
      setTargets(data);
    } catch {
      // Local offline fallback using Mifflin-St Jeor formula
      const fallback = calculateLocalFallbackTargets(profile);
      setTargets(fallback);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSyncCaloriesToMacros = () => {
    const computedCals = targets.protein * 4 + targets.carbs * 4 + targets.fat * 9;
    setTargets((prev) => ({ ...prev, calories: computedCals }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile, targets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="card-white w-full max-w-2xl p-6 sm:p-8 my-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Nutrition Profile & Goals
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Mifflin-St Jeor & Gemini 3.8 Flash Calibrated
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Biometrics
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  unitSystem === 'metric'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Metric (cm / kg)
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  unitSystem === 'imperial'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Imperial (ft / lbs)
              </button>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Age & Gender */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Age</label>
              <input
                type="number"
                min="14"
                max="100"
                value={profile.age}
                onChange={(e) =>
                  setProfile({ ...profile, age: Number(e.target.value) || 25 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Biological Gender</label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value as Gender })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary / Neutral</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Height</label>
              {unitSystem === 'metric' ? (
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={profile.heightCm}
                    onChange={(e) =>
                      setProfile({ ...profile, heightCm: Number(e.target.value) || 170 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all tabular-nums pr-10"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-semibold">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={heightFeet}
                      onChange={(e) => {
                        const ft = Number(e.target.value) || 5;
                        const totalCm = Math.round(ft * 30.48 + heightInches * 2.54);
                        setProfile({ ...profile, heightCm: totalCm });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 tabular-nums pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 font-semibold">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={(e) => {
                        const inc = Number(e.target.value) || 0;
                        const totalCm = Math.round(heightFeet * 30.48 + inc * 2.54);
                        setProfile({ ...profile, heightCm: totalCm });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 tabular-nums pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 font-semibold">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Weight</label>
              {unitSystem === 'metric' ? (
                <div className="relative">
                  <input
                    type="number"
                    min="35"
                    max="250"
                    value={profile.weightKg}
                    onChange={(e) =>
                      setProfile({ ...profile, weightKg: Number(e.target.value) || 70 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all tabular-nums pr-10"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-semibold">
                    kg
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    min="75"
                    max="500"
                    value={weightLbs}
                    onChange={(e) => {
                      const lbs = Number(e.target.value) || 150;
                      setProfile({ ...profile, weightKg: Math.round(lbs / 2.20462) });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all tabular-nums pr-10"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-semibold">
                    lbs
                  </span>
                </div>
              )}
            </div>

            {/* Activity Level */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Physical Activity Level
              </label>
              <select
                value={profile.activityLevel}
                onChange={(e) =>
                  setProfile({ ...profile, activityLevel: e.target.value as ActivityLevel })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
              >
                <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="light">Light (1-3 workout days/week)</option>
                <option value="moderate">Moderate (3-5 workout days/week)</option>
                <option value="very_active">Very Active (6-7 intense days/week)</option>
              </select>
            </div>

            {/* Nutrition Goal */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Primary Goal
              </label>
              <select
                value={profile.goal}
                onChange={(e) =>
                  setProfile({ ...profile, goal: e.target.value as NutritionGoal })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-hidden focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
              >
                <option value="lose_weight">Fat Loss (-450 kcal deficit)</option>
                <option value="maintain">Weight Maintenance (TDEE balance)</option>
                <option value="gain_muscle">Muscle Hypertrophy (+350 kcal surplus)</option>
              </select>
            </div>
          </div>

          {/* AI Calculation Trigger */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Calculate with Gemini 3.8 Flash
              </span>
              <span className="text-[11px] text-slate-500">
                Calibrates optimal macros for your biometrics & activity level.
              </span>
            </div>

            <button
              type="button"
              onClick={handleCalculateAiTargets}
              disabled={isCalculating}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Computing...' : 'Recalculate AI'}</span>
            </button>
          </div>

          {/* Targets Review Card */}
          <div className="card-white p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Daily Output
              </span>
              <button
                type="button"
                onClick={() => setIsManualEdit(!isManualEdit)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>{isManualEdit ? 'Done Editing' : 'Fine-tune Values'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Calories */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Calories
                </span>
                {isManualEdit ? (
                  <input
                    type="number"
                    value={targets.calories}
                    onChange={(e) =>
                      setTargets({ ...targets, calories: Number(e.target.value) || 0 })
                    }
                    className="w-full text-center font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg py-1 tabular-nums"
                  />
                ) : (
                  <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                    {targets.calories}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 block">kcal/day</span>
              </div>

              {/* Protein */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[10px] font-bold uppercase text-indigo-600 block mb-1">
                  Protein
                </span>
                {isManualEdit ? (
                  <input
                    type="number"
                    value={targets.protein}
                    onChange={(e) =>
                      setTargets({ ...targets, protein: Number(e.target.value) || 0 })
                    }
                    className="w-full text-center font-extrabold text-indigo-900 bg-white border border-indigo-200 rounded-lg py-1 tabular-nums"
                  />
                ) : (
                  <span className="text-xl font-extrabold text-indigo-950 tabular-nums">
                    {targets.protein}g
                  </span>
                )}
                <span className="text-[10px] text-indigo-400 block">muscle repair</span>
              </div>

              {/* Carbs */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold uppercase text-amber-600 block mb-1">
                  Carbs
                </span>
                {isManualEdit ? (
                  <input
                    type="number"
                    value={targets.carbs}
                    onChange={(e) =>
                      setTargets({ ...targets, carbs: Number(e.target.value) || 0 })
                    }
                    className="w-full text-center font-extrabold text-amber-900 bg-white border border-amber-200 rounded-lg py-1 tabular-nums"
                  />
                ) : (
                  <span className="text-xl font-extrabold text-amber-950 tabular-nums">
                    {targets.carbs}g
                  </span>
                )}
                <span className="text-[10px] text-amber-400 block">energy source</span>
              </div>

              {/* Fat */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                  Fats
                </span>
                {isManualEdit ? (
                  <input
                    type="number"
                    value={targets.fat}
                    onChange={(e) =>
                      setTargets({ ...targets, fat: Number(e.target.value) || 0 })
                    }
                    className="w-full text-center font-extrabold text-emerald-900 bg-white border border-emerald-200 rounded-lg py-1 tabular-nums"
                  />
                ) : (
                  <span className="text-xl font-extrabold text-emerald-950 tabular-nums">
                    {targets.fat}g
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 block">hormone balance</span>
              </div>
            </div>

            {isManualEdit && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSyncCaloriesToMacros}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Sync Calories to (4·P + 4·C + 9·F)
                </button>
              </div>
            )}

            {targets.explanation && (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                {targets.explanation}
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
