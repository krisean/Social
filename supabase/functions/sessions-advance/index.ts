// Advance session to next phase
import { createHandler, requireString, corsResponse, getSession, AppError } from '../_shared/utils.ts';
import type { Session } from '../_shared/types.ts';

async function handleAdvanceSession(req: Request, uid: string, supabase: any): Promise<Response> {
  const { sessionId } = await req.json();

  requireString(sessionId, 'sessionId');

  // Get session
  const session = await getSession(supabase, sessionId);
    
    // Verify host
    if (session.host_uid !== uid) {
      throw new AppError(403, 'Only the host can advance the game', 'permission-denied');
    }

    // Check if session is paused
    if (session.paused) {
      throw new AppError(400, 'Cannot advance while session is paused', 'failed-precondition');
    }
    
    const currentStatus = session.status;
    const roundIndex = session.round_index || 0;
    const rounds = session.rounds || [];
    const currentRound = rounds[roundIndex];
    const settings = session.settings || {};
    
    let nextStatus = currentStatus;
    let nextRoundIndex = roundIndex;
    let voteGroupIndex = session.vote_group_index;
    let endsAt: string | null = null;
    
    console.log('Advance session called:', { sessionId, currentStatus, roundIndex });
    
    // State machine for phase transitions
    switch (currentStatus) {
      case 'category-select': {
        console.log('Processing category-select phase');
        // Jeopardy mode: transition from category selection to answer phase
        const { getPromptLibrary } = await import('../_shared/prompts.ts');
        
        // Auto-select categories for groups that didn't choose
        const groups = currentRound?.groups || [];
        console.log('Groups before processing:', groups.length, groups.map((g: any) => ({ id: g.id, hasCategory: !!g.promptLibraryId })));
        const updatedGroups = await Promise.all(groups.map(async (group: any) => {
          let categoryId = group.promptLibraryId;
          
          // Auto-select if no category chosen
          if (!categoryId && session.category_grid?.available?.length > 0) {
            categoryId = session.category_grid.available[0];
          }
          
          // Get a prompt from the selected category
          if (categoryId) {
            try {
              const library = await getPromptLibrary(categoryId);
              const randomPrompt = library.prompts[Math.floor(Math.random() * library.prompts.length)];
              return { 
                ...group, 
                promptLibraryId: categoryId,
                prompt: randomPrompt 
              };
            } catch (error) {
              console.error(`Failed to load library ${categoryId}:`, error);
              // Fallback to existing prompt
              return { ...group, promptLibraryId: categoryId };
            }
          }
          
          return group;
        }));
        
        console.log('Groups after processing:', updatedGroups.map((g: any) => ({ id: g.id, category: g.promptLibraryId, hasPrompt: !!g.prompt })));
        
        // Update rounds with prompts
        const updatedRounds = [...rounds];
        updatedRounds[roundIndex] = {
          ...currentRound,
          groups: updatedGroups,
        };
        
        console.log('Updating session to answer phase');
        
        // Update session to answer phase
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            status: 'answer',
            rounds: updatedRounds,
            ends_at: new Date(Date.now() + (settings.answerSecs || 90) * 1000).toISOString(),
          })
          .eq('id', sessionId);
        
        if (updateError) {
          console.error('Error updating session:', updateError);
          throw updateError;
        }
        
        console.log('Session updated successfully');
        
        const { data: updatedSession } = await supabase
          .from('sessions')
          .select()
          .eq('id', sessionId)
          .single();
        
        return corsResponse({ session: updatedSession as Session });
      }
      
      case 'answer':
        // Move to vote phase
        nextStatus = 'vote';
        voteGroupIndex = 0;
        endsAt = new Date(Date.now() + (settings.voteSecs || 90) * 1000).toISOString();
        break;
        
      case 'vote': {
        // Check if there are more groups to vote on
        const groups = currentRound?.groups || [];
        const nextGroupIndex = (voteGroupIndex || 0) + 1;
        
        if (nextGroupIndex < groups.length) {
          // Vote on next group
          voteGroupIndex = nextGroupIndex;
          endsAt = new Date(Date.now() + (settings.voteSecs || 90) * 1000).toISOString();
        } else {
          // Move to results
          nextStatus = 'results';
          voteGroupIndex = null;
          endsAt = new Date(Date.now() + (settings.resultsSecs || 12) * 1000).toISOString();
          
          // Calculate scores for this round
          await calculateRoundScores(supabase, sessionId, roundIndex);
        }
        break;
      }
        
      case 'results': {
        // Check if there are more rounds
        if (roundIndex + 1 < rounds.length) {
          // Next round
          const isJeopardyMode = settings.gameMode === 'jeopardy';
          
          if (isJeopardyMode) {
            // Jeopardy mode: go to category selection
            // Select random team for each group in the next round
            const nextRound = rounds[roundIndex + 1];
            if (nextRound && nextRound.groups) {
              const updatedRounds = [...rounds];
              updatedRounds[roundIndex + 1] = {
                ...nextRound,
                groups: nextRound.groups.map((group: any) => ({
                  ...group,
                  selectingTeamId: group.teamIds[Math.floor(Math.random() * group.teamIds.length)],
                })),
              };
              
              // Update rounds in database
              await supabase
                .from('sessions')
                .update({ rounds: updatedRounds })
                .eq('id', sessionId);
            }
            
            nextStatus = 'category-select';
            nextRoundIndex = roundIndex + 1;
            voteGroupIndex = null;
            endsAt = new Date(Date.now() + (settings.categorySelectSecs || 15) * 1000).toISOString();
          } else {
            // Classic mode: go straight to answer
            nextStatus = 'answer';
            nextRoundIndex = roundIndex + 1;
            voteGroupIndex = null;
            endsAt = new Date(Date.now() + (settings.answerSecs || 90) * 1000).toISOString();
          }
        } else {
          // Game over
          nextStatus = 'ended';
          voteGroupIndex = null;
          endsAt = null;
        }
        break;
      }
        
      default:
        throw new AppError(400, 'Cannot advance from current phase', 'failed-precondition');
    }
    
    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        status: nextStatus,
        round_index: nextRoundIndex,
        vote_group_index: voteGroupIndex,
        ends_at: endsAt,
        ended_at: nextStatus === 'ended' ? new Date().toISOString() : null,
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
  return corsResponse({ session: updatedSession as Session });
}

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
Deno.serve(createHandler(handleAdvanceSession));

