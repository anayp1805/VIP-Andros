"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Mountain, User, LogOut, Calendar } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  onAuthClick: () => void
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Mountain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">Andros</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">({user.type})</span>
              </div>

              {user.type === "user" && (
                <Button asChild variant="outline">
                  <Link href="/my-bookings">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </Link>
                </Button>
              )}

              {user.type === "company" && (
                <Button asChild variant="outline">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={onAuthClick}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  )
}
