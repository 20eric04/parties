'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { auth } from './supabase'
import type { AuthSession } from './types'

type AuthContextType = {
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthSession>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<any>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'parties_session'

function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredSession()
    if (stored) {
      auth.getUser(stored.access_token)
        .then(() => setSession(stored))
        .catch(() => {
          storeSession(null)
          setSession(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await auth.signIn(email, password)
    setSession(data)
    storeSession(data)
    return data
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    return auth.signUp(email, password, metadata)
  }, [])

  const signOut = useCallback(async () => {
    if (session?.access_token) {
      try { await auth.signOut(session.access_token) } catch {}
    }
    setSession(null)
    storeSession(null)
  }, [session])

  const refreshSession = useCallback(async () => {
    if (!session?.refresh_token) return
    try {
      const data = await auth.refreshToken(session.refresh_token)
      setSession(data)
      storeSession(data)
    } catch {
      setSession(null)
      storeSession(null)
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
