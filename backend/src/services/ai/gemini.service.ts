import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';

export interface GenerateContentParams {
  prompt: string;
  systemInstruction?: string;
  timeoutMs?: number;
}

export interface GeminiResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
  };
}

export class GeminiService {
  private static clientInstance: GoogleGenAI | null = null;

  /**
   * Check if Gemini API is configured in the environment
   */
  public static isConfigured(): boolean {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
  }

  /**
   * Get or initialize the official GoogleGenAI client singleton
   */
  public static getClient(): GoogleGenAI {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API key is not configured. Set GEMINI_API_KEY in your backend .env file.'
      );
    }

    this.clientInstance = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    return this.clientInstance;
  }

  /**
   * Reset client instance (useful for test suites or config changes)
   */
  public static resetClient(mockClient?: GoogleGenAI): void {
    this.clientInstance = mockClient || null;
  }

  /**
   * Generate content using the official Gemini API with timeout and error sanitization
   */
  public static async generateContent(params: GenerateContentParams): Promise<GeminiResponse> {
    const { prompt, systemInstruction, timeoutMs = 25000 } = params;

    if (!this.isConfigured() && !this.clientInstance) {
      throw new Error(
        'Gemini API key is not configured. Live AI requests require a valid GEMINI_API_KEY.'
      );
    }

    const client = this.getClient();
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

    const generatePromise = (async () => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
          temperature: env.AI_TEMPERATURE,
        },
      });

      const text = response.text || '';
      return {
        text,
        model,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount,
          responseTokens: response.usageMetadata?.candidatesTokenCount,
          totalTokens: response.usageMetadata?.totalTokenCount,
        },
      };
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('GEMINI_TIMEOUT: AI request timed out after 25 seconds.'));
      }, timeoutMs);
    });

    try {
      return await Promise.race([generatePromise, timeoutPromise]);
    } catch (err: any) {
      // Sanitize and translate provider errors
      const errorMessage = err?.message || String(err);

      if (errorMessage.includes('GEMINI_TIMEOUT')) {
        throw new Error('Gemini AI request timed out. Please try again shortly.');
      }

      if (
        errorMessage.includes('429') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.toLowerCase().includes('quota')
      ) {
        throw new Error('Gemini API rate limit reached. Please wait a moment and try again.');
      }

      if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
        throw new Error(
          `Configured Gemini model (${model}) was not found or is unavailable. Please verify GEMINI_MODEL.`
        );
      }

      if (errorMessage.includes('401') || errorMessage.includes('API_KEY_INVALID')) {
        throw new Error('The configured Gemini API key is invalid. Please check your credentials.');
      }

      // Safe sanitized generic error without leaking sensitive internals
      console.error('[Gemini Service Error]:', err?.message || err);
      throw new Error('Failed to generate AI response. Please try again later.');
    }
  }
}
