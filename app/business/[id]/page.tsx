"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { ActivityCard } from "@/components/activity-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, Phone, Mail, Globe, ExternalLink, 
  Clock, Home, Calendar, Shield, Info, MessageSquare 
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type TabType = 'home' | 'experiences' | 'about' | 'rates' | 'planning' | 'policy' | 'contact' | 'blog'

interface BusinessProfile {
  id: string
  name: string
  tagline?: string
  businessDescription?: string
  businessStory?: string
  businessType?: 'activity' | 'lodge'
  location?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  website?: string
  blogUrl?: string
  businessImages?: string[]
  externalBookingLink?: string
  roomTypes?: any[]
  amenities?: string[]
  checkInTime?: string
  checkOutTime?: string
  cancellationPolicy?: string
  minimumStay?: string
  houseRules?: string
  ratesInfo?: string
  planningInfo?: string
  policies?: string
  storyImage?: string
}

export default function BusinessProfilePage() {
  const params = useParams()
  const businessId = params.id as string
  const { activities } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('home')

  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile()
    }
  }, [businessId])

  const fetchBusinessProfile = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', businessId)
        .eq('user_type', 'company')
        .single()

      if (error) throw error

      if (data) {
        setBusiness({
          id: data.id,
          name: data.name,
          tagline: data.tagline,
          businessDescription: data.business_description,
          businessStory: data.business_story,
          businessType: data.business_type,
          location: data.location,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          contactAddress: data.contact_address,
          website: data.website,
          blogUrl: data.blog_url,
          businessImages: data.business_images || [],
          externalBookingLink: data.external_booking_link,
          roomTypes: data.room_types || [],
          amenities: data.amenities || [],
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
          cancellationPolicy: data.cancellation_policy,
          minimumStay: data.minimum_stay,
          houseRules: data.house_rules,
          ratesInfo: data.rates_info,
          planningInfo: data.planning_info,
          policies: data.policies,
          storyImage: data.story_image,
        })
      }
    } catch (error) {
      console.error('Error fetching business profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const businessActivities = activities.filter(a => a.companyId === businessId)
  const generalActivities = businessActivities.filter(a => a.activityType === 'general')
  const lodgeExperiences = businessActivities.filter(a => a.activityType === 'lodge-experience')

  const isLodge = business?.businessType === 'lodge'

  if (loading) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate mb-4">Business Not Found</h1>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      {/* Business Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-slate mb-4">{business.name}</h1>
        {business.location && (
          <p className="text-xl text-muted-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {business.location}
          </p>
        )}
      </div>

      {/* Image Gallery */}
      {business.businessImages && business.businessImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {business.businessImages.slice(0, 8).map((img, idx) => (
            <div key={idx} className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={img || "/placeholder.svg"}
                alt={`${business.name} image ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation - Only for Lodges */}
      {isLodge && (
        <div className="bg-white border-b mb-8 sticky top-16 z-10">
          <div className="container mx-auto px-4">
            <nav className="flex gap-8 overflow-x-auto">
              {[
                { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
                ...(lodgeExperiences.length > 0 ? [{ id: 'experiences' as TabType, label: 'Experiences & Add-ons', icon: <Calendar className="h-4 w-4" /> }] : []),
                { id: 'about', label: 'About', icon: <Info className="h-4 w-4" /> },
                { id: 'rates', label: 'Rates & Pricing', icon: <Shield className="h-4 w-4" /> },
                { id: 'planning', label: 'Planning Your Trip', icon: <MapPin className="h-4 w-4" /> },
                { id: 'policy', label: 'Policy', icon: <Shield className="h-4 w-4" /> },
                { id: 'contact', label: 'Contact', icon: <MessageSquare className="h-4 w-4" /> },
                ...(business.blogUrl ? [{ id: 'blog' as TabType, label: 'Blog', icon: <ExternalLink className="h-4 w-4" /> }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-ocean-blue text-ocean-blue font-semibold'
                      : 'border-transparent text-slate-light hover:text-slate'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {business.tagline && (
              <h2 className="text-4xl font-bold text-slate text-center italic">{business.tagline}</h2>
            )}

            {business.businessDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to {business.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.businessDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {business.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge variant="secondary">{amenity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Room Types */}
            {business.roomTypes && business.roomTypes.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-slate mb-6">Accommodations</h2>
                <div className="grid gap-6">
                  {business.roomTypes.map((room: any) => (
                    <Card key={room.id}>
                      <CardHeader>
                        <CardTitle>{room.name}</CardTitle>
                        {room.description && (
                          <p className="text-muted-foreground">{room.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {room.bedTypes && (
                          <div>
                            <p className="font-semibold">Beds:</p>
                            <p className="text-slate-light">{room.bedTypes}</p>
                          </div>
                        )}
                        {room.maxOccupancy && (
                          <div>
                            <p className="font-semibold">Max Occupancy:</p>
                            <p className="text-slate-light">{room.maxOccupancy} guests</p>
                          </div>
                        )}
                        {room.amenities && room.amenities.length > 0 && (
                          <div>
                            <p className="font-semibold mb-2">Room Amenities:</p>
                            <div className="flex flex-wrap gap-2">
                              {room.amenities.map((amenity: string, idx: number) => (
                                <Badge key={idx} variant="secondary">{amenity}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Button */}
            {business.externalBookingLink && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-ocean-blue hover:bg-ocean-dark text-white"
                >
                  <a href={business.externalBookingLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Book Your Stay
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">Experiences & Add-ons</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Enhance your stay with these exclusive experiences available at {business.name}
            </p>

            {lodgeExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lodgeExperiences.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No experiences available at this time.
              </p>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">About {business.name}</h2>
            
            {business.businessStory && (
              <Card>
                <CardHeader>
                  <CardTitle>Our Story</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.businessStory}
                  </p>
                </CardContent>
              </Card>
            )}

            {business.storyImage && (
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={business.storyImage}
                  alt="Our Story"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Rates Tab */}
        {activeTab === 'rates' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">Rates & Pricing</h2>
            
            {business.ratesInfo ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.ratesInfo}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Please contact us for current rates and availability.
              </p>
            )}
          </div>
        )}

        {/* Planning Tab */}
        {activeTab === 'planning' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">Planning Your Trip</h2>
            
            {business.planningInfo ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.planningInfo}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No planning information available.
              </p>
            )}
          </div>
        )}

        {/* Policy Tab */}
        {activeTab === 'policy' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">Policies & Important Information</h2>

            {(business.checkInTime || business.checkOutTime) && (
              <Card>
                <CardHeader>
                  <CardTitle>Check-in & Check-out</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {business.checkInTime && (
                    <p><span className="font-semibold">Check-in:</span> {business.checkInTime}</p>
                  )}
                  {business.checkOutTime && (
                    <p><span className="font-semibold">Check-out:</span> {business.checkOutTime}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {business.minimumStay && (
              <Card>
                <CardHeader>
                  <CardTitle>Minimum Stay</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-light">{business.minimumStay}</p>
                </CardContent>
              </Card>
            )}

            {business.cancellationPolicy && (
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-light whitespace-pre-line">{business.cancellationPolicy}</p>
                </CardContent>
              </Card>
            )}

            {business.houseRules && (
              <Card>
                <CardHeader>
                  <CardTitle>House Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-light whitespace-pre-line">{business.houseRules}</p>
                </CardContent>
              </Card>
            )}

            {business.policies && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-light whitespace-pre-line">{business.policies}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">Contact Information</h2>

            <Card>
              <CardContent className="pt-6 space-y-4">
                {business.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-ocean-blue" />
                    <a href={`mailto:${business.contactEmail}`} className="text-lg hover:underline">
                      {business.contactEmail}
                    </a>
                  </div>
                )}

                {business.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-ocean-blue" />
                    <a href={`tel:${business.contactPhone}`} className="text-lg hover:underline">
                      {business.contactPhone}
                    </a>
                  </div>
                )}

                {business.contactAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-ocean-blue mt-1" />
                    <p className="text-lg whitespace-pre-line">{business.contactAddress}</p>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-ocean-blue" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg hover:underline flex items-center gap-1"
                    >
                      {business.website}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && business.blogUrl && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate mb-6">Blog</h2>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg text-slate-light mb-4">
                  Visit our blog for updates, stories, and travel tips.
                </p>
                <Button asChild className="bg-ocean-blue hover:bg-ocean-dark">
                  <a href={business.blogUrl} target="_blank" rel="noopener noreferrer">
                    Visit Blog
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simple Activity Provider Layout */}
        {!isLodge && (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-slate">{business.name}</h1>
            
            {business.businessDescription && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.businessDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {generalActivities.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-slate mb-6">Our Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generalActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-ocean-blue" />
                    <a href={`mailto:${business.contactEmail}`} className="hover:underline">
                      {business.contactEmail}
                    </a>
                  </div>
                )}
                {business.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-ocean-blue" />
                    <a href={`tel:${business.contactPhone}`} className="hover:underline">
                      {business.contactPhone}
                    </a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-ocean-blue" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {business.website}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
