"use client"

import type React from "react"

import { useState } from "react"
import { useAuth, type UserType } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login, signup } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState<UserType>("user")
  const [companyExperience, setCompanyExperience] = useState<"education" | "expert">("education")
  const [philanthropyCode, setPhilanthropyCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      let success = false
      if (isLogin) {
        success = await login(email, password)
        if (!success) {
          setError("Invalid credentials")
        } else {
          onClose()
        }
      } else {
        if (!name) {
          setError("Name is required")
          setLoading(false)
          return
        }
        if (userType === "philanthropist" && !philanthropyCode.trim()) {
          setError("Access code is required for philanthropist signup.")
          setLoading(false)
          return
        }

        success = await signup(email, password, name, userType, {
          companyExperience: userType === "company" ? companyExperience : undefined,
          accessCode: userType === "philanthropist" ? philanthropyCode.trim() : undefined,
        })
        if (!success) {
          setError("Signup failed. User may already exist.")
        } else {
          setSuccessMessage("Account created! Please check your email to confirm your account.")
        }
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative bg-card text-card-foreground">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Tokuma</CardTitle>
          <CardDescription>{isLogin ? "Sign in to your account" : "Create a new account"}</CardDescription>
        </CardHeader>

        <CardContent>
          {!isLogin && (
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="philanthropist">Philanthropist</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={userType === "company" ? "Company name" : "Your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            {!isLogin && userType === "company" && (
              <div className="space-y-2">
                <Label htmlFor="company-experience">Company experience level</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    variant={companyExperience === "education" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setCompanyExperience("education")}
                  >
                    I want education and training to run a business
                  </Button>
                  <Button
                    type="button"
                    variant={companyExperience === "expert" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setCompanyExperience("expert")}
                  >
                    I am an expert — enroll my business anyway
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tokuma will use this to tailor onboarding and training soon. No extra steps yet.
                </p>
              </div>
            )}

            {!isLogin && userType === "philanthropist" && (
              <div className="space-y-2">
                <Label htmlFor="philanthropy-code">Access code (required)</Label>
                <Input
                  id="philanthropy-code"
                  type="text"
                  placeholder="Enter invitation code"
                  value={philanthropyCode}
                  onChange={(e) => setPhilanthropyCode(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Philanthropist access is invite-only. Code validation happens on the server.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button type="button" onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
