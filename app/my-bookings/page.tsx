"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useActivities, type Booking } from "@/lib/activities-context"
import { calculateRefundPreview, isFutureBooking } from "@/lib/cancellation-policy"
import { refundPayment } from "@/lib/refund-payment"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { RequireRole } from "@/components/require-role"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MyBookingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { getUserBookings, activities, cancelBooking } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (user && (user.type === "user" || user.type === "philanthropist")) {
      setUserBookings(getUserBookings(user.id))
    }
  }, [user, isLoading, router, getUserBookings])

  const getActivityForBooking = (activityId: string) => {
    return activities.find((a) => a.id === activityId)
  }

  const upcomingBookings = userBookings.filter((booking) => booking.status !== "cancelled_by_user")
  const cancelledBookings = userBookings.filter((booking) => booking.status === "cancelled_by_user")
  const activityToCancel = bookingToCancel ? getActivityForBooking(bookingToCancel.activityId) : undefined
  const refundPreview =
    bookingToCancel && activityToCancel
      ? calculateRefundPreview({
          policy: activityToCancel.cancellationPolicy,
          price: activityToCancel.price,
          bookingDate: bookingToCancel.date,
        })
      : null

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return

    setCancelling(true)
    try {
      await refundPayment(bookingToCancel.id)
      const success = await cancelBooking(bookingToCancel.id)

      if (!success) {
        toast.error("Could not cancel booking.", {
          description: "Please try again.",
        })
        return
      }

      setUserBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingToCancel.id ? { ...booking, status: "cancelled_by_user" } : booking,
        ),
      )
      toast.success("Booking cancelled.", {
        description: refundPreview
          ? `Estimated refund: $${refundPreview.refundAmount.toFixed(2)}.`
          : "Your booking status was updated.",
      })
      setBookingToCancel(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again."
      toast.error("Could not process cancellation.", {
        description: message,
      })
    } finally {
      setCancelling(false)
    }
  }

  const renderBookings = (bookingsToRender: Booking[]) =>
    bookingsToRender.map((booking) => {
      const activity = getActivityForBooking(booking.activityId)

      if (!activity) return null

      const canCancel = booking.status === "confirmed" && isFutureBooking(booking.date)

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

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/activity/${activity.id}`}>View Activity</Link>
                  </Button>
                  {canCancel && (
                    <Button variant="destructive" size="sm" onClick={() => setBookingToCancel(booking)}>
                      Cancel booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    })

  return (
    <RequireRole roles={["user", "philanthropist"]} fallback="/">
      {isLoading ? (
        <div className="min-h-screen bg-sand">
          <Navbar onAuthClick={() => setShowAuthModal(true)} />
          <div className="container mx-auto px-4 py-12 text-center">
            <p>Loading...</p>
          </div>
        </div>
      ) : (
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
              <div className="space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-slate">Upcoming</h2>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">{renderBookings(upcomingBookings)}</div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-sm text-muted-foreground">No upcoming bookings.</CardContent>
                    </Card>
                  )}
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-slate">Cancelled</h2>
                  {cancelledBookings.length > 0 ? (
                    <div className="space-y-4">{renderBookings(cancelledBookings)}</div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-sm text-muted-foreground">No cancelled bookings.</CardContent>
                    </Card>
                  )}
                </section>
              </div>
            )}
          </div>

          <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  {refundPreview && activityToCancel
                    ? `${activityToCancel.cancellationPolicy} policy: ${refundPreview.refundPercent}% refund, estimated at $${refundPreview.refundAmount.toFixed(2)}.`
                    : "Review your refund before confirming."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={cancelling}>Keep booking</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelBooking} disabled={cancelling}>
                  {cancelling ? "Cancelling..." : "Cancel booking"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </div>
      )}
    </RequireRole>
  )
}
