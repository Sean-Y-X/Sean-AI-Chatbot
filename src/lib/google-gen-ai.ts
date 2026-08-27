import { GoogleGenAI } from "@google/genai";

export const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
