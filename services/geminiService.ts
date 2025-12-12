import { GoogleGenAI } from "@google/genai";

// В браузере (без сборщика Vite/Webpack) переменная process не существует.
// Мы должны обрабатывать ключ безопасно.
// Если ключа нет, AI функции просто не будут работать, но приложение загрузится.
const API_KEY = ''; 

let ai: GoogleGenAI | null = null;

try {
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
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