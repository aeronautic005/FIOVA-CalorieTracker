/**
 * Core TypeScript domain interfaces and persistence models for Fiova AI Calorie Tracker
 */

export type Gender = 'female' | 'male' | 'non-binary';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very_active';

export type NutritionGoal =
  | 'lose_weight'
  | 'maintain'
  | 'gain_muscle';

export type MealCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks';

export type PeriodView = 'Day' | 'Week' | 'Month' | 'Year';

export interface UserProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  explanation?: string;
}

export interface FoodItem {
  id: string;
  mealGroup: MealCategory;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface DailyInsight {
  summary: string;
  suggestedMeal: string;
  reasoning?: string;
  timestamp: number;
}

export interface QuickFoodTemplate {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  count: number;
  lastLogged: number;
}

export interface HydrationEntry {
  id: string;
  amountMl: number;
  timestamp: number;
}

export interface FlowStorageState {
  onboarded: boolean;
  profile: UserProfile;
  targets: NutritionTargets;
  logsByDate: Record<string, FoodItem[]>;
  insightsByDate: Record<string, DailyInsight>;
  quickFoods: QuickFoodTemplate[];
  hydrationByDate?: Record<string, HydrationEntry[]>;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  dayNum: number; // 19, 20, etc.
  calories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  isToday: boolean;
  isSelected: boolean;
}
