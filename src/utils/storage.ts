import {
  FlowStorageState,
  UserProfile,
  NutritionTargets,
  QuickFoodTemplate,
  FoodItem,
  DailyTotals,
} from '../types';

export const PRIMARY_STORAGE_KEY = 'fiova_nutrition_state_v1';
export const LEGACY_STORAGE_KEY = 'flow_liquid_glass_state_v1';

export const DEFAULT_PROFILE: UserProfile = {
  age: 26,
  gender: 'male',
  heightCm: 178,
  weightKg: 74,
  activityLevel: 'moderate',
  goal: 'maintain',
};

export const DEFAULT_QUICK_FOODS: QuickFoodTemplate[] = [
  {
    id: 'qf-1',
    name: 'Whey Protein Shake',
    portion: '1 scoop (35g) + water',
    calories: 140,
    protein: 26,
    carbs: 3,
    fat: 2,
    count: 24,
    lastLogged: Date.now() - 3600000 * 2,
  },
  {
    id: 'qf-2',
    name: 'Grilled Chicken Breast & Rice',
    portion: '1 bowl (300g)',
    calories: 460,
    protein: 42,
    carbs: 48,
    fat: 7,
    count: 19,
    lastLogged: Date.now() - 3600000 * 24,
  },
  {
    id: 'qf-3',
    name: '2 Boiled Eggs & Sourdough Toast',
    portion: '2 eggs + 1 slice with butter',
    calories: 310,
    protein: 16,
    carbs: 24,
    fat: 16,
    count: 17,
    lastLogged: Date.now() - 3600000 * 5,
  },
  {
    id: 'qf-4',
    name: 'Greek Yogurt with Blueberries',
    portion: '200g bowl with honey',
    calories: 220,
    protein: 18,
    carbs: 28,
    fat: 3,
    count: 14,
    lastLogged: Date.now() - 3600000 * 18,
  },
  {
    id: 'qf-5',
    name: 'Avocado Toast with Poached Egg',
    portion: '1 slice artisan bread + half avocado',
    calories: 340,
    protein: 12,
    carbs: 26,
    fat: 21,
    count: 11,
    lastLogged: Date.now() - 3600000 * 48,
  },
  {
    id: 'qf-6',
    name: 'Crisp Apple with Almond Butter',
    portion: '1 medium apple + 1 tbsp',
    calories: 190,
    protein: 4,
    carbs: 25,
    fat: 9,
    count: 8,
    lastLogged: Date.now() - 3600000 * 72,
  },
];

/**
 * Fallback Target Calculator implementing the scientific Mifflin-St Jeor formula
 * and TDEE activity multipliers. Works completely offline.
 */
export function calculateLocalFallbackTargets(profile: UserProfile): NutritionTargets {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = profile;

  // Mifflin-St Jeor BMR equation
  let bmr: number;
  if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    // Non-binary average
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  }

  // TDEE multipliers
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };

  const tdee = bmr * (multipliers[activityLevel] || 1.4);

  // Goal caloric adjustments
  let targetCalories: number;
  let explanation = '';

  switch (goal) {
    case 'lose_weight':
      targetCalories = Math.max(1300, Math.round(tdee - 450));
      explanation = `Calculated with a gentle 450 kcal deficit from your estimated TDEE of ${Math.round(
        tdee
      )} kcal for steady, sustainable fat loss.`;
      break;
    case 'gain_muscle':
      targetCalories = Math.round(tdee + 350);
      explanation = `Set at a 350 kcal lean surplus above your estimated maintenance of ${Math.round(
        tdee
      )} kcal to support muscle hypertrophy with minimal fat gain.`;
      break;
    case 'maintain':
    default:
      targetCalories = Math.round(tdee);
      explanation = `Calibrated to match your estimated daily energy expenditure of ${Math.round(
        tdee
      )} kcal for steady weight maintenance.`;
      break;
  }

  // Protein: ~2.0g per kg bodyweight (standard sports nutrition target)
  const proteinGrams = Math.round(weightKg * 2.0);
  // Fat: ~25% of total caloric intake (9 kcal per gram)
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  // Carbs: Remaining calories (4 kcal per gram)
  const remainingCalories = targetCalories - (proteinGrams * 4 + fatGrams * 9);
  const carbsGrams = Math.max(50, Math.round(remainingCalories / 4));

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    explanation,
  };
}

/**
 * Format Date to standard YYYY-MM-DD
 */
export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Computes an array of N consecutive date strings ending on `endDateKey`
 */
export function getPastNDays(endDateKey: string, n: number = 7): string[] {
  const endDate = parseDateKey(endDateKey);
  const result: string[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    result.push(formatDateKey(d));
  }

  return result;
}

/**
 * Short day name: "Mon", "Tue", "Wed", etc.
 */
