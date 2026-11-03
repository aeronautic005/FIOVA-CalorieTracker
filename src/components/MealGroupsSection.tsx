import React, { useState } from 'react';
import {
  Utensils,
  Trash2,
  Edit2,
  Check,
  RotateCw,
  ArrowUpRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from 'lucide-react';
import { FoodItem, MealCategory } from '../types';

interface MealGroupsSectionProps {
  items: FoodItem[];
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: FoodItem) => void;
  selectedDate: string;
}

export const MealGroupsSection: React.FC<MealGroupsSectionProps> = ({
  items,
  onDeleteItem,
  onUpdateItem,
  selectedDate,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<FoodItem>>({});

  const filteredItems = items.filter((item) => {
    if (filterCategory === 'All') return true;
    return item.mealGroup === filterCategory;
  });

  const handleStartEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setEditFormData({ ...item });
  };

  const handleSaveEdit = (originalItem: FoodItem) => {
    if (editingId) {
      onUpdateItem({
        ...originalItem,
        ...editFormData,
        calories: Number(editFormData.calories) || originalItem.calories,
        protein: Number(editFormData.protein) || originalItem.protein,
        carbs: Number(editFormData.carbs) || originalItem.carbs,
        fat: Number(editFormData.fat) || originalItem.fat,
      });
      setEditingId(null);
    }
  };

  const getCategoryIcon = (group: MealCategory) => {
    switch (group) {
      case 'Breakfast':
        return Coffee;
      case 'Lunch':
        return Sun;
      case 'Dinner':
        return Moon;
      case 'Snacks':
      default:
        return Cookie;
    }
  };

  return (
    <div className="card-white p-6 sm:p-7 relative overflow-hidden">
      {/* Table Header matching mockup's Course Purchases */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            Daily Logged Meals
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {items.length} {items.length === 1 ? 'item' : 'items'} logged for {selectedDate}
          </p>
        </div>

        {/* Filter Pills and Table Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Refresh table"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Expand table"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meals Table matching mockup */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
          <Utensils className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No food items logged</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Use the natural language bar above to log your meals.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Food Item</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Macronutrients</th>
                <th className="pb-3 px-4">Calories</th>
                <th className="pb-3 pl-4 text-right">Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredItems.map((item) => {
                const Icon = getCategoryIcon(item.mealGroup);
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Food Item Name & Portion */}
                    <td className="py-4 pr-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editFormData.name ?? item.name}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, name: e.target.value })
                            }
                            className="w-full font-bold text-slate-900 border border-slate-300 rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            value={editFormData.portion ?? item.portion}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, portion: e.target.value })
                            }
                            className="w-full text-slate-500 border border-slate-300 rounded px-2 py-1 text-[11px]"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block tracking-tight">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {item.portion}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-[11px] text-slate-700">
                        {item.mealGroup}
                      </span>
                    </td>

                    {/* Macronutrients */}
                    <td className="py-4 px-4 font-mono text-[11px] tabular-nums whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="P"
                            value={editFormData.protein ?? item.protein}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                protein: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 text-center border border-slate-300 rounded py-0.5"
                          />
                          <input
                            type="number"
                            placeholder="C"
                            value={editFormData.carbs ?? item.carbs}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                carbs: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 text-center border border-slate-300 rounded py-0.5"
                          />
                          <input
                            type="number"
                            placeholder="F"
                            value={editFormData.fat ?? item.fat}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                fat: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 text-center border border-slate-300 rounded py-0.5"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-600">
                          <span className="font-semibold text-indigo-600">{item.protein}g P</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-amber-600">{item.carbs}g C</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-emerald-600">{item.fat}g F</span>
                        </div>
                      )}
                    </td>

                    {/* Calories */}
                    <td className="py-4 px-4 font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.calories ?? item.calories}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              calories: Number(e.target.value) || 0,
                            })
                          }
                          className="w-16 border border-slate-300 rounded px-1.5 py-0.5 font-bold"
                        />
                      ) : (
                        <span>{item.calories} kcal</span>
                      )}
                    </td>

                    {/* Actions / Status Pill (matching mockup's "Paid" pill) */}
                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(item)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#71717A] text-white text-[11px] font-semibold shadow-2xs">
                            Logged
                          </span>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Edit item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
