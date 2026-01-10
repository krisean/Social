import type { PromptLibraryId } from "../promptLibraries";

export interface PromptBonus {
  promptIndex: number;        // 0-6
  bonusType: 'points' | 'multiplier';
  bonusValue: number;         // 100-700 for points, 2 for multiplier
  revealed: boolean;          // true once selected
}

export interface CategoryGrid {
  categories: Array<{
    id: PromptLibraryId;
    usedPrompts: number[];
    promptBonuses: PromptBonus[];
  }>;
  totalSlots: number;
  categoriesPerCard?: number; // Fixed: 3 categories per card
  promptsPerCategory?: number; // Dynamic: calculated based on numGroups × TOTAL_ROUNDS
  lockedTiles?: Array<{
    categoryId: PromptLibraryId;
    promptIndex: number;
  }>;
}

/**
 * Generate shuffled bonuses for a category column (7 prompts)
 * 6 cards with point values (100-700) + 1 card with 2x multiplier
 */
export function generateCategoryBonuses(): PromptBonus[] {
  const pointValues = [100, 200, 300, 400, 500, 600, 700];
  const bonuses: PromptBonus[] = [];
  
  // Add 6 point cards
  for (let i = 0; i < 6; i++) {
    bonuses.push({
      promptIndex: i,
      bonusType: 'points',
      bonusValue: pointValues[i],
      revealed: false
    });
  }
  
  // Add 1 multiplier card
  bonuses.push({
    promptIndex: 6,
    bonusType: 'multiplier',
    bonusValue: 2,
    revealed: false
  });
  
  // Shuffle array using Fisher-Yates algorithm
  for (let i = bonuses.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bonuses[i], bonuses[j]] = [bonuses[j], bonuses[i]];
  }
  
  // Reassign promptIndex after shuffle
  return bonuses.map((bonus, index) => ({ ...bonus, promptIndex: index }));
}

/**
 * Initialize category grid for jeopardy mode with 6 categories (2 cards of 3)
 * @param selectedCategories - 6 selected prompt library IDs
 */
export function initializeCategoryGrid(
  selectedCategories: PromptLibraryId[]
): CategoryGrid {
  if (selectedCategories.length !== 6) {
    throw new Error('Must select exactly 6 categories (2 cards of 3)');
  }
  
  return {
    categories: selectedCategories.map(id => ({
      id,
      usedPrompts: [],
      promptBonuses: generateCategoryBonuses(),
    })),
    totalSlots: 42, // 6 categories × 7 prompts
  };
}

/**
 * Mark a prompt as used in a category
 */
export function markPromptUsed(
  grid: CategoryGrid,
  categoryId: PromptLibraryId,
  promptIndex: number
): CategoryGrid {
  return {
    ...grid,
    categories: grid.categories.map(cat => 
      cat.id === categoryId
        ? { ...cat, usedPrompts: [...cat.usedPrompts, promptIndex] }
        : cat
    ),
  };
}

/**
 * Check if a category has available prompts
 */
export function isCategoryAvailable(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): boolean {
  const category = grid.categories.find(c => c.id === categoryId);
  const maxPrompts = grid.promptsPerCategory || 7; // Default to 7 for legacy sessions
  return category ? category.usedPrompts.length < maxPrompts : false;
}

/**
 * Get count of remaining prompts in a category
 */
export function getRemainingPrompts(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): number {
  const category = grid.categories.find(c => c.id === categoryId);
  const maxPrompts = grid.promptsPerCategory || 7; // Default to 7 for legacy sessions
  return category ? maxPrompts - category.usedPrompts.length : 0;
}

/**
 * Get total remaining prompts across all categories
 */
export function getTotalRemainingPrompts(grid: CategoryGrid): number {
  const maxPrompts = grid.promptsPerCategory || 7; // Default to 7 for legacy sessions
  return grid.categories.reduce((sum, cat) => 
    sum + (maxPrompts - cat.usedPrompts.length), 0
  );
}

/**
 * Get remaining prompts for a specific card
 */
