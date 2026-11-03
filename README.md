# Fiova — AI Calorie Tracker & Nutrition Intelligence

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8e75ff?logo=googlegemini)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)
![Express](https://img.shields.io/badge/Express-4.21-white?logo=express)

**An intelligent, modern nutrition dashboard combining natural-language food logging, contextual AI coaching, and scientific metabolic calibration.**

</div>

---

## ✨ Features

- **🧠 Natural-Language AI Meal Logging**: Describe what you ate in plain English (e.g. *"2 scrambled eggs, avocado toast, and a black coffee"*) and Gemini 3.8 Flash automatically extracts individual food items, portion sizes, calories, and macronutrient breakdowns (Protein, Carbs, Fat).
- **📝 Interactive Pre-Commit Confirmation**: Review AI-parsed foods in a dedicated card where you can edit portions, customize grams, delete items, or add custom rows before committing to your log.
- **⚡ 1-Tap Quick-Add Chips**: Automatically surfaces your most frequent and recent meals for rapid logging.
- **🎯 Scientific Metabolic Profiling**: Calibrate your daily calorie, protein, carbs, and fat targets using your age, gender, height, weight, activity level, and primary fitness goal. Powered by Gemini 3.8 Flash with an automatic offline fallback to the **Mifflin-St Jeor BMR equation**.
- **🔄 Live Unit Switcher**: Seamlessly switch between Metric (`cm` / `kg`) and Imperial (`ft + in` / `lbs`) with bidirectional live conversion.
- **📊 7-Day Pill-Bar Intake Trends**: Visual 7-day intake chart featuring rounded vertical pill bars, dashed daily target reference lines, hover tooltips, and 7-day averages.
- **📅 Interactive Weekly Calendar Strip**: Smooth date navigation strip with quick day jumping, month navigation, and an animated circular goal adherence gauge.
- **🤖 Contextual AI Daily Coach**: Reviews daily intake vs. targets to provide actionable feedback, pacing advice, and tailored next-meal recommendations with a 1-tap **"Stage to Logger"** action.
- **📋 Grouped Daily Meals Feed**: Clean table feed grouping items by **Breakfast**, **Lunch**, **Dinner**, and **Snacks** with inline editing, macro summaries, and instant item deletion.
- **🔒 Privacy-First Client Persistence**: Fast client-side persistence in `localStorage` with built-in schema hydration and instant zero-config demo state.

---

## 🎨 Design Philosophy

Fiova is built with a **modern soft-slate clay aesthetic**:
- **Canvas**: Warm soft-grey backdrop (`#EAE8ED`)
- **Surfaces**: Pure white pill cards (`rounded-[26px]`) with soft ambient diffuse elevation
- **Hero Anchor**: Signature dark graphite card (`#18181B`) for daily caloric focus
- **Typography**: Clean paired hierarchy using **Plus Jakarta Sans** for prose/headings and **JetBrains Mono** for metrics and telemetry

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Backend**: Node.js, Express, TypeScript, `tsx`
- **AI Engine**: `@google/genai` SDK using `gemini-3.8-flash` with strict structured JSON schemas
- **Fonts**: Plus Jakarta Sans & JetBrains Mono

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/aeronautic005/FIOVA-CalorieTracker.git
cd FIOVA-CalorieTracker
npm install
```

### 3. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Add your Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
```

*(Note: If no API key is provided, Fiova gracefully runs in offline mode using local heuristic parsers and the Mifflin-St Jeor formula).*

### 4. Running the Development Server

Start the unified full-stack development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 5. Building for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
├── .env.example                        # Environment variable template
├── index.html                          # HTML entry point (Plus Jakarta Sans & JetBrains Mono)
├── migration.md                        # Architectural specification & feature handoff
├── package.json                        # Dependencies and scripts
├── server.ts                           # Express backend + Gemini 3.8 Flash endpoints
├── tsconfig.json                       # Strict TypeScript configuration
├── vite.config.ts                      # Vite bundler + Tailwind CSS v4 plugin
└── src/
    ├── main.tsx                        # React application mount
    ├── App.tsx                         # Root controller & state orchestrator
    ├── index.css                       # Soft-slate design tokens & card utilities
    ├── types.ts                        # TypeScript domain & persistence models
    ├── utils/
    │   └── storage.ts                  # LocalStorage hydration, date math & Mifflin-St Jeor engine
    └── components/
        ├── Sidebar.tsx                 # Navigation, branding, and targets card
        ├── TopHeader.tsx               # AI search bar, period switcher & date pill
        ├── CalorieAndMacroHero.tsx     # Dark hero calorie card + 3 white macro progress cards
        ├── WeeklyChartCard.tsx         # 7-day pill-bar calorie trend chart
        ├── CalendarCard.tsx            # Mini weekly calendar strip & circular adherence gauge
        ├── AiInsightsCard.tsx          # Gemini contextual coaching & next-meal suggestions
        ├── NaturalLanguageLogger.tsx   # Plain-English meal parser, quick chips & review card
        ├── MealGroupsSection.tsx       # Daily meals table with inline editing & filters
        └── OnboardingModal.tsx         # Profile modal with live Metric/Imperial conversions
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/calculate-targets` | Calculates personalized calories, protein, carbs, and fat based on biometrics & goal |
| `POST` | `/api/parse-meal` | Parses freeform meal descriptions into structured food items with macros |
| `POST` | `/api/daily-insight` | Evaluates daily intake vs. targets to return coaching feedback and meal suggestions |

---

## 📄 License

MIT © [aeronautic005](https://github.com/aeronautic005)
