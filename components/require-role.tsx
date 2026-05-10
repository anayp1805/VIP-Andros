"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserType } from "@/lib/auth-context"

/**
 * Usage:
 * <RequireRole roles={["company", "philanthropist"]} fallback="/">
 *   <ProtectedPageContent />
 * </RequireRole>
 */
interface RequireRoleProps {
  roles: UserType[]
  fallback?: string
  children: ReactNode
}

export function RequireRole({ roles, fallback = "/", children }: RequireRoleProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const isAuthorized = !!user && roles.includes(user.type)

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace(fallback)
    }
  }, [fallback, isAuthorized, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!isAuthorized) return null

  return <>{children}</>
}
