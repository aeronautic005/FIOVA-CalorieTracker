import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// -----------------------------------------------------------------------------
// Endpoint 1: Calculate Personalized Nutrition Targets
// -----------------------------------------------------------------------------
app.post('/api/calculate-targets', async (req: Request, res: Response) => {
  try {
    const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;

    if (!age || !gender || !heightCm || !weightKg || !activityLevel || !goal) {
      res.status(400).json({ error: 'Missing required biometric or goal parameters.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Return 503 so frontend gracefully falls back to local Mifflin-St Jeor math
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
        fallbackRequired: true,
      });
      return;
    }

    const prompt = `
You are an expert sports nutritionist and dietitian. Calculate precise daily caloric and macronutrient targets for an individual with the following profile:
- Age: ${age} years old
- Gender: ${gender}
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Activity Level: ${activityLevel}
- Primary Goal: ${goal} (lose_weight, maintain, or gain_muscle)

Requirements:
1. Use scientific BMR and TDEE formulas (like Mifflin-St Jeor).
2. For "lose_weight", target a safe, sustainable deficit of ~400-500 kcal.
3. For "gain_muscle", target a lean mass surplus of ~300-400 kcal with high protein (approx 1.8g - 2.2g per kg bodyweight).
4. For "maintain", target estimated TDEE.
5. Provide a 1-2 sentence encouraging explanation of the strategy.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.INTEGER, description: 'Daily calorie target in kcal' },
            protein: { type: Type.INTEGER, description: 'Daily protein target in grams' },
            carbs: { type: Type.INTEGER, description: 'Daily carbs target in grams' },
            fat: { type: Type.INTEGER, description: 'Daily fat target in grams' },
            explanation: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence explanation of the calculated nutrition plan',
            },
          },
          required: ['calories', 'protein', 'carbs', 'fat', 'explanation'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error calculating targets via Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to calculate targets with AI.',
      fallbackRequired: true,
    });
  }
});

// -----------------------------------------------------------------------------
// Endpoint 2: Parse Natural-Language Meal Description
// -----------------------------------------------------------------------------
app.post('/api/parse-meal', async (req: Request, res: Response) => {
  try {
    const { text, mealGroup } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Meal description text is required.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    const prompt = `
You are an expert nutrition database and food item parser.
Parse the following natural language meal description into individual food items with realistic, accurate nutritional estimations (calories, protein in grams, carbohydrates in grams, dietary fat in grams):

Meal Description: "${text}"
Meal Category Context: "${mealGroup || 'Meal'}"

Instructions:
- Split distinct foods into separate items (e.g. "two eggs and toast with butter" -> Item 1: "Scrambled/Fried Eggs", Item 2: "Toast with Butter").
- Provide realistic portion descriptions (e.g. "2 large eggs", "1 slice sourdough + 1 tsp butter").
- Be accurate with macro breakdown: 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal. Total calories should roughly match 4*P + 4*C + 9*F.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Descriptive food item name' },
              portion: { type: Type.STRING, description: 'Serving size or quantity' },
              calories: { type: Type.INTEGER, description: 'Calories in kcal' },
              protein: { type: Type.INTEGER, description: 'Protein in grams' },
              carbs: { type: Type.INTEGER, description: 'Carbs in grams' },
              fat: { type: Type.INTEGER, description: 'Fat in grams' },
            },
            required: ['name', 'portion', 'calories', 'protein', 'carbs', 'fat'],
          },
        },
      },
    });

    const responseText = response.text?.trim() || '[]';
    const items = JSON.parse(responseText);
    res.json({ items });
  } catch (error: any) {
    console.error('Error parsing meal via Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to parse meal description with AI.',
    });
  }
});

// -----------------------------------------------------------------------------
// Endpoint 3: Daily Progress Coaching & Next-Meal Suggestion
// -----------------------------------------------------------------------------
app.post('/api/daily-insight', async (req: Request, res: Response) => {
  try {
    const { goal, targets, currentTotals, meals, date } = req.body;

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    const remainingCalories = (targets?.calories || 2000) - (currentTotals?.calories || 0);
    const remainingProtein = (targets?.protein || 150) - (currentTotals?.protein || 0);
    const remainingCarbs = (targets?.carbs || 200) - (currentTotals?.carbs || 0);
    const remainingFat = (targets?.fat || 65) - (currentTotals?.fat || 0);

    const prompt = `
You are an encouraging and analytical health & nutrition coach for an app called Fiova.
Review the user's daily nutrition progress for ${date || 'today'} and provide contextual feedback and a specific next-meal suggestion:

User Context:
- Primary Goal: ${goal || 'maintain'}
- Daily Calorie Target: ${targets?.calories || 2000} kcal (Current: ${currentTotals?.calories || 0} kcal, Remaining: ${remainingCalories} kcal)
- Protein Target: ${targets?.protein || 150}g (Current: ${currentTotals?.protein || 0}g, Remaining: ${remainingProtein}g)
- Carbs Target: ${targets?.carbs || 200}g (Current: ${currentTotals?.carbs || 0}g, Remaining: ${remainingCarbs}g)
- Fat Target: ${targets?.fat || 65}g (Current: ${currentTotals?.fat || 0}g, Remaining: ${remainingFat}g)
- Logged Meals Today: ${JSON.stringify(meals || [])}

Deliverables:
1. summary: A warm, concise 1-2 sentence overview of their nutritional progress today (mentioning protein pacing or caloric balance).
2. suggestedMeal: A concrete, delicious meal or snack recommendation that fits their remaining macro and caloric budget (e.g. "Grilled chicken breast with roasted sweet potatoes and steamed broccoli").
3. reasoning: A 1-sentence explanation of why this meal helps them reach their daily target or athletic goal.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: '1-2 sentence summary of daily progress and macro pacing',
            },
            suggestedMeal: {
              type: Type.STRING,
              description: 'Concrete next-meal or snack recommendation tailored to remaining macros',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Brief explanation of why this recommendation supports their daily goal',
            },
          },
          required: ['summary', 'suggestedMeal', 'reasoning'],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const insight = JSON.parse(responseText);
    res.json({ ...insight, timestamp: Date.now() });
  } catch (error: any) {
    console.error('Error generating daily insight via Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate AI insight.',
    });
  }
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serving Setup
// -----------------------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      console.log('Running in API-only development mode on port', PORT);
    }
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Fiova AI Backend running at http://localhost:${PORT}`);
  });
}

startServer();
