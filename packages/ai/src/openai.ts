/**
 * OpenAI Moderation Service
 * Content moderation using OpenAI API
 */

import OpenAI from 'openai';

export interface ModerationResult {
  flagged: boolean;
  categories: {
    hate: boolean;
    harassment: boolean;
    self_harm: boolean;
    sexual: boolean;
    violence: boolean;
  };
  confidence: number;
}

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const client = getOpenAIClient();
    const response = await client.moderations.create({
      input: content,
    });

    const result = response.results[0];

    return {
      flagged: result.flagged,
      categories: {
        hate: result.categories.hate,
        harassment: result.categories.harassment,
        self_harm: result.categories['self-harm'],
        sexual: result.categories.sexual,
        violence: result.categories.violence,
      },
      confidence: Math.max(...Object.values(result.category_scores)),
    };
  } catch (error) {
    console.error('Moderation error:', error);
    // Fail open - don't block content on moderation errors
    return {
      flagged: false,
      categories: {
        hate: false,
        harassment: false,
        self_harm: false,
        sexual: false,
        violence: false,
      },
      confidence: 0,
    };
  }
}

export async function moderateMultiple(contents: string[]): Promise<ModerationResult[]> {
  return Promise.all(contents.map(moderateContent));
}

