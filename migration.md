# Flow — Developer Architecture & Migration Guide (`migration.md`)

This document serves as the comprehensive technical handoff for **Flow — Liquid Glass AI Calorie Tracker**. It outlines the project directory structure, details the current state of every feature, and provides step-by-step instructions for extending the state management system and building new UI sections that adhere strictly to Flow’s iOS 26 Liquid Glass design language.

---

## 1. Project Structure

Flow is a full-stack TypeScript application combining a **React 19 + Vite 8 + Tailwind CSS v4** frontend with an **Express + `@google/genai`** server.

```text
├── .env.example                        # Environment variable template (GEMINI_API_KEY, APP_URL)
├── index.html                          # HTML entry point loading Plus Jakarta Sans & JetBrains Mono
├── metadata.json                       # AI Studio applet metadata & capabilities
├── migration.md                        # Developer architecture, feature state & extension guide
├── package.json                        # Scripts (dev, build, start, lint) and dependencies
├── server.ts                           # Express backend + Gemini 3.8 Flash API routes + Vite middleware
├── tsconfig.json                       # TypeScript compiler configuration
├── vite.config.ts                      # Vite bundler configuration with React & Tailwind v4 plugins
└── src/
    ├── main.tsx                        # React application root mount
    ├── App.tsx                         # Root controller, date navigation bar, and state orchestrator
    ├── index.css                       # iOS 26 Liquid Glass utility classes & ambient blob animations
    ├── types.ts                        # Core TypeScript domain & persistence interfaces
    ├── utils/
    │   └── storage.ts                  # localStorage persistence, date math, seed history & fallback BMR math
    └── components/
        ├── OnboardingModal.tsx         # Glass onboarding modal & AI nutrition target calculator
        ├── CalorieAndMacroHero.tsx     # Animated SVG calorie ring & 3 spring-animated macro progress bars
        ├── NaturalLanguageLogger.tsx   # Plain-language meal input, quick-add chips & confirmation card
        ├── AiInsightsCard.tsx          # Gemini daily progress summary & next-meal suggestion card
        ├── MealGroupsSection.tsx       # Breakfast, Lunch, Dinner & Snacks cards with inline item editing
        └── WeeklyViewSection.tsx       # 7-day smooth SVG calorie trend chart & average macro split
```

---

## 2. Current State of Application Features

### 2.1. Glass Onboarding & Personalized Target Calculation (`OnboardingModal.tsx`)
- **Trigger**: Automatically opens on first launch (`!state.onboarded`) or manually via the **Goals & Profile** button in the top navigation bar and the **Adjust Targets** button in the hero card.
- **Inputs**: Collects `age`, `gender` (`female` | `male` | `non-binary`), `heightCm` (with live Metric `cm` / Imperial `ft + in` conversion), `weightKg` (with live `kg` / `lbs` conversion), `activityLevel` (`sedentary` to `very_active`), and `goal` (`lose_weight` | `maintain` | `gain_muscle`).
- **AI Target Calculation**: Sends the profile payload to `POST /api/calculate-targets`, where `gemini-3.8-flash` calculates daily `calories`, `protein`, `carbs`, and `fat` targets alongside a concise `explanation`.
- **Resilience & Editability**: Displays frosted shimmer skeletons during generation, provides a retry action plus an offline Mifflin-St Jeor formula fallback (`calculateLocalFallbackTargets`), and lets users manually edit every target value (including a one-click **Sync Calories to Macros** helper) before saving.

### 2.2. Dashboard with Calorie Ring & Macro Tracking (`CalorieAndMacroHero.tsx`)
- **Animated Calorie Ring**: A multi-layered SVG circular gauge with spring physics (`motion.circle`), specular inner track highlights, and drop-shadow glow. Displays calories eaten, daily calorie target, remaining (or exceeded) calories, and percentage completion. Automatically shifts its gradient from sky/indigo/violet to rose/crimson if the daily calorie target is exceeded.
- **Animated Macro Bars**: Three horizontal liquid glass progress bars for **Protein**, **Carbohydrates**, and **Dietary Fat**, each animated via `motion.div` spring physics and displaying grams eaten, target grams, percentage, and grams remaining using `tabular-nums`.

### 2.3. Natural-Language Meal Logging & Quick-Add Chips (`NaturalLanguageLogger.tsx`)
- **Meal Category Selector**: Segmented glass tab control to target `Breakfast`, `Lunch`, `Dinner`, or `Snacks` (defaults automatically based on the user’s local time of day on load).
- **Plain-Language AI Parser**: Sends natural descriptions (e.g., *"two eggs, a slice of buttered toast, and a black coffee"*) to `POST /api/parse-meal`. Gemini returns structured items with `name`, `portion`, `calories`, `protein`, `carbs`, and `fat`.
- **Glass Confirmation Card**: Before committing items to the daily log, users review them in an elevated glass card where every item’s name, portion, calories, and macros can be edited inline, individual items can be deleted, custom blank rows can be added, and the live meal total is previewed.
- **Quick-Add Chips**: A horizontal scrollable row of recent and frequently logged foods (`QuickFoodTemplate[]`), ranked dynamically by usage frequency and recency. Tapping a chip logs the food immediately (or appends it to the open confirmation card if one is active).

