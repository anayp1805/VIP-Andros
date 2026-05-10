"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Check, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function BookActivityPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { activities, bookActivity } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const activity = activities.find((a) => a.id === params.id)

  useEffect(() => {
    if (!user) {
      router.push(`/activity/${params.id}`)
    }

    if (user && user.type === "company") {
      router.push(`/activity/${params.id}`)
    }
  }, [user, router, params.id])

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

  const selectedDateAvailability = activity.availability.find((av) => av.date === selectedDate)
  const availableSlots = selectedDateAvailability?.slots.filter((s) => s.booked < s.capacity) || []

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime) return

    setIsBooking(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const success = await bookActivity(activity.id, user.id, user.name, user.email, selectedDate, selectedTime)

    if (success) {
      setBookingSuccess(true)
      setTimeout(() => {
        router.push("/my-bookings")
      }, 2000)
    } else {
      toast.error("Booking failed.", {
        description: "Please try again.",
      })
    }

    setIsBooking(false)
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-12 pb-12">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate mb-4">Booking Confirmed!</h1>
              <p className="text-lg text-muted-foreground mb-2">Your activity has been successfully booked.</p>
              <p className="text-muted-foreground mb-8">Redirecting to your bookings...</p>
              <Button asChild className="bg-ocean-blue hover:bg-ocean-dark">
                <Link href="/my-bookings">View My Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/activity/${activity.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activity
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative h-24 w-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
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
                  <div>
                    <h3 className="text-xl font-semibold text-slate">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">by {activity.companyName}</p>
                    <p className="text-lg font-bold text-ocean-blue mt-2">${activity.price} per person</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select a Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activity.availability.map((av, idx) => {
                    const availableCount = av.slots.filter((s) => s.booked < s.capacity).length
                    const isSelected = selectedDate === av.date

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDate(av.date)
                          setSelectedTime("")
                        }}
                        disabled={availableCount === 0}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? "border-ocean-blue bg-ocean-blue/5"
                            : availableCount > 0
                              ? "border-border hover:border-ocean-blue/50"
                              : "border-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="font-semibold text-slate">
                          {new Date(av.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {availableCount > 0 ? `${availableCount} slots available` : "Fully booked"}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Select a Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableSlots.length === 0 ? (
                    <p className="text-muted-foreground">No available time slots for this date.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableSlots.map((slot, idx) => {
                        const isSelected = selectedTime === slot.time
                        const remaining = slot.capacity - slot.booked

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-4 border-2 rounded-lg transition-all text-left ${
                              isSelected
                                ? "border-ocean-blue bg-ocean-blue/5"
                                : "border-border hover:border-ocean-blue/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isSelected ? "text-ocean-blue" : "text-slate"}`}>
                                {slot.time}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>
                                  {remaining} spot{remaining !== 1 ? "s" : ""} left
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Activity</span>
                    <span className="font-medium text-slate">{activity.title}</span>
                  </div>

                  {selectedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-slate">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-slate">{selectedTime}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate">Total</span>
                      <span className="text-2xl font-bold text-ocean-blue">${activity.price}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || isBooking}
                  className="w-full bg-ocean-blue hover:bg-ocean-dark text-white"
                >
                  {isBooking ? "Processing..." : "Confirm Booking"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By booking, you agree to our terms and conditions
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
