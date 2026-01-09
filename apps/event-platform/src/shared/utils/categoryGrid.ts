import type { PromptLibraryId } from "../promptLibraries";

export interface CategoryGrid {
  available: PromptLibraryId[];
  used: PromptLibraryId[];
  totalSlots: number;
}

/**
 * Initialize category grid for jeopardy mode
 * @param availableLibraries - All available prompt library IDs
 * @param estimatedRounds - Expected number of rounds
 * @param groupsPerRound - Number of groups per round
 */
export function initializeCategoryGrid(
  availableLibraries: PromptLibraryId[],
  estimatedRounds: number,
  groupsPerRound: number
): CategoryGrid {
  const totalSlots = estimatedRounds * groupsPerRound;
  
  return {
    available: [...availableLibraries],
    used: [],
    totalSlots,
  };
}

/**
 * Mark a category as used and remove from available
 */
export function markCategoryUsed(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): CategoryGrid {
  if (!grid.available.includes(categoryId)) {
    return grid; // Already used or doesn't exist
  }
  
  return {
    ...grid,
    available: grid.available.filter(id => id !== categoryId),
    used: [...grid.used, categoryId],
  };
}

/**
 * Check if a category is available for selection
 */
export function isCategoryAvailable(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): boolean {
  return grid.available.includes(categoryId);
}

/**
 * Get count of remaining categories
 */
export function getRemainingCategories(grid: CategoryGrid): number {
  return grid.available.length;
}

/**
 * Check if grid has enough categories for next round
 */
export function hasEnoughCategories(
  grid: CategoryGrid,
  groupsNeeded: number
): boolean {
  return grid.available.length >= groupsNeeded;
}
