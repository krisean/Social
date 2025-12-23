// Shared utilities for Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );
}

export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export function getUserId(req: Request): string {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new AppError(401, 'Authentication required', 'unauthenticated');
  }
  
  // Extract JWT and decode (simplified - in production, validate properly)
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.sub) {
      throw new AppError(401, 'Invalid token', 'unauthenticated');
    }
    return payload.sub;
  } catch {
    throw new AppError(401, 'Invalid token', 'unauthenticated');
  }
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, `${field} is required`, 'invalid-argument');
  }
  return value.trim();
}

export function cleanTeamName(name: string): string {
  return name.trim().slice(0, 50);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function corsResponse(
  data: unknown,
  status = 200
): Promise<Response> {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

export async function handleError(error: unknown): Promise<Response> {
  console.error('Function error:', error);
  
  if (error instanceof AppError) {
    return corsResponse(
      { error: error.message, code: error.code },
      error.statusCode
    );
  }
  
  return corsResponse(
    { error: 'Internal server error' },
    500
  );
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }
  return null;
}


