"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Check, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { activities } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const activity = activities.find((a) => a.id === params.id)

  if (!activity) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Activity not found</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const activityImages = activity.images || []
  const activityIncluded = activity.included || []
  const activityWhatToBring = activity.whatToBring || []
  const activityDuration = activity.duration ? `${activity.duration} hours` : "Duration not specified"
  const activityPricePer = activity.pricePer || "person"
  // </CHANGE>

  const handleBookClick = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (user.type === "company") {
      alert("Companies cannot book activities. Please sign in as a user.")
      return
    }

    router.push(`/book/${activity.id}`)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % activityImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + activityImages.length) % activityImages.length)
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="relative h-96 w-full bg-muted rounded-lg overflow-hidden group">
                {activityImages.length > 0 ? (
                  <>
                    <Image
                      src={activityImages[currentImageIndex] || "/placeholder.svg"}
                      alt={`${activity.title} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                    {activityImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {activityImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`h-2 rounded-full transition-all ${
                                idx === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>

              {/* Thumbnail gallery for multiple images */}
              {activityImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {activityImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? "border-ocean-blue" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Company */}
            <div>
              <h1 className="text-4xl font-bold text-slate mb-2">{activity.title}</h1>
              {activity.tagline && <p className="text-xl text-slate-light mb-3">{activity.tagline}</p>}
              {/* </CHANGE> */}
              <div className="flex items-center gap-4 text-lg text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Hosted by {activity.companyName}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {activityDuration}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Max {activity.capacity} guests
                </span>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>What you'll do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-light leading-relaxed whitespace-pre-line">
                  {activity.experienceDescription || "No description available"}
                </p>
              </CardContent>
            </Card>
            {/* </CHANGE> */}

            {/* What's included */}
            {activityIncluded.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What's included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {activityIncluded.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-ocean-blue/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-ocean-blue" />
                        </div>
                        <span className="text-slate-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {/* </CHANGE> */}

            {/* What to bring */}
            {activityWhatToBring.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What to bring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {activityWhatToBring.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-coral" />
                        </div>
                        <span className="text-slate-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {/* </CHANGE> */}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate">${activity.price}</span>
                  <span className="text-muted-foreground">per {activityPricePer}</span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                  <Clock className="h-4 w-4" />
                  {activityDuration}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-slate">Availability</h3>
                  <div className="space-y-2">
                    {activity.availability.map((av, idx) => {
                      const totalSlots = av.slots.length
                      const availableSlots = av.slots.filter((s) => s.booked < s.capacity).length
                      return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-light">{new Date(av.date).toLocaleDateString()}</span>
                          <Badge variant={availableSlots > 0 ? "default" : "secondary"}>
                            {availableSlots}/{totalSlots} slots
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Button onClick={handleBookClick} className="w-full bg-ocean-blue hover:bg-ocean-dark text-white">
                  Book Now
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won't be charged yet. Select a time slot first.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
