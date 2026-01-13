import { z } from 'zod';

export const queueInsertSchema = z.object({
  track_id: z.string().min(1),
  track_title: z.string().min(1),
  track_artist: z.string().min(1),
  track_url: z.string().url(),
  track_genre: z.string().optional(),
  track_duration: z.number().positive().optional(),
  primary_vibe: z.string().optional(),
  secondary_vibe: z.string().optional(),
  added_by: z.string().min(1),
  added_by_user_id: z.string().uuid().optional(),
  device_type: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  team_uid: z.string().optional(),
});

export const markPlayedSchema = z.object({
  play_duration: z.number().positive().optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  was_skipped: z.boolean().optional(),
});
