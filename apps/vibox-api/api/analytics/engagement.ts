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
      .from('vibox_user_engagement')
      .select('*')
      .order('songs_added', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      data: { users: data || [] },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse);
  }
}
