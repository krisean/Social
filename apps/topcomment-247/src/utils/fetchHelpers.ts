// Helper functions for direct Supabase REST API calls
import { supabase } from '../supabase/client';

const SUPABASE_URL = 'https://dtudipmqfrknkrsahlst.supabase.co';
const ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Cache the session token to avoid async lookups
let cachedToken: string | null = null;

// Initialize session token cache
supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token || null;
});

// Try to get initial session token (non-blocking)
supabase.auth.getSession().then(({ data: { session } }) => {
  cachedToken = session?.access_token || null;
}).catch(err => {
  console.error('[fetchHelpers] Failed to get initial session:', err);
});

/**
 * Get authorization headers with current session token or anon key
 */
export function getAuthHeaders(): HeadersInit {
  const token = cachedToken || ANON_KEY;
  
  return {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Make a GET request to Supabase REST API
 */
export async function supabaseFetch(path: string): Promise<any> {
  const headers = getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}${path}`, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[supabaseFetch] Error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * Make a POST request to Supabase REST API
 */
export async function supabasePost(path: string, body: any, returnRepresentation = true): Promise<any> {
  const headers = getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': returnRepresentation ? 'return=representation' : 'return=minimal'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return returnRepresentation ? response.json() : null;
}

/**
 * Make a DELETE request to Supabase REST API
 */
export async function supabaseDelete(path: string): Promise<void> {
  const headers = getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'DELETE',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
