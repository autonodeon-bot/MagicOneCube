import { GoogleGenAI } from "@google/genai";

// Initialize the API key safely. 
// In a browser environment via esm.sh, 'process' is undefined. 
// We must handle this to prevent the app from crashing before render.
const getApiKey = () => {
  try {
    // Check if process exists before accessing it
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return '';
};

const apiKey = getApiKey();
// Only initialize if key exists, otherwise let the functions handle the missing AI state
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateDailyFact = async (): Promise<string> => {
    if (!ai) return "Магнитные поля невидимы, но сильны. (AI Offline)";

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
    if (!ai) return `Исследуйте магнитные поля и найдите скрытое ядро. (AI Offline - Theme: ${theme})`;

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