"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserType = "user" | "company"

export interface User {
  id: string
  email: string
  name: string
  type: UserType
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, type: UserType) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
      console.log("[v0] Supabase client created successfully")
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const initAuth = async () => {
      try {
        console.log("[v0] Getting initial session...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Error getting session:", error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          console.log("[v0] Found existing session for user:", session.user.email)
          setSupabaseUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          console.log("[v0] No existing session found")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("[v0] Failed to get session:", error)
        setIsLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[v0] Auth state changed:", _event)
      if (session?.user) {
        setSupabaseUser(session.user)
        fetchUserProfile(session.user.id)
      } else {
        setSupabaseUser(null)
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return

    try {
      console.log("[v0] Fetching user profile for:", userId)
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("[v0] Error fetching user profile:", error)
        throw error
      }

      if (data) {
        console.log("[v0] User profile loaded:", data.email)
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          type: data.user_type as UserType,
        })
      } else {
        console.log("[v0] No user profile found yet, will retry on next auth state change")
      }
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      console.error("[v0] Supabase client not initialized")
      return false
    }

    try {
      console.log("[v0] Attempting login for:", email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Login error:", error)
        throw error
      }

      console.log("[v0] Login successful")
      return true
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  const signup = async (email: string, password: string, name: string, type: UserType): Promise<boolean> => {
    if (!supabase) {
      console.error("[v0] Supabase client not initialized")
      return false
    }

    try {
      console.log("[v0] Attempting signup for:", email, "as", type)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
          data: {
            name,
            user_type: type,
          },
        },
      })

      if (error) {
        console.error("[v0] Signup error:", error)
        throw error
      }

      console.log("[v0] Signup successful, session:", !!data.session)
      return true
    } catch (error) {
      console.error("[v0] Signup error:", error)
      return false
    }
  }

  const logout = async () => {
    if (!supabase) return

    console.log("[v0] Logging out")
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
