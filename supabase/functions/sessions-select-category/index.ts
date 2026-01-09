// Handle category selection for jeopardy mode
import { createPublicHandler, corsResponse, getUserId } from '../_shared/utils.ts';
import { getPromptLibrary } from '../_shared/prompts.ts';

async function handleSelectCategory(req: Request, supabase: any): Promise<Response> {
  const uid = await getUserId(req);
  const { sessionId, groupId, categoryId } = await req.json();

  // Validate inputs
  if (!sessionId || !groupId || !categoryId) {
    throw new Error('Missing required fields: sessionId, groupId, categoryId');
  }

  // Get current session
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) {
    throw new Error('Session not found');
  }

  // Validate session is in category-select phase
  if (session.status !== 'category-select') {
    throw new Error('Session is not in category selection phase');
  }

  // Validate category is available
  const categoryGrid = session.category_grid;
  if (!categoryGrid || !categoryGrid.available.includes(categoryId)) {
    throw new Error('Category not available');
  }

  // Update category grid
  const updatedGrid = {
    ...categoryGrid,
    available: categoryGrid.available.filter((id: string) => id !== categoryId),
    used: [...categoryGrid.used, categoryId],
  };

  // Update round group with selected category
  const currentRoundIndex = session.round_index ?? 0;
  const rounds = session.rounds || [];
  const updatedRounds = rounds.map((round: any, idx: number) => {
    if (idx !== currentRoundIndex) return round;
    
    return {
      ...round,
      groups: round.groups.map((group: any) =>
        group.id === groupId
          ? { ...group, promptLibraryId: categoryId }
          : group
      ),
    };
  });

  // Update session
  const { data: updatedSession, error: updateError } = await supabase
    .from('sessions')
    .update({
      category_grid: updatedGrid,
      rounds: updatedRounds,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateError) {
    console.error('Update error:', updateError);
    throw new Error('Failed to update session');
  }

  return corsResponse({ session: updatedSession });
}

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
Deno.serve(createPublicHandler(handleSelectCategory));
