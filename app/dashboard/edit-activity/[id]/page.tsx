"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { ActivityForm } from "@/components/activity-form"

export default function EditActivityPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { activities, updateActivity } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const activity = activities.find((a) => a.id === params.id)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }

    if (user && user.type !== "company") {
      router.push("/")
    }

    if (user && activity && activity.companyId !== user.id) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router, activity])

  const handleSubmit = (activityData: any) => {
    if (!activity) return

    updateActivity(activity.id, activityData)
    router.push("/dashboard")
  }

  if (isLoading || !user || user.type !== "company" || !activity) {
    return null
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate mb-8">Edit Activity</h1>
        <ActivityForm activity={activity} onSubmit={handleSubmit} onCancel={() => router.push("/dashboard")} />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
