import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';
import { setCorsHeaders } from '../../lib/cors';
import type { ApiResponse } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Queue item ID is required',
    } as ApiResponse);
  }

  try {
    if (req.method === 'DELETE') {
      return await removeFromQueue(id, res);
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Queue item handler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse);
  }
}

async function removeFromQueue(id: string, res: VercelResponse) {
  const { error } = await supabase
    .from('vibox_queue')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }

  res.status(200).json({
    success: true,
    message: 'Track removed from queue',
  } as ApiResponse);
}
