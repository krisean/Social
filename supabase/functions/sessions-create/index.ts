// Create a new game session
import { createPublicHandler, requireString, cleanTeamName, corsResponse, getUserId } from '../_shared/utils.ts';
import { getPromptLibrary, DEFAULT_PROMPTS, GROUP_SIZE, TOTAL_ROUNDS } from '../_shared/prompts.ts';
import type { Session, Team } from '../_shared/types.ts';

/**
 * Generate shuffled bonuses for a category column (7 prompts)
 * 6 cards with point values (100-700) + 1 card with 2x multiplier
 */
function generateCategoryBonuses() {
  const pointValues = [100, 200, 300, 400, 500, 600, 700];
  const bonuses = [];
  
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

async function handleCreateSession(req: Request, supabase: any): Promise<Response> {
  const uid = await getUserId(req); // Still need auth for creating (to be host)
    const { teamName, venueName, promptLibraryId, gameMode, selectedCategories } = await req.json();
    
    const cleanedTeamName = cleanTeamName(requireString(teamName, 'teamName'));
    const cleanedVenueName = venueName ? cleanTeamName(venueName) : undefined;
    const libraryId = promptLibraryId || 'classic';
    const mode = gameMode || 'classic';
    
    // Generate unique room code
    const code = await supabase.rpc('ensure_unique_code');
    if (!code.data) {
      throw new Error('Failed to generate room code');
    }
    
    // Get prompts for this library
    const library = await getPromptLibrary(libraryId);
    const promptDeck = [...library.prompts].sort(() => Math.random() - 0.5);
    
    // Initialize category grid for jeopardy mode
    let categoryGrid = null;
    if (mode === 'jeopardy') {
      const allLibraryIds = [
        'classic', 'bar', 'basic', 'halloween', 'selfie', 'victoria',
        'dangerfield', 'medieval', 'anime', 'politics', 'scifi',
        'popculture', 'cinema', 'canucks', 'bc', 'tech',
        'internetculture', 'datingapp', 'remotework', 'adulting',
        'groupchat', 'streaming', 'climateanxiety', 'fictionalworlds'
      ];
      
      // Use host-selected categories or default to 6 (3 per card)
      const selectedCats = selectedCategories && selectedCategories.length === 6
        ? selectedCategories 
        : allLibraryIds.slice(0, 6);
      
      // Validate all selected categories exist
      const validCategories = selectedCats.filter((id: string) => allLibraryIds.includes(id));
      if (validCategories.length !== 6) {
        throw new Error('Invalid category selection: must select exactly 6 categories (3 per card)');
      }
      
      categoryGrid = {
        categories: validCategories.map((id: string) => ({
          id,
          usedPrompts: [],
          promptBonuses: generateCategoryBonuses(),
        })),
        totalSlots: 42, // 6 categories × 7 prompts (max)
        categoriesPerCard: 3, // Fixed: 3 categories per card
      };
      console.log('Creating jeopardy session with 6 categories (3 per card) and shuffled bonuses:', categoryGrid);
    } else {
      console.log('Creating classic session, no category grid');
    }
    
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        code: code.data,
        host_uid: uid,
        status: 'lobby',
        round_index: 0,
        rounds: [],
        prompt_deck: promptDeck,
        prompt_cursor: 0,
        prompt_library_id: libraryId,
        category_grid: categoryGrid,
        settings: {
          answerSecs: 90,
          voteSecs: 90,
          resultsSecs: 12,
          maxTeams: 24,
          gameMode: mode,
          categorySelectSecs: 15,
          selectedCategories: mode === 'jeopardy' && categoryGrid ? categoryGrid.categories.map((c: { id: string; usedPrompts: number[] }) => c.id) : undefined,
        },
        venue_name: cleanedVenueName,
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    // Create analytics record
    await supabase
      .from('session_analytics')
      .insert({ session_id: session.id });
    
    return corsResponse({
      sessionId: session.id,
      code: session.code,
      session: session as Session,
    });
  }

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
Deno.serve(createPublicHandler(handleCreateSession));