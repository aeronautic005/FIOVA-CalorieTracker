import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Check,
  X,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Flame,
} from 'lucide-react';
import { FoodItem, MealCategory, QuickFoodTemplate } from '../types';

interface NaturalLanguageLoggerProps {
  onCommitItems: (items: FoodItem[]) => void;
  quickFoods: QuickFoodTemplate[];
  onLogQuickFood: (template: QuickFoodTemplate, mealGroup: MealCategory) => void;
  externalQuery?: string;
  onClearExternalQuery?: () => void;
}

export const NaturalLanguageLogger: React.FC<NaturalLanguageLoggerProps> = ({
  onCommitItems,
  quickFoods,
  onLogQuickFood,
  externalQuery,
  onClearExternalQuery,
}) => {
  // Auto-select meal category based on current local time of day
  const getDefaultCategory = (): MealCategory => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Snacks';
  };

  const [selectedCategory, setSelectedCategory] = useState<MealCategory>(getDefaultCategory);
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [stagedItems, setStagedItems] = useState<FoodItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Sync external staged queries (e.g. from AI Coach or Top Header search)
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setInputText(externalQuery);
      if (onClearExternalQuery) onClearExternalQuery();
    }
  }, [externalQuery, onClearExternalQuery]);

  const categories: { id: MealCategory; label: string; icon: any }[] = [
    { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'Lunch', label: 'Lunch', icon: Sun },
    { id: 'Dinner', label: 'Dinner', icon: Moon },
    { id: 'Snacks', label: 'Snacks', icon: Cookie },
  ];

  const handleParseMeal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isParsing) return;

    setIsParsing(true);

    try {
      const res = await fetch('/api/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          mealGroup: selectedCategory,
        }),
      });

      if (!res.ok) throw new Error('API parse failed');

      const data = await res.json();
      const parsedItems: FoodItem[] = (data.items || []).map((item: any, idx: number) => ({
        id: `parsed-${Date.now()}-${idx}`,
        mealGroup: selectedCategory,
        name: item.name || 'Food item',
        portion: item.portion || '1 serving',
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        timestamp: Date.now(),
      }));

      setStagedItems(parsedItems);
      setShowConfirmation(true);
      setInputText('');
    } catch {
      // Offline fallback heuristic parser
      const fallbackItem: FoodItem = {
        id: `manual-${Date.now()}`,
        mealGroup: selectedCategory,
        name: inputText.trim(),
        portion: '1 serving',
        calories: 350,
        protein: 20,
        carbs: 40,
        fat: 12,
        timestamp: Date.now(),
      };
      setStagedItems([fallbackItem]);
      setShowConfirmation(true);
      setInputText('');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateStagedItem = (index: number, field: keyof FoodItem, value: any) => {
    setStagedItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteStagedItem = (index: number) => {
    setStagedItems((prev) => prev.filter((_, i) => i !== index));
    if (stagedItems.length <= 1) {
      setShowConfirmation(false);
    }
  };

  const handleAddBlankRow = () => {
    const blank: FoodItem = {
      id: `manual-${Date.now()}`,
      mealGroup: selectedCategory,
      name: '',
      portion: '1 serving',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      timestamp: Date.now(),
    };
    setStagedItems((prev) => [...prev, blank]);
  };

  const handleCommit = () => {
    const validItems = stagedItems.filter((item) => item.name.trim() !== '');
    if (validItems.length > 0) {
      onCommitItems(validItems);
    }
    setStagedItems([]);
    setShowConfirmation(false);
  };

  // Staged meal totals preview
  const stagedTotals = stagedItems.reduce(
    (acc, curr) => ({
      calories: acc.calories + (Number(curr.calories) || 0),
      protein: acc.protein + (Number(curr.protein) || 0),
      carbs: acc.carbs + (Number(curr.carbs) || 0),
      fat: acc.fat + (Number(curr.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="card-white p-6 sm:p-7 mb-6 space-y-5">
      {/* 1. Header with Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            Natural-Language Meal Logger
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Describe meals in plain English or tap quick-add chips
          </p>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Natural Language Input Bar */}
      <form onSubmit={handleParseMeal} className="relative">
        <div className="input-soft flex items-center p-2 pl-4 pr-2 bg-slate-50/70 border border-slate-200/80">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Log to ${selectedCategory}: e.g. '2 boiled eggs, sourdough toast with butter, and black coffee' ...`}
            disabled={isParsing}
            className="w-full bg-transparent border-none outline-hidden text-sm text-slate-900 placeholder:text-slate-400 font-medium"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isParsing}
            className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isParsing ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isParsing ? 'Parsing AI...' : 'Parse Meal'}</span>
          </button>
        </div>
      </form>

      {/* 3. Quick-Add Food Chips */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Frequent & Quick Add
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickFoods.slice(0, 6).map((qf) => (
            <button
              key={qf.id}
              onClick={() => onLogQuickFood(qf, selectedCategory)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              <Plus className="w-3 h-3 text-slate-400" />
              <span>{qf.name}</span>
              <span className="text-slate-400 text-[11px] font-mono tabular-nums">
                {qf.calories} kcal
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Pre-Commit Review & Edit Card */}
      {showConfirmation && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Review Staged {selectedCategory}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold">
                  AI Parsed
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                You can adjust portions, calories, or macros inline before committing to log.
              </p>
            </div>

            <button
              onClick={() => setShowConfirmation(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Staged Items List */}
          <div className="space-y-2.5">
            {stagedItems.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-white border border-slate-200/80 items-center text-xs"
              >
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateStagedItem(idx, 'name', e.target.value)}
                    placeholder="Item name"
                    className="w-full font-bold text-slate-900 bg-transparent border-none outline-hidden"
                  />
                  <input
                    type="text"
                    value={item.portion}
                    onChange={(e) => handleUpdateStagedItem(idx, 'portion', e.target.value)}
                    placeholder="Portion"
                    className="w-full text-slate-500 bg-transparent border-none outline-hidden text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block sm:hidden">Calories</span>
                  <input
                    type="number"
                    value={item.calories}
                    onChange={(e) =>
                      handleUpdateStagedItem(idx, 'calories', Number(e.target.value) || 0)
                    }
                    className="w-full font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 tabular-nums"
                  />
                </div>

                <div className="sm:col-span-5 grid grid-cols-3 gap-1.5 text-center">
                  <div>
                    <span className="text-[10px] text-indigo-600 font-bold block">P (g)</span>
                    <input
                      type="number"
                      value={item.protein}
                      onChange={(e) =>
                        handleUpdateStagedItem(idx, 'protein', Number(e.target.value) || 0)
                      }
                      className="w-full text-center bg-slate-50 px-1 py-1 rounded-lg border border-slate-200/60 tabular-nums"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold block">C (g)</span>
                    <input
                      type="number"
                      value={item.carbs}
                      onChange={(e) =>
                        handleUpdateStagedItem(idx, 'carbs', Number(e.target.value) || 0)
                      }
                      className="w-full text-center bg-slate-50 px-1 py-1 rounded-lg border border-slate-200/60 tabular-nums"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold block">F (g)</span>
                    <input
                      type="number"
                      value={item.fat}
                      onChange={(e) =>
                        handleUpdateStagedItem(idx, 'fat', Number(e.target.value) || 0)
                      }
                      className="w-full text-center bg-slate-50 px-1 py-1 rounded-lg border border-slate-200/60 tabular-nums"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    onClick={() => handleDeleteStagedItem(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row & Live Total */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddBlankRow}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Add Item</span>
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-700 font-medium tabular-nums">
                Total: <strong className="text-slate-900">{stagedTotals.calories} kcal</strong> ({stagedTotals.protein}g P · {stagedTotals.carbs}g C · {stagedTotals.fat}g F)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommit}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
