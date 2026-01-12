import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../lib/supabase';
import { setCorsHeaders } from '../../../lib/cors';
import { markPlayedSchema } from '../../../lib/validation';
import type { ApiResponse, ViboxQueueItem } from '../../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Queue item ID is required',
    } as ApiResponse);
  }

  try {
    const validationResult = markPlayedSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        data: validationResult.error.errors,
      } as ApiResponse);
    }

    const { play_duration, completion_percentage, was_skipped } = validationResult.data;

    const { data: queueItem, error } = await supabase
      .from('vibox_queue')
      .update({
        is_played: true,
        played_at: new Date().toISOString(),
        play_duration,
        completion_percentage,
        was_skipped: was_skipped || false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      data: { queueItem },
      message: 'Track marked as played',
    } as ApiResponse<{ queueItem: ViboxQueueItem }>);
  } catch (error) {
    console.error('Mark played error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse);
  }
}
