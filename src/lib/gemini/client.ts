import { GoogleGenAI } from '@google/genai';

export const GEMINI_FALLBACK_MESSAGE =
  'AI analysis temporarily unavailable. Deterministic compliance checks remain available.';

export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL || 'gemini-3.6-flash';

let clientInstance: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

export function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }

  return clientInstance;
}
