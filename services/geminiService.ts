import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyFact = async (): Promise<string> => {
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