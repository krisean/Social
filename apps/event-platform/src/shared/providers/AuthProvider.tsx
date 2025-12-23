import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { User } from "@supabase/supabase-js";
import {
  supabase,
  ensureAnonymousAuth,
  signInWithEmail,
  createUserWithEmail,
  signOutUser,
  signInAnonymouslyUser,
} from "../../supabase/client";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Ensure anonymous auth if needed
    ensureAnonymousAuth().catch((error) => {
      // Log authentication errors for debugging
      console.error("Failed to authenticate anonymously:", error);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!cancelled) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    await createUserWithEmail(email, password, displayName);
  };

  const signOut = async () => {
    await signOutUser();
  };

  const signInAnonymously = async () => {
    await signInAnonymouslyUser();
  };

  const isGuest = user?.is_anonymous ?? false;

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      signInAnonymously,
      isGuest,
    }),
    [user, loading, isGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
