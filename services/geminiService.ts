import { GoogleGenAI } from "@google/genai";

// Safe access to environment variable to prevent "process is not defined" crash in browsers
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env.API_KEY || '';
    }
  } catch (e) {
    return '';
  }
  return '';
};

const API_KEY = getApiKey();
let ai: GoogleGenAI | null = null;

try {
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } else {
        console.warn("Gemini API Key missing. AI features disabled.");
    }
} catch (e) {
    console.error("Failed to initialize Gemini Client", e);
}

export const generateDailyFact = async (): Promise<string> => {
    if (!ai) return "Магниты удивительны!";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a short, fun, one-sentence fact about magnets or physics in Russian language for a game loading screen.",
        });
        return response.text || "Магнитные поля невидимы, но сильны.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Магнетизм связывает вселенную воедино.";
    }
};

export const generateQuestDescription = async (theme: string): Promise<string> => {
    if (!ai) return `Специальный квест на тему: ${theme}.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a mysterious and exciting 2-sentence description for a daily quest in a game about magnetic cubes in Russian language. Theme: ${theme}`,
        });
        return response.text || "Исследуйте магнитные поля и найдите скрытое ядро.";
    } catch (error) {
        return "Обнаружена таинственная магнитная аномалия.";
    }
};