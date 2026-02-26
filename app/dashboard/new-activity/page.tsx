"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { ActivityForm } from "@/components/activity-form"

export default function NewActivityPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { addActivity } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }

    if (user && user.type !== "company" && user.type !== "philanthropist") {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleSubmit = (activityData: any) => {
    if (!user) return

    addActivity({
      ...activityData,
      companyId: user.id,
      companyName: user.name,
    })

    router.push("/dashboard")
  }

  if (isLoading || !user || (user.type !== "company" && user.type !== "philanthropist")) {
    return null
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate mb-8">Create New Activity</h1>
        <ActivityForm onSubmit={handleSubmit} onCancel={() => router.push("/dashboard")} />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
