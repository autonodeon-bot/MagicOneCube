import { GoogleGenAI, Type } from "@google/genai";

// NOTE: In a real production app, this key should be proxied through a backend
// or loaded from process.env. For this demo structure, we assume it's available.
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

try {
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
} catch (e) {
    console.error("Failed to initialize Gemini Client", e);
}

export const generateDailyFact = async (): Promise<string> => {
    if (!ai) return "Магниты удивительны! (AI недоступен)";

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