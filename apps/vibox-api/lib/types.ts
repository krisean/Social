export interface ViboxQueueItem {
  id: string;
  track_id: string;
  track_title: string;
  track_artist: string;
  track_url: string;
  track_genre: string | null;
  track_duration: number | null;
  primary_vibe: string | null;
  secondary_vibe: string | null;
  position: number | null;
  is_played: boolean;
  played_at: string | null;
  added_by: string;
  added_by_user_id: string | null;
  added_at: string;
  device_type: string | null;
  user_agent: string | null;
  ip_address: string | null;
  session_id: string | null;
  time_in_queue: number | null;
  skip_count: number;
  was_skipped: boolean;
  play_duration: number | null;
  completion_percentage: number | null;
  queue_length_when_added: number | null;
  time_of_day: string | null;
  day_of_week: number | null;
  created_at: string;
  updated_at: string;
}

export interface ViboxQueueInsert {
  track_id: string;
  track_title: string;
  track_artist: string;
  track_url: string;
  track_genre?: string;
  track_duration?: number;
  primary_vibe?: string;
  secondary_vibe?: string;
  added_by: string;
  added_by_user_id?: string;
  device_type?: string;
  user_agent?: string;
  session_id?: string;
  team_uid?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
