// @social/game-vibox
// VIBox game module (Event + 24/7 modes)

export * from './EventMode';
export * from './PatronMode';
export * from './components';
export * from './logic';
export * from './types';

import { GamePluginDefinition } from '@social/game-engine';

// Plugin definition will be implemented after GameEngine interface is created
export const VIBoxGame: GamePluginDefinition = {
  id: 'vibox',
  name: 'VIBox',
  // Implementation to follow
} as any;

