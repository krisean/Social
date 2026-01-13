import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../lib/supabase';
import { setCorsHeaders } from '../../../lib/cors';
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
    const { data: queueItem, error } = await supabase
      .from('vibox_queue')
      .update({
        skip_count: supabase.rpc('increment', { x: 1 }),
        was_skipped: true,
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

    return res.status(200).json({
      success: true,
      data: { queueItem },
      message: 'Track skipped',
    } as ApiResponse<{ queueItem: ViboxQueueItem }>);
  } catch (error) {
    console.error('Skip track error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse);
  }
}
