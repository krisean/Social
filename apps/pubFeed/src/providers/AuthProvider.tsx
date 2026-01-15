// Authentication Provider with full auth + anonymous mode

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { supabase } from '../supabase/client';
import { supabaseFetch, supabasePost, supabaseDelete } from '../utils/fetchHelpers';
import { AuthContext } from './AuthContext';
import type { FeedUser } from '../types';
import type { User } from '@supabase/supabase-js';
import { generateAnonymousUsername } from '@social/utils';

// Configuration for anonymous user lifespan
const ANONYMOUS_LIFESPAN_HOURS = 24;

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FeedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  // Load or create feed_user record for a Supabase auth user
  const loadFeedUser = useCallback(async (authUser: User): Promise<FeedUser | null> => {
    try {
      // For anonymous users, check if one already exists or create new
      if (authUser.is_anonymous) {
        // First check if anonymous user already exists for this auth user
        try {
          const fetchData = await supabaseFetch(
            `/rest/v1/users?auth_user_id=eq.${authUser.id}`
          );
          const existingUser = fetchData[0];

          if (existingUser) {
            // Check if anonymous user has expired
            if (existingUser.expires_at) {
              const now = new Date();
              const expiresAt = new Date(existingUser.expires_at);

              if (now > expiresAt) {
                // User has expired - clean up and create new one
                await supabaseDelete(`/rest/v1/users?id=eq.${existingUser.id}`);
              } else {
                // User still valid - return existing user
                return {
                  id: existingUser.id,
                  username: existingUser.username,
                  displayName: existingUser.display_name || undefined,
                  avatarUrl: existingUser.avatar_url || undefined,
                  isAnonymous: true,
                  authUserId: existingUser.auth_user_id || undefined,
                  createdAt: existingUser.created_at,
                  lastActiveAt: existingUser.last_active_at,
                  expiresAt: existingUser.expires_at,
                };
              }
            }
          }
        } catch (fetchErr) {
          // If fetch fails, continue to create new user
          console.warn('Failed to check for existing anonymous user:', fetchErr);
        }

        // Create new anonymous user
        const username = generateAnonymousUsername();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + ANONYMOUS_LIFESPAN_HOURS);
        
        const data = await supabasePost('/rest/v1/users', {
          auth_user_id: authUser.id, // Use actual auth_user_id for anonymous users
          username,
          is_anonymous: true,
          expires_at: expiresAt.toISOString(),
        });
        
        const newUser = data[0];

        return {
          id: newUser.id,
          username: newUser.username,
          displayName: newUser.display_name || undefined,
          avatarUrl: newUser.avatar_url || undefined,
          isAnonymous: true,
          authUserId: newUser.auth_user_id || undefined,
          createdAt: newUser.created_at,
          lastActiveAt: newUser.last_active_at,
          expiresAt: newUser.expires_at,
        };
      }

      // For authenticated users, check if feed_user exists by auth_user_id
      try {
        const fetchData = await supabaseFetch(
          `/rest/v1/users?auth_user_id=eq.${authUser.id}`
        );
        const existingUser = fetchData[0];
        
        if (existingUser) {
          // Check if anonymous user has expired
          if (existingUser.is_anonymous && existingUser.expires_at) {
            const now = new Date();
            const expiresAt = new Date(existingUser.expires_at);

            if (now > expiresAt) {
              // User has expired - clean up and return null to create new anonymous user
              await supabaseDelete(`/rest/v1/users?id=eq.${existingUser.id}`);
              return null;
            }
          }

          return {
            id: existingUser.id,
            username: existingUser.username,
            displayName: existingUser.display_name || undefined,
            avatarUrl: existingUser.avatar_url || undefined,
            isAnonymous: existingUser.is_anonymous,
            authUserId: existingUser.auth_user_id || undefined,
            createdAt: existingUser.created_at,
            lastActiveAt: existingUser.last_active_at,
            expiresAt: existingUser.expires_at || undefined,
          };
        }
      } catch (err) {
        // User doesn't exist yet, will create below
      }

      // Create new user record for authenticated user
      const username = authUser.email?.split('@')[0] || generateAnonymousUsername();
      
      const createData = await supabasePost('/rest/v1/users', {
        auth_user_id: authUser.id,
        username,
        is_anonymous: false,
      });
      
      const newUser = createData[0];

      return {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.display_name || undefined,
        avatarUrl: newUser.avatar_url || undefined,
        isAnonymous: false,
        authUserId: newUser.auth_user_id || undefined,
        createdAt: newUser.created_at,
        lastActiveAt: newUser.last_active_at,
        expiresAt: undefined, // Authenticated users don't expire
      };
    } catch (err) {
      console.error('Error loading feed user:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!cancelled) {
          if (session?.user) {
            const feedUser = await loadFeedUser(session.user);
            setUser(feedUser);
          } else {
            // No session - create anonymous user
            try {
              const { data, error } = await supabase.auth.signInAnonymously();
              if (error) throw error;

              if (data.user) {
                const feedUser = await loadFeedUser(data.user);
                setUser(feedUser);
              }
            } catch (anonError) {
              console.error('Failed to create anonymous user:', anonError);
              setError(anonError instanceof Error ? anonError : new Error('Failed to create anonymous user'));
            }
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!cancelled) {
        if (session?.user) {
          const feedUser = await loadFeedUser(session.user);
          setUser(feedUser);
        } else {
          // Session ended - create new anonymous user
          try {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;

            if (data.user) {
              const feedUser = await loadFeedUser(data.user);
              setUser(feedUser);
            }
          } catch (anonError) {
            console.error('Failed to create anonymous user:', anonError);
          setUser(null);
          }
        }
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadFeedUser]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const feedUser = await loadFeedUser(data.user);
        setUser(feedUser);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign in');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadFeedUser]);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, username: string) => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create feed_user with custom username
        const responseData = await supabasePost('/rest/v1/users', {
          auth_user_id: data.user.id,
          username,
          is_anonymous: false,
        });
        
        const newUser = responseData[0];

        setUser({
          id: newUser.id,
          username: newUser.username,
          displayName: newUser.display_name || undefined,
          avatarUrl: newUser.avatar_url || undefined,
          isAnonymous: false,
          authUserId: newUser.auth_user_id || undefined,
          createdAt: newUser.created_at,
          lastActiveAt: newUser.last_active_at,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign up');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in anonymously
  const signInAnonymously = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInAnonymously();

      if (signInError) throw signInError;

      if (data.user) {
        // Create a new feed_user for anonymous users
        const feedUser = await loadFeedUser(data.user);
        if (feedUser) {
          setUser(feedUser);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign in anonymously');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadFeedUser]);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign out');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const isGuest = user?.isAnonymous ?? true;

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      signInAnonymously,
      signOut,
      isGuest,
    }),
    [user, loading, error, signIn, signUp, signInAnonymously, signOut, isGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
