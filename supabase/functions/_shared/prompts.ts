// Prompt libraries for the game

export interface PromptLibrary {
  id: string;
  name: string;
  emoji: string;
  prompts: string[];
}

export const DEFAULT_PROMPTS = [
  "What's the most overrated thing?",
  "What's a red flag in a person?",
  "What's your biggest pet peeve?",
  "What's the worst gift you've ever received?",
  "What's an unpopular opinion you have?",
  "What's something you're secretly proud of?",
  "What's the weirdest thing you believed as a kid?",
  "What's your most embarrassing moment?",
  "What's a skill you wish you had?",
  "What's the worst advice you've ever been given?"
];

export const PROMPT_LIBRARIES: Record<string, PromptLibrary> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    emoji: '🎯',
    prompts: DEFAULT_PROMPTS,
  },
  bar: {
    id: 'bar',
    name: 'Bar Night',
    emoji: '🍺',
    prompts: [
      "What's your go-to karaoke song?",
      "What's your worst hangover story?",
      "What's your signature drink?",
      "What's the craziest thing you've done at a bar?",
      "What's your favorite drinking game?",
    ],
  },
  // Add more libraries as needed
};

export function getPromptLibrary(id?: string): PromptLibrary {
  if (!id || !PROMPT_LIBRARIES[id]) {
    return PROMPT_LIBRARIES.classic;
  }
  return PROMPT_LIBRARIES[id];
}

export const GROUP_SIZE = 8;
export const TOTAL_ROUNDS = 3;