### 2.4. Grouped Daily Meals (`MealGroupsSection.tsx`)
- **Four Meal Containers**: Displays the selected date’s logged items grouped into **Breakfast**, **Lunch**, **Dinner**, and **Snacks** in a 2-column desktop / 1-column mobile grid.
- **Per-Meal Totals & Inline CRUD**: Each card computes its own calorie and macro subtotals (`P · C · F`) and allows users to edit any logged food item inline or delete it immediately. Each card also includes a **Log to [Meal]** shortcut that scrolls to and focuses the natural-language input bar.

### 2.5. AI Daily Insights (`AiInsightsCard.tsx`)
- **Contextual Coaching**: Calls `POST /api/daily-insight` with the user’s goal, daily targets, current intake totals, and logged meals for the selected date.
- **Output & One-Tap Action**: Renders a friendly 1–2 sentence summary of the day so far alongside a concrete next-meal suggestion tailored to the user’s remaining calories and macros. Includes a one-tap **Analyze “[Suggested Meal]”** button that stages the suggested meal directly into the AI meal parser.
- **Caching**: Caches generated insights per date (`insightsByDate[YYYY-MM-DD]`) in `localStorage` and provides a manual **Refresh Insight** button.

### 2.6. Weekly View & Historical Date Lookback (`WeeklyViewSection.tsx` & `App.tsx`)
- **Smooth 7-Day Calorie Chart**: Computes a 7-day window ending on `selectedDate` and renders a cubic-bezier smooth SVG curve + gradient area fill against a dashed horizontal target line. Clicking any day node switches `selectedDate` to inspect or edit that day’s meals.
- **Average Macro Split**: Calculates 7-day average daily calories and macro grams (`Protein`, `Carbs`, `Fat`) alongside a proportional caloric split bar (`% Protein`, `% Carbs`, `% Fat`).
- **Date Navigation**: Users can look back at any previous day via the top horizontal 7-day scroller, previous/next day chevrons, native date pickers, or a **Jump to Today** button.

---

## 3. Extending the State Management System

All persistent client state is centralized in `FlowStorageState` (`src/types.ts`), hydrated and saved via `src/utils/storage.ts`, and orchestrated in `src/App.tsx`.

### Step 1: Define New Types in `src/types.ts`
When adding a new feature domain (for example, daily hydration tracking or workout logs), first define the data interface and attach it to `FlowStorageState`:

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
  // New state slice keyed by YYYY-MM-DD:
  hydrationByDate?: Record<string, HydrationEntry[]>;
}
```

### Step 2: Update Hydration & Defaults in `src/utils/storage.ts`
Ensure `loadFlowState()` safely defaults your new property so existing users with older `localStorage` payloads do not encounter `undefined` errors:

```ts
// Inside loadFlowState() in src/utils/storage.ts
return {
  onboarded: Boolean(parsed.onboarded),
  profile: parsed.profile,
  targets: parsed.targets,
  logsByDate: parsed.logsByDate || {},
  insightsByDate: parsed.insightsByDate || {},
  quickFoods:
    Array.isArray(parsed.quickFoods) && parsed.quickFoods.length > 0
      ? parsed.quickFoods
      : DEFAULT_QUICK_FOODS,
  hydrationByDate: parsed.hydrationByDate || {}, // Safe backward-compatible fallback
};
```
*Note: Only bump `STORAGE_KEY` (`flow_liquid_glass_state_v1`) if introducing a breaking schema change without a fallback migration.*

### Step 3: Add Immutable Handlers in `src/App.tsx`
`src/App.tsx` automatically persists `state` to `localStorage` via `useEffect(() => saveFlowState(state), [state])`. Add immutable state updaters scoped by `selectedDate`:

```ts
const currentDayHydration = useMemo(
  () => state.hydrationByDate?.[selectedDate] || [],
  [state.hydrationByDate, selectedDate]
);