async function calculateRoundScores(supabase: any, sessionId: string, roundIndex: number) {
  // Get session to access round groups and bonuses
  const { data: session } = await supabase
    .from('sessions')
    .select('rounds')
    .eq('id', sessionId)
    .single();
  
  const currentRound = session?.rounds?.[roundIndex];
  const groups = currentRound?.groups || [];
  
  // Get all votes and answers for this round
  const { data: votes } = await supabase
    .from('votes')
    .select('answer_id, answers!inner(team_id, group_id)')
    .eq('session_id', sessionId)
    .eq('round_index', roundIndex);
  
  if (!votes || votes.length === 0) return;
  
  // Count votes per team and track which group each team belongs to
  const votesByTeam = new Map<string, { voteCount: number; groupId: string }>();
  
  for (const vote of votes) {
    const teamId = vote.answers?.team_id;
    const groupId = vote.answers?.group_id;
    if (teamId && groupId) {
      const existing = votesByTeam.get(teamId);
      votesByTeam.set(teamId, {
        voteCount: (existing?.voteCount || 0) + 1,
        groupId: groupId
      });
    }
  }
  
  // Update team scores with base voting points + bonuses
  for (const [teamId, data] of votesByTeam.entries()) {
    const { voteCount, groupId } = data;
    
    // Find the group this team belongs to
    const group = groups.find((g: any) => g.id === groupId);
    const bonus = group?.selectedBonus;
    
    let totalScore = voteCount; // Base score from votes
    
    // Apply bonus if this team won their group's vote
    if (bonus) {
      // Check if this team is the winner of their group (has most votes)
      const groupTeamVotes = Array.from(votesByTeam.entries())
        .filter(([_, d]) => d.groupId === groupId)
        .map(([tid, d]) => ({ teamId: tid, votes: d.voteCount }));
      
      const maxVotes = Math.max(...groupTeamVotes.map(t => t.votes));
      const isWinner = voteCount === maxVotes;
      
      if (isWinner) {
        if (bonus.bonusType === 'points') {
          // Add flat points
          totalScore += bonus.bonusValue;
          console.log(`Team ${teamId} won with ${voteCount} votes and earned ${bonus.bonusValue} bonus points`);
        } else if (bonus.bonusType === 'multiplier') {
          // Apply multiplier to voting score
          totalScore = voteCount * bonus.bonusValue;
          console.log(`Team ${teamId} won with ${voteCount} votes and earned ${bonus.bonusValue}x multiplier (${totalScore} total)`);
        }
      }
    }
    
    // Update team score
    await supabase.rpc('increment_team_score', {
      team_id: teamId,
      score_delta: totalScore,
    });
  }
}


