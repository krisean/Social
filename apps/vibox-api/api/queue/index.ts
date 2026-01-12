import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';
import { setCorsHeaders } from '../../lib/cors';
import type { ApiResponse, ViboxQueueItem } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  try {
    if (req.method === 'GET') {
      return await getQueue(req, res);
    } else if (req.method === 'DELETE' && req.url?.includes('/clear')) {
      return await clearQueue(req, res);
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Queue handler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

async function getQueue(req: VercelRequest, res: VercelResponse) {
  const { data: queue, error } = await supabase
    .from('vibox_queue')
    .select('*')
    .eq('is_played', false)
    .order('position', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }

  res.status(200).json({
    success: true,
    data: {
      queue: queue || [],
      count: queue?.length || 0,
    },
  } as ApiResponse<{ queue: ViboxQueueItem[]; count: number }>);
}

async function clearQueue(req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabase
    .from('vibox_queue')
    .delete()
    .eq('is_played', false)
    .select('id');

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }

  res.status(200).json({
    success: true,
    data: {
      clearedCount: data?.length || 0,
    },
    message: `Cleared ${data?.length || 0} tracks from queue`,
  } as ApiResponse<{ clearedCount: number }>);
}
