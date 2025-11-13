"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { ActivityCard } from "@/components/activity-card"
import ActivitiesFilteredList from "@/app/components/activities-filtered-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const { activities } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredActivities = activities.filter((activity) => {
    const query = searchQuery.toLowerCase()
    const title = activity.title?.toLowerCase() || ""
    const description = activity.experienceDescription?.toLowerCase() || ""
    const tagline = activity.tagline?.toLowerCase() || ""

    return title.includes(query) || description.includes(query) || tagline.includes(query)
  })

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean-blue to-ocean-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl mb-4 text-balance font-display">Discover Amazing Activities</h1>
          <p className="text-xl mb-8 text-balance max-w-2xl mx-auto">
            Book unforgettable experiences from trusted providers around the world
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate" />
            <Input
              type="text"
              placeholder="Search for activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white text-slate"
            />
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div />
        </div>

  <ActivitiesFilteredList />
      </section>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
