"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityCard } from "@/components/activity-card"
import { Plus, Edit, Trash2, Calendar, Mail, User, Clock, Users } from "lucide-react"
import Image from "next/image"

type DashboardTab = 'overview' | 'profile' | 'activities' | 'bookings'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { activities, getCompanyActivities, deleteActivity, bookings } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [companyActivities, setCompanyActivities] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }

    if (user && user.type !== "company") {
      router.push("/")
    }

    if (user && user.type === "company") {
      setCompanyActivities(getCompanyActivities(user.id))
    }
  }, [user, isLoading, router, getCompanyActivities])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      deleteActivity(id)
      if (user) {
        setCompanyActivities(getCompanyActivities(user.id))
      }
    }
  }

  const companyBookings = bookings.filter((booking) =>
    companyActivities.some((activity) => activity.id === booking.activityId),
  )

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

  if (!user || user.type !== "company") {
    return null
  }

  const isLodge = user.businessType === 'lodge'
  const generalActivities = companyActivities.filter(a => a.activityType === 'general')
  const lodgeExperiences = companyActivities.filter(a => a.activityType === 'lodge-experience')

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate mb-2">
              {isLodge ? `${user.name} - Lodge Dashboard` : 'Company Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {isLodge ? 'Manage your lodge profile and experiences' : 'Manage your activities and bookings'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push("/dashboard/edit-profile")} 
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              onClick={() => router.push("/dashboard/new-activity")} 
              className="bg-ocean-blue hover:bg-ocean-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLodge ? 'Add Experience' : 'Create Activity'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation for Lodges */}
        {isLodge && (
          <div className="bg-white border-b mb-8 -mx-4 px-4">
            <nav className="flex gap-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'profile', label: 'Profile' },
                { id: 'activities', label: 'Experiences & Activities' },
                { id: 'bookings', label: 'Bookings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-ocean-blue text-ocean-blue font-semibold'
                      : 'border-transparent text-slate-light hover:text-slate'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Overview Tab (or default for non-lodges) */}
        {(!isLodge || activeTab === 'overview') && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Activities</CardDescription>
              <CardTitle className="text-3xl">{companyActivities.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Active Listings</CardDescription>
              <CardTitle className="text-3xl">
                {
                  companyActivities.filter((a) =>
                    a.availability.some((av: any) => av.slots.some((s: any) => s.available)),
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">{companyBookings.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {companyBookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>View customer bookings for your activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyBookings
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((booking) => {
                    const activity = activities.find((a) => a.id === booking.activityId)
                    if (!activity) return null

                    const dateAvailability = activity.availability.find((av) => av.date === booking.date)
                    const slot = dateAvailability?.slots.find((s) => s.time === booking.time)
                    const remaining = slot ? slot.capacity - slot.booked : 0

                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-slate">{activity.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(booking.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{booking.time}</span>
                                {slot && (
                                  <>
                                    <Users className="h-4 w-4 ml-2" />
                                    <span>
                                      {slot.booked}/{slot.capacity} booked
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1 pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-slate">{booking.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${booking.userEmail}`} className="text-ocean-blue hover:underline">
                                {booking.userEmail}
                              </a>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground pt-1">
                            Booked on{" "}
                            {new Date(booking.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activities</CardTitle>
            <CardDescription>Manage and edit your activity listings</CardDescription>
          </CardHeader>
          <CardContent>
            {companyActivities.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                <p className="text-muted-foreground mb-4">Create your first activity to start receiving bookings</p>
                <Button
                  onClick={() => router.push("/dashboard/new-activity")}
                  className="bg-ocean-blue hover:bg-ocean-dark"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {companyActivities.map((activity) => {
                  const availableSlots = activity.availability.reduce(
                    (acc: number, av: any) => acc + av.slots.filter((s: any) => s.booked < s.capacity).length,
                    0,
                  )
                  const activityBookings = bookings.filter((b) => b.activityId === activity.id).length

                  return (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate truncate">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{activity.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className="bg-coral text-white">${activity.price}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-muted-foreground">{availableSlots} slots available</span>
                          <span className="text-sm text-muted-foreground">{activity.capacity} people/slot</span>
                          <span className="text-sm font-medium text-ocean-blue">{activityBookings} bookings</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/edit-activity/${activity.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(activity.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}

        {/* Profile Tab - Lodge Only */}
        {isLodge && activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lodge Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate mb-2">Description</h3>
                  <p className="text-slate-light">{user.businessDescription || 'No description set'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate mb-2">Our Story</h3>
                  <p className="text-slate-light whitespace-pre-line">{user.businessStory || 'No story set'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate mb-2">Location</h3>
                  <p className="text-slate-light">{user.location || 'No location set'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate mb-2">Contact Information</h3>
                  <p className="text-slate-light">{user.contactEmail || user.email}</p>
                  {user.contactPhone && <p className="text-slate-light">{user.contactPhone}</p>}
                </div>
                <Button onClick={() => router.push('/dashboard/edit-profile')} className="bg-ocean-blue hover:bg-ocean-dark">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rates & Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate mb-2">Rates</h3>
                  <p className="text-slate-light whitespace-pre-line">{user.ratesInfo || 'No rates information set'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate mb-2">Policies</h3>
                  <p className="text-slate-light whitespace-pre-line">{user.policies || 'No policies set'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate mb-2">Planning Your Trip</h3>
                  <p className="text-slate-light whitespace-pre-line">{user.planningInfo || 'No planning information set'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activities Tab - Lodge Only */}
        {isLodge && activeTab === 'activities' && (
          <div className="space-y-8">
            {/* Lodge Experiences */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate">Lodge Experiences</h2>
                  <p className="text-muted-foreground">Add-on experiences for your guests</p>
                </div>
                <Button onClick={() => router.push('/dashboard/new-activity')} className="bg-ocean-blue hover:bg-ocean-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              {lodgeExperiences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lodgeExperiences.map((activity) => (
                    <div key={activity.id} className="relative">
                      <ActivityCard activity={activity} />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/dashboard/edit-activity/${activity.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No lodge experiences yet. Create your first experience!
                  </CardContent>
                </Card>
              )}
            </section>

            {/* General Activities */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate">Activities & Tours</h2>
                  <p className="text-muted-foreground">Activities available to all guests</p>
                </div>
              </div>
              {generalActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generalActivities.map((activity) => (
                    <div key={activity.id} className="relative">
                      <ActivityCard activity={activity} />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/dashboard/edit-activity/${activity.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No general activities yet.
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        )}

        {/* Bookings Tab - Lodge Only */}
        {isLodge && activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Manage bookings for your experiences and activities</CardDescription>
            </CardHeader>
            <CardContent>
              {companyBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {companyBookings.map((booking) => {
                    const activity = companyActivities.find((a) => a.id === booking.activityId)
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold text-slate">{activity?.title || "Unknown Activity"}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.userName} ({booking.userEmail})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </p>
                        </div>
                        <Badge
                          variant={booking.status === "confirmed" ? "default" : "secondary"}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
