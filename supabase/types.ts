// Auto-generated types from Supabase schema
// This file will be regenerated when running: supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string
          name: string
          slug: string
          owner_email: string | null
          subscription_status: string
          trial_ends_at: string | null
          qr_code_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_email?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_email?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      venue_stats: {
        Row: {
          id: string
          venue_id: string
          date: string
          total_scans: number
          total_revenue: number
          total_songs: number
          created_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          date: string
          total_scans?: number
          total_revenue?: number
          total_songs?: number
          created_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          date?: string
          total_scans?: number
          total_revenue?: number
          total_songs?: number
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          venue_id: string | null
          game_id: string
          mode: string
          host_id: string | null
          phase_id: string
          phase_data: Json
          settings: Json
          state: Json
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id?: string | null
          game_id: string
          mode: string
          host_id?: string | null
          phase_id?: string
          phase_data?: Json
          settings?: Json
          state?: Json
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string | null
          game_id?: string
          mode?: string
          host_id?: string | null
          phase_id?: string
          phase_data?: Json
          settings?: Json
          state?: Json
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          session_id: string
          user_id: string
          display_name: string
          team_name: string | null
          avatar_url: string | null
          score: number
          is_active: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          display_name: string
          team_name?: string | null
          avatar_url?: string | null
          score?: number
          is_active?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          display_name?: string
          team_name?: string | null
          avatar_url?: string | null
          score?: number
          is_active?: boolean
          joined_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          session_id: string
          player_id: string
          round_number: number | null
          content: string
          metadata: Json
          vote_count: number
          is_winner: boolean
          is_moderated: boolean
          moderation_result: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          round_number?: number | null
          content: string
          metadata?: Json
          vote_count?: number
          is_winner?: boolean
          is_moderated?: boolean
          moderation_result?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          round_number?: number | null
          content?: string
          metadata?: Json
          vote_count?: number
          is_winner?: boolean
          is_moderated?: boolean
          moderation_result?: Json | null
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          session_id: string
          submission_id: string
          voter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          submission_id: string
          voter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          submission_id?: string
          voter_id?: string
          created_at?: string
        }
      }
      event_rounds: {
        Row: {
          id: string
          session_id: string
          round_number: number
          game_id: string
          duration_seconds: number | null
          settings: Json
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          round_number: number
          game_id: string
          duration_seconds?: number | null
          settings?: Json
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          round_number?: number
          game_id?: string
          duration_seconds?: number | null
          settings?: Json
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