const handleAddHydration = (amountMl: number) => {
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

### Step 4: Adding New Gemini AI Endpoints in `server.ts`
1. Never import `@google/genai` in client code (`src/*`).
2. Add a new `app.post("/api/your-endpoint", ...)` route in `server.ts` using `getGenAIClient()`.
3. Use `model: "gemini-3.8-flash"` with `responseMimeType: "application/json"` and an explicit `responseSchema` using `Type.OBJECT` / `Type.ARRAY`.

---

## 4. Adding New UI Sections in the iOS 26 Liquid Glass Design Language

Every new component in `src/components/` must follow Flow’s material hierarchy, typography, and motion rules defined in `src/index.css`.

### 4.1. Material Hierarchy & Surface Classes
Use the pre-built CSS classes in `src/index.css` rather than ad-hoc opaque backgrounds:

| Class Name | Intended Usage | Visual Characteristics |
| :--- | :--- | :--- |
| `.liquid-glass` | Primary top-level section cards (`<section>`) | `backdrop-blur(28px) saturate(190%)`, translucent white gradient (`0.72` → `0.48`), `1px` bright edge highlight (`rgba(255,255,255,0.82)`), inner specular glow, layered ambient shadow |
| `.liquid-glass-elevated` | Modals, confirmation drawers, floating popovers | Stronger blur (`36px`), higher opacity (`0.84` → `0.62`), deeper elevation shadow |
| `.liquid-glass-subtle` | Inner list rows, stat wells, segmented control tracks | Lighter blur (`20px`), softer translucency (`0.58` → `0.36`), subtle `1px` border |
| `.liquid-input` | Text inputs, number inputs, date pickers | Translucent input surface that brightens and adds a soft sky-blue focus halo (`0 0 0 3px rgba(56,189,248,0.22)`) on `:focus-within` |
| `.liquid-button-primary` | Primary CTA buttons | Deep slate translucent glass with top inner specular edge and lift-on-hover + `scale(0.98)` press feedback |
| `.liquid-button-secondary` | Secondary actions, chips, icon buttons | Frosted white glass button with bright border and subtle hover lift |

### 4.2. Corner Radii & Spatial Math
- **Outer Section Containers**: Always use `rounded-[32px]` (or `rounded-[28px]` for medium grid cards) with `p-6 sm:p-8` padding.
- **Nested Inner Surfaces**: Follow nested radius math ($r_{\text{inner}} = r_{\text{outer}} - \text{padding}$). Inside a `rounded-[32px]` section, use `rounded-3xl` (`24px`) or `rounded-2xl` (`16px`) for `.liquid-glass-subtle` child rows.
- **Single-Level Card Elevation**: Avoid stacking heavy drop-shadow cards inside cards. Place `.liquid-glass-subtle` items inside a `.liquid-glass` section.

### 4.3. Typography & Numeric Discipline
- **Font Pairing**: `Plus Jakarta Sans` (with system `-apple-system, BlinkMacSystemFont` fallback) is used for headings and prose; `JetBrains Mono` is used for telemetry and chart axes.
- **Tabular Numerals**: Always apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to any element displaying calories, grams, percentages, or dates so numbers align vertically and never jitter during animations.
- **Zero-Pill Metadata**: Render static metadata (such as macro breakdowns `24g P · 34g C · 19g F` or timestamps) as clean inline text separated by middle dots (`<span aria-hidden="true">·</span>`), reserving button/chip enclosures strictly for interactive controls.

### 4.4. Spring Animations & Loading / Error States
- **Spring Physics**: Use `motion` from `"motion/react"` for interactive transitions and progress indicators:
  ```tsx
  transition={{ type: "spring", stiffness: 300, damping: 26 }}
  ```
- **Touch Hitboxes**: Ensure all interactive buttons, chips, and icon controls maintain at least `min-h-[40px]` to `min-h-[48px]` for mobile ergonomics.
- **AI Loading & Retry Pattern**: Every AI-driven section must include:
  1. A frosted shimmer skeleton (`bg-white/55 border border-white/80 animate-pulse`) while awaiting a response.
  2. A friendly `.liquid-glass-subtle` error banner with a clear explanation and an interactive **Try Again** button if the request fails.

### 4.5. Blueprint for a New Liquid Glass Section Component

```tsx
import React from "react";
import { motion } from "motion/react";
import { Droplets, Plus } from "lucide-react";

export const HydrationSection: React.FC<{
  totalMl: number;
  targetMl: number;
  onAddWater: (ml: number) => void;
}> = ({ totalMl, targetMl, onAddWater }) => {
  const pct = Math.min(100, Math.round((totalMl / Math.max(1, targetMl)) * 100));

  return (
    <section
      id="hydration-section"
      className="rounded-[32px] liquid-glass p-6 sm:p-7 space-y-4 relative overflow-hidden"
    >
      {/* Optional ambient internal refraction blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-sky-300/25 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Daily Hydration
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 tabular-nums">
              <span>{totalMl} ml</span>
              <span aria-hidden="true">·</span>
              <span>Target {targetMl} ml</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-700 font-semibold">{pct}%</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddWater(250)}
          className="min-h-[42px] px-4 py-2 rounded-2xl liquid-button-secondary text-xs font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-sky-600" />
          <span>+250 ml</span>
        </button>
      </div>

      <div className="rounded-2xl liquid-glass-subtle p-4">
        <div className="h-3.5 w-full rounded-full bg-sky-950/8 p-0.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 110, damping: 20 }}
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 relative"
          />
        </div>
      </div>
    </section>
  );
};
```
