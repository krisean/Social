// Prompt libraries for the game
// Now loaded from database instead of hardcoded arrays

import { createServiceClient } from './utils.ts';

export interface PromptLibrary {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompts: string[];
}

// Fallback prompts if database is unavailable
const FALLBACK_PROMPTS = [
  "What would you say if an alien landed in your backyard?",
  "What is the quickest way to get fired from your job?",
  "If you were to start a sports team, what would the mascot be?",
  "What is the worst theme for a children's birthday party?",
  "What would be the worst thing to hear from your doctor?",
  "What is the most useless superpower you can think of?",
  "If animals could talk, which one would be the rudest?",
  "Pitch a new reality show that would get canceled immediately.",
  "Name a terrible new cocktail people would still order.",
  "Rename a classic drink to fit its true personality.",
  "Write a pickup line one bar item would use on another.",
  "What's the worst thing to say at a funeral?",
  "If you had to rename a popular app, what would you call it?",
  "What's the most embarrassing thing to happen at a job interview?",
  "If you could make one law that everyone had to follow, what would it be?",
  "What's the worst superpower to have at a party?",
  "If you had to describe your last meal using only emojis, what would it be?",
  "What's the most ridiculous thing you could put on a resume?",
  "If you could make any animal the size of a house, which would be the most terrifying?",
  "What's the most useless invention you can think of?",
];

// Load prompt library from database
export async function getPromptLibrary(id?: string): Promise<PromptLibrary> {
  const libraryId = id || 'classic';
  const supabase = createServiceClient();
  
  try {
    // Get library metadata
    const { data: library, error: libraryError } = await supabase
      .from('prompt_libraries')
      .select('id, name, emoji, description')
      .eq('id', libraryId)
      .eq('is_active', true)
      .single();
    
    if (libraryError || !library) {
      console.error('Error loading library:', libraryError);
      // Return fallback
      return {
        id: 'classic',
        name: 'Classic Crowd',
        emoji: '🔥',
        description: 'Lighthearted pop-culture roasts for any crowd.',
        prompts: FALLBACK_PROMPTS,
      };
    }
    
    // Get prompts for this library
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('text')
      .eq('library_id', libraryId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (promptsError || !prompts || prompts.length === 0) {
      console.error('Error loading prompts:', promptsError);
      // Return fallback
      return {
        id: library.id,
        name: library.name,
        emoji: library.emoji,
        description: library.description,
        prompts: FALLBACK_PROMPTS,
      };
    }
    
    return {
      id: library.id,
      name: library.name,
      emoji: library.emoji,
      description: library.description,
      prompts: prompts.map(p => p.text),
    };
  } catch (error) {
    console.error('Exception loading library:', error);
    // Return fallback
    return {
      id: 'classic',
      name: 'Classic Crowd',
      emoji: '🔥',
      description: 'Lighthearted pop-culture roasts for any crowd.',
      prompts: FALLBACK_PROMPTS,
    };
  }
}

export const DEFAULT_PROMPTS = FALLBACK_PROMPTS;

export const GROUP_SIZE = 8;
export const TOTAL_ROUNDS = 3;