export function getShortDayName(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Format header date like "19 Sep 2024"
 */
export function formatReadableDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format month header like "September 2024"
 */
export function formatMonthYear(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculate totals for a list of food items
 */
export function calculateTotals(items: FoodItem[] = []): DailyTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Generates initial seed demo history so the app looks alive and beautiful on first run
 */
function createInitialSeedData(): FlowStorageState {
  const targets = calculateLocalFallbackTargets(DEFAULT_PROFILE);
  const todayKey = getTodayKey();
  const pastDays = getPastNDays(todayKey, 7);

  const logsByDate: Record<string, FoodItem[]> = {};

  // Sample meals for today
  logsByDate[todayKey] = [
    {
      id: 'seed-today-1',
      mealGroup: 'Breakfast',
      name: '2 Scrambled Eggs & Whole Wheat Toast',
      portion: '2 large eggs, 1 toast with butter',
      calories: 320,
      protein: 17,
      carbs: 24,
      fat: 18,
      timestamp: Date.now() - 3600000 * 6,
    },
    {
      id: 'seed-today-2',
      mealGroup: 'Lunch',
      name: 'Grilled Salmon Bowl with Quinoa & Avocado',
      portion: '1 bowl (350g)',
      calories: 620,
      protein: 44,
      carbs: 46,
      fat: 26,
      timestamp: Date.now() - 3600000 * 2,
    },
    {
      id: 'seed-today-3',
      mealGroup: 'Snacks',
      name: 'Whey Protein Shake & Apple',
      portion: '1 scoop with water + 1 honeycrisp apple',
      calories: 230,
      protein: 27,
      carbs: 26,
      fat: 3,
      timestamp: Date.now() - 3600000 * 1,
    },
  ];

  // Seed previous 6 days with realistic meal logs
  const pastTemplates = [
    { cal: 2150, p: 145, c: 220, f: 65 },
    { cal: 2280, p: 152, c: 235, f: 72 },
    { cal: 1980, p: 138, c: 195, f: 58 },
    { cal: 2340, p: 160, c: 240, f: 75 },
    { cal: 2120, p: 142, c: 215, f: 64 },
    { cal: 2250, p: 148, c: 230, f: 69 },
  ];

  pastDays.slice(0, 6).forEach((dKey, idx) => {
    const t = pastTemplates[idx % pastTemplates.length];
    logsByDate[dKey] = [
      {
        id: `seed-${dKey}-1`,
        mealGroup: 'Breakfast',
        name: 'Oatmeal with Whey Protein & Berries',
        portion: '1 large bowl',
        calories: Math.round(t.cal * 0.28),
        protein: Math.round(t.p * 0.26),
        carbs: Math.round(t.c * 0.35),
        fat: Math.round(t.f * 0.22),
        timestamp: parseDateKey(dKey).getTime() + 8 * 3600000,
      },
      {
        id: `seed-${dKey}-2`,
        mealGroup: 'Lunch',
        name: 'Chicken Rice Bowl with Roasted Veggies',
        portion: '1 plate',
        calories: Math.round(t.cal * 0.38),
        protein: Math.round(t.p * 0.42),
        carbs: Math.round(t.c * 0.38),
        fat: Math.round(t.f * 0.35),
        timestamp: parseDateKey(dKey).getTime() + 13 * 3600000,
      },
      {
        id: `seed-${dKey}-3`,
        mealGroup: 'Dinner',
        name: 'Lean Beef Sirloin with Sweet Potato',
        portion: '200g beef + 1 potato',
        calories: Math.round(t.cal * 0.34),
        protein: Math.round(t.p * 0.32),
        carbs: Math.round(t.c * 0.27),
        fat: Math.round(t.f * 0.43),
        timestamp: parseDateKey(dKey).getTime() + 19 * 3600000,
      },
    ];
  });

  return {
    onboarded: true,
    profile: DEFAULT_PROFILE,
    targets,
    logsByDate,
    insightsByDate: {
      [todayKey]: {
        summary:
          'Excellent protein pacing so far today with 88g logged across breakfast and lunch.',
        suggestedMeal:
          'For dinner, aim for a balanced 550 kcal meal with ~45g carbs and ~35g protein, like grilled chicken breast with roasted sweet potatoes and asparagus.',
        reasoning:
          'You have approximately 980 calories remaining, perfectly primed for a wholesome dinner and an evening snack.',
        timestamp: Date.now(),
      },
    },
    quickFoods: DEFAULT_QUICK_FOODS,
    hydrationByDate: {
      [todayKey]: [
        { id: 'w-1', amountMl: 500, timestamp: Date.now() - 3600000 * 5 },
        { id: 'w-2', amountMl: 500, timestamp: Date.now() - 3600000 * 3 },
        { id: 'w-3', amountMl: 250, timestamp: Date.now() - 3600000 * 1 },
      ],
    },
  };
}

/**
 * Load state from localStorage with safe fallback to legacy key & seed defaults
 */
export function loadFlowState(): FlowStorageState {
  if (typeof window === 'undefined') {
    return createInitialSeedData();
  }

  try {
    const raw =
      window.localStorage.getItem(PRIMARY_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      const initial = createInitialSeedData();
      saveFlowState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);

    return {
      onboarded: Boolean(parsed.onboarded),
      profile: parsed.profile || DEFAULT_PROFILE,
      targets: parsed.targets || calculateLocalFallbackTargets(parsed.profile || DEFAULT_PROFILE),
      logsByDate: parsed.logsByDate || {},
      insightsByDate: parsed.insightsByDate || {},
      quickFoods:
        Array.isArray(parsed.quickFoods) && parsed.quickFoods.length > 0
          ? parsed.quickFoods
          : DEFAULT_QUICK_FOODS,
      hydrationByDate: parsed.hydrationByDate || {},
    };
  } catch (err) {
    console.error('Failed to load storage state, resetting to initial seed:', err);
    const initial = createInitialSeedData();
    saveFlowState(initial);
    return initial;
  }
}

/**
 * Persist state to localStorage
 */
export function saveFlowState(state: FlowStorageState): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to persist state to localStorage:', err);
  }
}

/**
 * Clear all stored data
 */
export function clearFlowState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PRIMARY_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}
