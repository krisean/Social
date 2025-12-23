// @social/game-topcomment
// Top Comment game module (Event + 24/7 modes)

export * from './EventMode';
export * from './PatronMode';
export * from './components';
export * from './logic';
export * from './types';

import { GamePluginDefinition } from '@social/game-engine';

// Plugin definition will be implemented after GameEngine interface is created
export const TopCommentGame: GamePluginDefinition = {
  id: 'topcomment',
  name: 'Top Comment',
  // Implementation to follow
} as any;

