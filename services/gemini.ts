
import { GoogleGenAI } from "@google/genai";

/**
 * Fetches a personalized motivational quote from Gemini.
 */
export const getMotivationalQuote = async (name: string, days: number, reason: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `The user ${name} has been smoke-free for ${days} days. Their main reason for quitting is "${reason}". Write a short, single-sentence motivational quote specifically for them for today. Tone: Encouraging but firm.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "You're making incredible progress. Keep breathing deep.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Every breath you take is a step toward a cleaner, healthier you.";
  }
};

/**
 * Provides immediate, diverse, and highly contextual advice for someone experiencing a craving.
 */
export const getCravingAdvice = async (name: string, days: number, reason: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Refined prompt to avoid repetitive "drink water/breathe" answers.
  // We ask for unique psychological or physical hacks.
  const prompt = `
    COMMAND: Provide a unique, surprising, and immediate psychological or physical hack to kill a cigarette craving right now. 
    CONTEXT: 
    - User Name: ${name}
    - Days Smoke-Free: ${days}
    - Deep Motivation: "${reason}"
    
    RULES:
    1. Do NOT give generic advice (like "drink water" or "take deep breaths") unless it's a very creative variation.
    2. Be specific to their motivation ("${reason}").
    3. Be punchy, urgent, and fierce.
    4. Keep it under 25 words. 
    5. Avoid repeating yourself; generate a fresh perspective on this specific moment of struggle.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9, // Higher temperature for more variety
      }
    });

    return response.text?.trim() || "Hold an ice cube in your hand until it melts. Focus on the cold, not the smoke.";
  } catch (error) {
    console.error("Gemini SOS Error:", error);
    return "Visualize your future self healthy and free. This craving is just a shadow passing through.";
  }
};
