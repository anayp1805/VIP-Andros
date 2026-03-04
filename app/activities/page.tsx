"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { ActivityCard } from "@/components/activity-card"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

export default function ActivitiesPage() {
  const { user } = useAuth()
  const { activities } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [country, setCountry] = useState("")
  const [stateProv, setStateProv] = useState("")
  const [city, setCity] = useState("")
  const [businessType, setBusinessType] = useState("all")

  const businessTypeOptions = [
    { value: "all", label: "All types" },
    { value: "hotel", label: "Hotels & lodging" },
    { value: "tourism", label: "Tours & excursions" },
    { value: "restaurant", label: "Food & restaurants" },
    { value: "education", label: "Education & workshops" },
    { value: "wellness", label: "Wellness & retreats" },
    { value: "outdoors", label: "Outdoors & adventure" },
  ]

  const filteredActivities = activities.filter((activity) => {
    const query = searchQuery.toLowerCase()
    const title = activity.title?.toLowerCase() || ""
    const description = activity.experienceDescription?.toLowerCase() || ""
    const tagline = activity.tagline?.toLowerCase() || ""
    const company = activity.companyName?.toLowerCase() || ""

    const haystack = `${title} ${description} ${tagline} ${company}`

    const matchesSearch = title.includes(query) || description.includes(query) || tagline.includes(query)

    const matchesCountry = country ? haystack.includes(country.toLowerCase()) : true
    const matchesState = stateProv ? haystack.includes(stateProv.toLowerCase()) : true
    const matchesCity = city ? haystack.includes(city.toLowerCase()) : true

    const matchesBusiness =
      businessType === "all"
        ? true
        : haystack.includes(businessType === "restaurant" ? "restaurant" : businessType)

    return matchesSearch && matchesCountry && matchesState && matchesCity && matchesBusiness
  })

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean-blue to-ocean-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 text-balance">Tokuma activities & experiences</h1>
          <p className="text-xl mb-8 text-balance max-w-3xl mx-auto">
            Explore sustainable, circular-economy projects and learning opportunities curated for you.
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

      {/* Filters & Activities */}
      <section className="container mx-auto px-4 py-12 space-y-8">
        <Card className="border shadow-sm">
          <div className="grid gap-4 md:grid-cols-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., Bahamas"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                placeholder="e.g., Andros"
                value={stateProv}
                onChange={(e) => setStateProv(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City / Town</Label>
              <Input
                id="city"
                placeholder="e.g., Nicholl’s Town"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biztype">Business type</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger id="biztype">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate">Available Activities</h2>
          <p className="text-muted-foreground">{filteredActivities.length} activities found</p>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No activities found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
