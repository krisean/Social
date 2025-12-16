/**
 * Games Registry
 * Initialize and register all available games
 */

import { GameRegistry } from "../engine/GameRegistry";
import { TopCommentEventGame } from "./topComment/TopCommentEventGame";
import { TopCommentSoloGame } from "./topComment/TopCommentSoloGame";

// Register all games
export function initializeGames(): void {
  GameRegistry.register(new TopCommentEventGame());
  GameRegistry.register(new TopCommentSoloGame());
}

