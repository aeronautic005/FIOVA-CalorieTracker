# Fiova — Developer Architecture & Migration Guide (`migration.md`)

This document serves as the comprehensive technical handoff and developer reference for **Fiova — AI Calorie Tracker & Nutrition Intelligence**. It documents the complete project structure, the current state of every feature, the new **Soft-Clay / Slate Dashboard design system**, state management contracts, and guidelines for extending the codebase.

---

## 1. Project Structure

Fiova is a full-stack TypeScript application combining a **React 19 + Vite 6 + Tailwind CSS v4** frontend with an **Express + `@google/genai` (Gemini 3.8 Flash)** server.

```text
├── .env.example                        # Environment variable template (GEMINI_API_KEY, PORT)
├── .gitignore                          # Git ignore rules for node_modules, build outputs, and env secrets
├── index.html                          # HTML entry point loading Plus Jakarta Sans & JetBrains Mono
├── migration.md                        # Architecture, feature states & extension guide
├── package.json                        # Dependencies, scripts (dev, build, preview, start)
├── README.md                           # Repository documentation, setup instructions & API reference
├── server.ts                           # Express backend + Gemini 3.8 Flash API routes + Vite dev middleware
├── tsconfig.json                       # Strict TypeScript compiler configuration
├── vite.config.ts                      # Vite bundler configuration with React & Tailwind v4 plugins
└── src/
    ├── main.tsx                        # React application root mount
    ├── App.tsx                         # Root controller, state orchestrator & responsive layout
    ├── index.css                       # Modern soft-slate clay design tokens & card utility classes
    ├── types.ts                        # Core TypeScript domain models & persistence interfaces
    ├── utils/
    │   └── storage.ts                  # LocalStorage persistence, date math, seed history & Mifflin-St Jeor engine
    └── components/
        ├── Sidebar.tsx                 # Navigation links, Fiova branding & recalibrate targets card
        ├── TopHeader.tsx               # AI search quick-log bar, period switcher pills & date range
        ├── CalorieAndMacroHero.tsx     # Signature dark hero calorie card & 3 animated white macro cards
        ├── WeeklyChartCard.tsx         # 7-day pill-bar calorie trend chart with target reference line
        ├── CalendarCard.tsx            # Mini weekly calendar strip & circular goal adherence gauge
        ├── AiInsightsCard.tsx          # Gemini daily progress summary & one-tap meal staging well
        ├── NaturalLanguageLogger.tsx   # Plain-English meal input, category tabs, quick chips & review card
        ├── MealGroupsSection.tsx       # Daily logged meals table with inline editing, macros & status badge
        └── OnboardingModal.tsx         # Profile modal with live Metric/Imperial conversions & AI recalibration
```

---

## 2. Current State of Application Features

### 2.1. Soft-Slate Dashboard Layout & Navigation (`Sidebar.tsx`, `TopHeader.tsx`, `App.tsx`)
- **Left Sidebar**: Displays the Fiova flame brand logo, active pill navigation for **Dashboard**, **Meal Log**, **AI Coach**, and **Analytics**, a dark graphite **Target Calibrated** card with a direct **Recalibrate Targets** action, and a mobile sliding drawer.
- **Top Header**: Features an omnipresent AI quick-log search bar (`Log: '2 eggs and toast' or ask AI...`), segmented period switcher pills (`Day`, `Week`, `Month`, `Year`) with charcoal highlighting, a calendar date indicator pill, a notification bell, and the user profile avatar.

### 2.2. Top Metric Cards (`CalorieAndMacroHero.tsx`)
- **Signature Dark Hero Card**: Standout dark graphite pill card (`#18181B`) showing calories eaten vs. daily target (`1,170 / 2,200 kcal`), remaining countdown (`980 kcal remaining`), spring-animated micro progress bar, and over-budget alert states.
- **3 Crisp White Macro Cards**: High-contrast white pill cards for **Protein**, **Carbohydrates**, and **Dietary Fat** with spring-loaded progress bars, tabular gram counts, percentage badges, and physiological context labels (*Muscle repair*, *Daily energy*, *Hormonal health*).

### 2.3. 7-Day Pill-Bar Trend Chart (`WeeklyChartCard.tsx`)
- **Pill-Bar Visualization**: Computes a rolling 7-day window ending on `selectedDate` and renders rounded vertical pill bars against a dashed horizontal target reference line.
- **Active Day Highlight**: The bar matching `selectedDate` is highlighted in charcoal (`#71717A`) with hover tooltips displaying exact caloric intake.
- **7-Day Rolling Average**: Automatically calculates average daily caloric intake and compares it against the target goal.

### 2.4. Interactive Mini Calendar & Adherence Ring (`CalendarCard.tsx`)
- **5-Day Calendar Strip**: Displays `< Month Year >` navigation with previous/next controls and day buttons (`Tue 17`, `Wed 18`, `[Thu 19]`). Active day is highlighted as an elevated charcoal pill.
- **Circular Adherence Ring**: Animated circular SVG progress gauge displaying the percentage completion of daily nutrition goals (`65%`) and pacing indicators.

