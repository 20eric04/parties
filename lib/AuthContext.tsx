"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, refreshToken, getSession, getUser } from "./supabase";

interface AuthState {
  user: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, session: null, loading: true,
  signIn: async () => {}, signUp: async () => {}, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sync = useCallback(() => {
    const s = getSession();
    setSession(s);
    setUser(s?.user || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    sync();
    const interval = setInterval(async () => {
      const s = getSession();
      if (s?.refresh_token) {
        try { await refreshToken(); sync(); } catch {}
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sync]);

  const handleSignIn = async (email: string, password: string) => {
    const r = await apiSignIn(email, password);
    sync();
    return r;
  };

  const handleSignUp = async (email: string, password: string) => {
    const r = await apiSignUp(email, password);
    sync();
    return r;
  };

  const handleSignOut = async () => {
    await apiSignOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn: handleSignIn, signUp: handleSignUp, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