export function getCardRemainingPrompts(grid: CategoryGrid, cardNumber: 1 | 2): number {
  const cardCategories = getCardCategories(grid, cardNumber);
  const maxPrompts = grid.promptsPerCategory || 7; // Default to 7 for legacy sessions
  return cardCategories.reduce((sum, cat) => 
    sum + (maxPrompts - cat.usedPrompts.length), 0
  );
}

/**
 * Check if a specific prompt is locked
 */
export function isPromptLocked(
  grid: CategoryGrid,
  categoryId: PromptLibraryId,
  promptIndex: number
): boolean {
  if (!grid.lockedTiles) return false;
  return grid.lockedTiles.some(
    tile => tile.categoryId === categoryId && tile.promptIndex === promptIndex
  );
}

/**
 * Get available prompt indices for a category (excluding locked tiles)
 */
export function getAvailablePromptIndices(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): number[] {
  const category = grid.categories.find(c => c.id === categoryId);
  if (!category) return [];
  
  const maxPrompts = grid.promptsPerCategory || 7; // Default to 7 for legacy sessions
  const allIndices = Array.from({ length: maxPrompts }, (_, i) => i);
  return allIndices.filter(i => 
    !category.usedPrompts.includes(i) && !isPromptLocked(grid, categoryId, i)
  );
}

/**
 * Get which card (1 or 2) should be displayed based on Card 1 completion
 * Card 2 appears when 2+ categories in Card 1 are exhausted
 */
export function getActiveCard(grid: CategoryGrid): 1 | 2 {
  const categoriesPerCard = grid.categoriesPerCard || 3; // Default to 3 for legacy sessions
  const maxPrompts = grid.promptsPerCategory || 7; // Default to 7 for legacy sessions
  const card1Categories = grid.categories.slice(0, categoriesPerCard);
  const exhaustedInCard1 = card1Categories.filter(cat => cat.usedPrompts.length >= maxPrompts).length;
  
  // Switch to Card 2 when 2 or more categories in Card 1 are exhausted
  return exhaustedInCard1 >= 2 ? 2 : 1;
}

/**
 * Get categories for a specific card (1 or 2)
 */
export function getCardCategories(grid: CategoryGrid, cardNumber: 1 | 2) {
  const categoriesPerCard = grid.categoriesPerCard || 3; // Default to 3 for legacy sessions
  const startIndex = cardNumber === 1 ? 0 : categoriesPerCard;
  const endIndex = cardNumber === 1 ? categoriesPerCard : categoriesPerCard * 2;
  return grid.categories.slice(startIndex, endIndex);
}

/**
 * Get the bonus for a specific prompt
 */
export function getPromptBonus(
  grid: CategoryGrid,
  categoryId: PromptLibraryId,
  promptIndex: number
): PromptBonus | undefined {
  const category = grid.categories.find(c => c.id === categoryId);
  if (!category?.promptBonuses) return undefined;
  return category.promptBonuses.find(b => b.promptIndex === promptIndex);
}

/**
 * Get all revealed bonuses for a category
 */
export function getRevealedBonuses(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): PromptBonus[] {
  const category = grid.categories.find(c => c.id === categoryId);
  if (!category?.promptBonuses) return [];
  return category.promptBonuses.filter(b => b.revealed);
}

/**
 * Get remaining bonus range for strategic decision making
 */
export function getRemainingBonusRange(
  grid: CategoryGrid,
  categoryId: PromptLibraryId
): { min: number; max: number; hasMultiplier: boolean } {
  const category = grid.categories.find(c => c.id === categoryId);
  if (!category?.promptBonuses) {
    return { min: 0, max: 0, hasMultiplier: false };
  }
  
  const unrevealed = category.promptBonuses.filter(b => !b.revealed);
  const pointBonuses = unrevealed.filter(b => b.bonusType === 'points');
  
  if (pointBonuses.length === 0) {
    return { min: 0, max: 0, hasMultiplier: unrevealed.some(b => b.bonusType === 'multiplier') };
  }
  
  return {
    min: Math.min(...pointBonuses.map(b => b.bonusValue)),
    max: Math.max(...pointBonuses.map(b => b.bonusValue)),
    hasMultiplier: unrevealed.some(b => b.bonusType === 'multiplier')
  };
}
