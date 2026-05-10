"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mountain, LogOut, ChevronDown, User as UserIcon } from "lucide-react"
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
          <span className="text-2xl font-bold text-primary">Tokuma</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/activities">Activities</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/projects">Projects</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/investments">Investments</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/info">Info</Link>
          </Button>

          {user ? (
            <>
              {user.type === "philanthropist" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2">
                      Philanthropy
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/philanthropy">Main</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/donations">Donations</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full border border-border hover:border-primary transition">
                    <Avatar className="h-10 w-10">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={`${user.name}'s avatar`} />}
                      <AvatarFallback>
                        {user.name ? (
                          <span className="text-sm font-medium text-muted-foreground">
                            {user.name.slice(0, 2).toUpperCase()}
                          </span>
                        ) : (
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings">Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={onAuthClick}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  )
}
