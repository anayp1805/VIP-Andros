"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => {}} />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  const roleLabel = (() => {
    switch (user.type) {
      case "philanthropist":
        return "Philanthropist"
      case "company":
        return "Organization"
      default:
        return "Student"
    }
  })()

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => {}} />

      <div className="container mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-primary">Profile</p>
          <h1 className="text-4xl font-bold text-slate">Welcome, {user.name}.</h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your Tokuma identity and see your key details at a glance.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account overview</CardTitle>
              <CardDescription>Your basics for sign-in and access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{roleLabel}</Badge>
                {user.companyExperienceLevel && (
                  <Badge variant="outline">Experience: {user.companyExperienceLevel}</Badge>
                )}
              </div>
              <Separator />
              <div className="space-y-3 text-sm text-slate">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{roleLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default" onClick={() => router.push("/dashboard")}>
                Go to dashboard
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.push("/my-bookings")}>
                View bookings
              </Button>
              <Button className="w-full" variant="destructive" onClick={logout}>
                Log out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
