import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';
import { setCorsHeaders } from '../../lib/cors';
import type { ApiResponse } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('vibox_time_analytics')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('hour', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      data: { analytics: data || [] },
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse);
  }
}
