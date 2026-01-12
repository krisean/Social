import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface UnbanTeamRequest {
  sessionId: string;
  bannedTeamId: string;
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

    const { sessionId, bannedTeamId }: UnbanTeamRequest = await req.json()

    if (!sessionId || !bannedTeamId) {
      return new Response(
        JSON.stringify({ error: "sessionId and bannedTeamId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the session exists and get the host
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

    // Verify the banned team entry exists
    const { data: bannedTeam, error: bannedError } = await supabase
      .from("banned_teams")
      .select("id, team_name")
      .eq("id", bannedTeamId)
      .eq("session_id", sessionId)
      .single()

    if (bannedError || !bannedTeam) {
      return new Response(
        JSON.stringify({ error: "Banned team not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Remove the ban
    const { error: deleteError } = await supabase
      .from("banned_teams")
      .delete()
      .eq("id", bannedTeamId)
      .eq("session_id", sessionId)

    if (deleteError) {
      console.error("Error unbanning team:", deleteError)
      return new Response(
        JSON.stringify({ error: "Failed to unban team" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log(`Team ${bannedTeam.team_name} unbanned from session ${sessionId}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Team unbanned successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Unban player error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
