import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import { setCorsHeaders } from '../lib/cors';
import type { ApiResponse } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { count, error } = await supabase
      .from('vibox_queue')
      .select('*', { count: 'exact', head: true });

    const health = {
      status: error ? 'unhealthy' : 'healthy',
      database: error ? 'error' : 'connected',
      timestamp: new Date().toISOString(),
      queueCount: count || 0,
    };

    const statusCode = error ? 503 : 200;

    res.status(statusCode).json({
      success: !error,
      data: health,
    } as ApiResponse<typeof health>);
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      data: {
        status: 'unhealthy',
        database: 'error',
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse);
  }
}
