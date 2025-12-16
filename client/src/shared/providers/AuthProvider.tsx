import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  ensureAnonymousAuth,
  signInWithEmail,
  createUserWithEmail,
  signOutUser,
  signInAnonymouslyUser,
} from "../../firebase/app";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    let cancelled = false;
    ensureAnonymousAuth().catch((error) => {
      // Log authentication errors for debugging
      console.error("Failed to authenticate anonymously:", error);
      // The state change listener will still fire, but we log the error here
      // so developers can see what went wrong (e.g., emulators not running)
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (cancelled) return;
        setUser(nextUser);
        setLoading(false);
      },
      (error) => {
        // Log auth state change errors
        console.error("Auth state change error:", error);
        if (!cancelled) {
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
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

  const isGuest = user?.isAnonymous ?? false;

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
