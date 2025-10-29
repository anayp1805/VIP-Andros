"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActivities, type Booking } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MyBookingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { getUserBookings, activities } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userBookings, setUserBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }

    if (user && user.type === "company") {
      router.push("/dashboard")
    }

    if (user && user.type === "user") {
      setUserBookings(getUserBookings(user.id))
    }
  }, [user, isLoading, router, getUserBookings])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.type !== "user") {
    return null
  }

  const getActivityForBooking = (activityId: string) => {
    return activities.find((a) => a.id === activityId)
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your activity bookings</p>
        </div>

        {userBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">Start exploring and book your first activity!</p>
              <Button asChild className="bg-ocean-blue hover:bg-ocean-dark">
                <Link href="/">Browse Activities</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userBookings.map((booking) => {
              const activity = getActivityForBooking(booking.activityId)

              if (!activity) return null

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative h-32 w-40 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {activity.images[0] ? (
                          <Image
                            src={activity.images[0] || "/placeholder.svg"}
                            alt={activity.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-slate mb-1">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.companyName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={booking.status === "confirmed" ? "bg-green-600" : ""}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Date</div>
                              <div className="font-medium text-slate">
                                {new Date(booking.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Time</div>
                              <div className="font-medium text-slate">{booking.time}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Price</div>
                              <div className="font-bold text-ocean-blue">${activity.price}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/activity/${activity.id}`}>View Activity</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
