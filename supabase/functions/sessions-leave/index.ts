// Leave session and remove user from team
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface LeaveSessionRequest {
  sessionId: string;
  teamId: string;
}

Deno.serve(async (req) => {
  console.log('🔥 sessions-leave function called:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('🔥 Handling CORS preflight');
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Simple test endpoint (no auth required)
  if (req.url.includes('/health')) {
    console.log('🔥 Health check accessed');
    return new Response('OK', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth token from header
    const authHeader = req.headers.get('Authorization')
    console.log('🔥 Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader) {
      console.log('❌ No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    console.log('🔥 Auth result:', { hasUser: !!user, authError, userId: user?.id });

    if (authError || !user) {
      console.log('❌ Invalid authentication:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { sessionId, teamId } = await req.json() as LeaveSessionRequest
    console.log('🔥 Leave session request:', { sessionId, teamId, userId: user.id })

    // Remove user from team_members
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error removing user from team:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to leave team' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if team has any remaining members
    const { data: remainingMembers } = await supabase
      .from('team_members')
      .select('id, user_id, is_captain')
      .eq('team_id', teamId)

    console.log('Remaining members after leave:', { count: remainingMembers?.length || 0 })

    if (!remainingMembers || remainingMembers.length === 0) {
      // No members left - clear both captain_id and uid so team gets filtered out
      console.log('No members left, clearing captain_id and uid')
      await supabase
        .from('teams')
        .update({ 
          captain_id: null,
          uid: null  // Clear uid so team gets filtered out
        })
        .eq('id', teamId)
    } else {
      // Check if user was captain
      const { data: team } = await supabase
        .from('teams')
        .select('captain_id')
        .eq('id', teamId)
        .single()

      if (team?.captain_id === user.id) {
        console.log('Captain left but team has members, promoting new captain')
        
        // Promote first remaining member to captain
        const newCaptain = remainingMembers[0]
        
        await supabase
          .from('teams')
          .update({ 
            captain_id: newCaptain.user_id,
            uid: newCaptain.user_id  // Update uid to new captain
          })
          .eq('id', teamId)
        
        // Update team_members to mark new captain
        await supabase
          .from('team_members')
          .update({ is_captain: true })
          .eq('id', newCaptain.id)
        
        console.log('Promoted new captain:', newCaptain.user_id)
      }
    }

    console.log('Successfully left team:', { teamId, userId: user.id })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Leave session error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
