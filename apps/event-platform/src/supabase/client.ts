import { createClient } from '@supabase/supabase-js';
import type { Database } from '@social/db';

const fallbackUrl = 'http://localhost:54321';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;



export const isPreviewMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isPreviewMode) {
  console.warn(
    'Supabase configuration not found. Running in preview mode with local credentials. Backend calls may fail until real config is provided.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function ensureAnonymousAuth() {
  if (isPreviewMode) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Failed to sign in anonymously:', error);
    return null;
  }
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  if (isPreviewMode) {
    throw new Error('Authentication not available in preview mode');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function createUserWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  if (isPreviewMode) {
    throw new Error('Authentication not available in preview mode');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (isPreviewMode) {
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signInAnonymouslyUser() {
  if (isPreviewMode) {
    return null;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Failed to sign in anonymously:', error);
    return null;
  }
  return data.user;
}


