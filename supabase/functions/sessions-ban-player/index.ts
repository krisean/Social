import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface BanTeamRequest {
  sessionId: string;
  teamId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { sessionId, teamId }: BanTeamRequest = await req.json()

    if (!sessionId || !teamId) {
      return new Response(
        JSON.stringify({ error: "sessionId and teamId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, verify the session exists and get the host
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("host_uid")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verify the team exists in this session
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, team_name")
      .eq("id", teamId)
      .eq("session_id", sessionId)
      .single()

    if (teamError || !team) {
      return new Response(
        JSON.stringify({ error: "Team not found in session" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check if team is already banned
    const { data: existingBan } = await supabase
      .from("banned_teams")
      .select("id")
      .eq("session_id", sessionId)
      .eq("team_id", teamId)
      .single()

    if (existingBan) {
      return new Response(
        JSON.stringify({ error: "Team is already banned from this session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Perform the ban in a transaction
    // 1. Delete the team from the session
    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId)
      .eq("session_id", sessionId)

    if (deleteError) {
      console.error("Error deleting team during ban:", deleteError)
      return new Response(
        JSON.stringify({ error: "Failed to remove team from session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 2. Add the team to banned_teams table
    const { error: banError } = await supabase
      .from("banned_teams")
      .insert({
        session_id: sessionId,
        team_id: teamId,
        team_name: team.team_name,
        banned_by: session.host_uid,
        reason: "Banned by host"
      })

    if (banError) {
      console.error("Error adding team to banned list:", banError)
      // Note: Team was already deleted, but we couldn't record the ban
      // This is a partial failure state
      return new Response(
        JSON.stringify({ error: "Team was removed but ban could not be recorded" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log(`Team ${team.team_name} (${teamId}) banned from session ${sessionId}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Team banned successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Ban player error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
