import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface JoinSessionRequest {
  code: string;
  teamName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method)
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { code, teamName }: JoinSessionRequest = await req.json()
    console.log("Join request received:", { code, teamName })

    if (!code || !teamName) {
      console.error("Missing required fields:", { code, teamName })
      return new Response(
        JSON.stringify({ error: "code and teamName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Normalize inputs
    const normalizedCode = code.trim().toUpperCase()
    const normalizedTeamName = teamName.trim()

    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization')
    let userId = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id
    }
    
    console.log("User ID from auth:", userId)

    // Find the session by code
    console.log("Looking for session with code:", normalizedCode)
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, code, status, settings")
      .eq("code", normalizedCode)
      .single()

    if (sessionError || !session) {
      console.error("Session not found:", sessionError)
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("Session found:", { id: session.id, status: session.status })

    // Check if session is still joinable (lobby or waiting status)
    if (session.status !== "waiting" && session.status !== "lobby") {
      console.error("Session not in joinable status:", session.status)
      return new Response(
        JSON.stringify({ error: "Session is not accepting new teams" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check if session is full
    console.log("Checking existing teams...")
    const { data: existingTeams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("session_id", session.id)

    if (teamsError) {
      console.error("Error checking existing teams:", teamsError)
      return new Response(
        JSON.stringify({ error: "Failed to check session capacity" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("Existing teams count:", existingTeams?.length || 0)

    const maxTeams = session.settings?.maxTeams || 10
    if (existingTeams && existingTeams.length >= maxTeams) {
      console.error("Session is full:", existingTeams.length, ">=", maxTeams)
      return new Response(
        JSON.stringify({ error: "Session is full" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check for duplicate team name in this session
    console.log("Checking for duplicate team name...")
    const { data: duplicateTeam, error: duplicateError } = await supabase
      .from("teams")
      .select("id")
      .eq("session_id", session.id)
      .eq("team_name", normalizedTeamName)
      .single()

    console.log("Duplicate check result:", { duplicateTeam, duplicateError })

    if (duplicateTeam) {
      console.error("Duplicate team name found")
      return new Response(
        JSON.stringify({ 
          error: "That team name is already taken. Try another one.",
          code: "functions/already-exists"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check if this team name is banned from this session
    // We need to check by team name since we don't have a team_id yet
    try {
      const { data: bannedTeams, error: bannedError } = await supabase
        .from("banned_teams" as any)
        .select("id, team_name")
        .eq("session_id", session.id)
        .eq("team_name", normalizedTeamName)

      // Only block if we successfully got data and found a ban
      if (!bannedError && bannedTeams && bannedTeams.length > 0) {
        return new Response(
          JSON.stringify({ error: "You were banned from this session and cannot rejoin." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      
      // Log errors but don't block join
      if (bannedError) {
        console.log("Banned check error (table might not exist yet):", bannedError)
      }
    } catch (banCheckError) {
      console.log("Ban check failed, continuing join:", banCheckError)
    }

    // Create the new team
    console.log("Creating team with userId:", userId)
    
    if (!userId) {
      console.error("No user ID available")
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // Assign a random mascot (IDs 1-6)
    const randomMascotId = Math.floor(Math.random() * 6) + 1
    console.log("Assigning mascot ID:", randomMascotId)
    
    const { data: newTeam, error: createError } = await supabase
      .from("teams")
      .insert({
        session_id: session.id,
        team_name: normalizedTeamName,
        uid: userId,
        mascot_id: randomMascotId
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating team:", createError)
      return new Response(
        JSON.stringify({ error: "Failed to join session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log(`Team ${normalizedTeamName} joined session ${session.id}`)

    // Return format matching frontend expectations
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        session: {
          id: session.id,
          code: session.code,
          status: session.status,
          settings: session.settings
        },
        team: {
          id: newTeam.id,
          teamName: normalizedTeamName,
          uid: newTeam.uid || null
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Join session error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
