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
    if (!ai) return "Magnets are fascinating! (AI Unavailable)";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a short, fun, one-sentence fact about magnets or physics for a game loading screen.",
        });
        return response.text || "Magnetic fields are invisible forces.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Magnetism binds the universe together.";
    }
};

export const generateQuestDescription = async (theme: string): Promise<string> => {
    if (!ai) return `A special quest involving ${theme}.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a mysterious and exciting 2-sentence description for a daily quest in a game about magnetic cubes. Theme: ${theme}`,
        });
        return response.text || "Explore the magnetic realms and find the hidden core.";
    } catch (error) {
        return "A mysterious magnetic anomaly has appeared.";
    }
};