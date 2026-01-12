import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';
import { setCorsHeaders } from '../../lib/cors';
import { queueInsertSchema } from '../../lib/validation';
import type { ApiResponse, ViboxQueueItem } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const validationResult = queueInsertSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        data: validationResult.error.errors,
      } as ApiResponse);
    }

    const trackData = validationResult.data;

    const { data: queueItem, error } = await supabase
      .from('vibox_queue')
      .insert(trackData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: { queueItem },
      message: 'Track added to queue',
    } as ApiResponse<{ queueItem: ViboxQueueItem }>);
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse);
  }
}
