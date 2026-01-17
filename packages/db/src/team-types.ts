// Team Codes & Answer Captain System Types
// Add these to your Database type definition

export interface TeamCode {
  id: string;
  code: string;
  session_id: string;
  team_id: string | null;
  created_at: string;
  assigned_at: string | null;
  is_used: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  device_id: string;
  joined_at: string;
  last_active: string;
  is_captain: boolean;
}

// Extended Team type with new fields
export interface TeamWithCaptain {
  id: string;
  session_id: string;
  team_name: string;
  team_code: string | null;
  captain_id: string | null;
  uid: string;
  mascot_id: number;
  created_at: string;
  score: number;
}
