"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserType = "user" | "company" | "philanthropist"

export interface User {
  id: string
  email: string
  name: string
  type: UserType
  companyExperienceLevel?: "education" | "expert" | null
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (
    email: string,
    password: string,
    name: string,
    type: UserType,
    options?: { companyExperience?: "education" | "expert"; accessCode?: string },
  ) => Promise<boolean>
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
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          setSupabaseUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to get session:", error)
        setIsLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Error fetching user profile:", error)
        throw error
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          type: data.user_type as UserType,
          companyExperienceLevel: (data.company_experience_level as "education" | "expert" | null) ?? null,
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    type: UserType,
    options?: { companyExperience?: "education" | "expert"; accessCode?: string },
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
          data: {
            name,
            user_type: type,
            company_experience: options?.companyExperience,
            philanthropy_access_code: options?.accessCode,
          },
        },
      })

      if (error) throw error

      // Persist profile in public.users
      if (data.user) {
        const profilePayload: Record<string, unknown> = {
          id: data.user.id,
          email,
          name,
          user_type: type,
          company_experience_level: options?.companyExperience || null,
        }

        const { error: profileError } = await supabase.from("users").upsert(profilePayload, { onConflict: "id" })
        if (profileError) {
          console.error("Profile upsert error:", profileError)
        }

        if (type === "philanthropist") {
          const { error: philanthropistError } = await supabase.from("philanthropists").upsert(
            { user_id: data.user.id, full_name: name, email },
            { onConflict: "user_id" },
          )
          if (philanthropistError) {
            console.error("Philanthropist upsert error:", philanthropistError)
          }
        }
      }

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = async () => {
    if (!supabase) return
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