### 2.5. AI Daily Insights & Coaching (`AiInsightsCard.tsx`)
- **Contextual Coaching**: Calls `POST /api/daily-insight` powered by Gemini 3.8 Flash, evaluating the selected day's meals and remaining macronutrient budget.
- **Recommended Next Meal Well**: Suggests a specific meal tailored to remaining macros (e.g. *"Grilled Chicken Breast with Sweet Potato"*).
- **One-Tap Staging**: Includes a **"Stage to Logger"** button that automatically pre-populates the suggestion into the natural-language logger.
- **Resilience**: Shimmer skeleton loading state during generation and smart algorithmic fallbacks if offline.

### 2.6. Natural-Language Meal Logger (`NaturalLanguageLogger.tsx`)
- **Time-of-Day Category Tabs**: Segmented tabs for `Breakfast`, `Lunch`, `Dinner`, and `Snacks` (defaults automatically based on current local hour).
- **Gemini AI Parser**: Natural descriptions sent to `POST /api/parse-meal` return structured items with `name`, `portion`, `calories`, `protein`, `carbs`, and `fat`.
- **Pre-Commit Review Card**: Interactive confirmation drawer where users can adjust item names, portions, calories, or macros inline, delete items, add custom blank rows, and preview live meal totals.
- **Quick-Add Chips**: Horizontally scrollable row of frequently and recently logged foods for 1-tap logging.

### 2.7. Grouped Daily Meals Table (`MealGroupsSection.tsx`)
- **Structured Table Layout**: Clean tabular feed displaying `Food Item` (with category icon & portion), `Category`, `Macronutrients` (`P · C · F`), `Calories` (`320 kcal`), and `Status / Actions` (charcoal `Logged` badge, inline edit, delete).
- **Category Filter**: Filter tabs for `All`, `Breakfast`, `Lunch`, `Dinner`, and `Snacks`.

### 2.8. Onboarding & Target Recalibration Modal (`OnboardingModal.tsx`)
- **Trigger**: Launches automatically on first visit (`!state.onboarded`) or manually via the sidebar card, top avatar, or hero card.
- **Live Unit Switcher**: Metric (`cm` / `kg`) $\leftrightarrow$ Imperial (`ft + in` / `lbs`) with live bidirectional conversion.
- **AI Target Calculation**: Sends biometrics and goals to `POST /api/calculate-targets` with spinner feedback and automatic fallback to the scientific **Mifflin-St Jeor formula**.
- **Manual Customization**: Lets users fine-tune individual targets and includes a one-click **"Sync Calories to Macros"** helper (`4·P + 4·C + 9·F`).

---

## 3. Extending the State Management System

Persistent state is managed in `FlowStorageState` (`src/types.ts`), persisted in `localStorage` under `PRIMARY_STORAGE_KEY` (`fiova_nutrition_state_v1`), and orchestrated in `src/App.tsx`.

### Step 1: Define New Domain Models in `src/types.ts`
When introducing a new feature (e.g., daily hydration or workout tracking):

```ts
// src/types.ts
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
  // New slice keyed by YYYY-MM-DD:
  hydrationByDate?: Record<string, HydrationEntry[]>;
}
```

### Step 2: Hydration & Defaulting in `src/utils/storage.ts`
Ensure `loadFlowState()` provides a safe fallback:

```ts
// src/utils/storage.ts
return {
  onboarded: Boolean(parsed.onboarded),
  profile: parsed.profile || DEFAULT_PROFILE,
  targets: parsed.targets || calculateLocalFallbackTargets(parsed.profile),
  logsByDate: parsed.logsByDate || {},
  insightsByDate: parsed.insightsByDate || {},
  quickFoods: Array.isArray(parsed.quickFoods) ? parsed.quickFoods : DEFAULT_QUICK_FOODS,
  hydrationByDate: parsed.hydrationByDate || {}, // Safe backward-compatible default
};
```

### Step 3: State Mutation Handlers in `src/App.tsx`
`App.tsx` automatically persists changes via `useEffect(() => saveFlowState(state), [state])`. Add immutable state updaters:

```ts
const handleAddWater = (amountMl: number) => {
  setState((prev) => {
    const existing = prev.hydrationByDate?.[selectedDate] || [];
    const nextEntry: HydrationEntry = {
      id: `water-${Date.now()}`,
      amountMl,
      timestamp: Date.now(),
    };
    return {
      ...prev,
      hydrationByDate: {
        ...(prev.hydrationByDate || {}),
        [selectedDate]: [...existing, nextEntry],
      },
    };
  });
};
```

---

## 4. Design System Tokens & Styling Classes

All UI elements adhere to the soft-clay / slate dashboard design system defined in `src/index.css`:

| Utility Class | Purpose & Characteristics |
| :--- | :--- |
| `body` / Canvas | `#EAE8ED` soft-clay backdrop with antialiased typography |
| `.card-white` | Pure white pill cards (`rounded-[26px]`) with soft ambient diffuse shadow (`0 4px 20px -2px rgba(24, 24, 27, 0.04)`) |
| `.card-dark` | Standout dark graphite pill card (`linear-gradient(145deg, #1C1B20, #121215)`) with specular border highlight |
| `.card-dark-gradient` | Subtle dark gradient for sidebar callouts |
| `.pill-tab` | Pill tabs for navigation and period switchers |
| `.pill-tab-dark` | Active charcoal pill indicator (`#18181B`) with white text |
| `.input-soft` | Pill-shaped text input bar with subtle shadow and border focus |
| `.tabular-nums` | Monospaced numeric alignment for metrics, grams, and percentages |
