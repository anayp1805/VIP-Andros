"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActivities } from "@/lib/activities-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityCard } from "@/components/activity-card"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface RoomType {
  id: string
  name: string
  description: string
  maxOccupancy: number
  bedTypes: string
  nightlyRate: string
  amenities: string[]
  images: string[]
}

interface BusinessProfile {
  id: string
  name: string
  email: string
  businessType: 'activity' | 'lodge'
  tagline?: string
  businessDescription?: string
  businessStory?: string
  businessImages?: string[]
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  ratesInfo?: string
  policies?: string
  planningInfo?: string
  location?: string
  website?: string
  blogUrl?: string
  externalBookingLink?: string
  roomTypes?: RoomType[]
  amenities?: string[]
  checkInTime?: string
  checkOutTime?: string
  cancellationPolicy?: string
  minimumStay?: string
  houseRules?: string
  storyImage?: string
}

type TabType = 'home' | 'experiences' | 'about' | 'rates' | 'planning' | 'policy' | 'contact' | 'blog'

export default function BusinessProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { activities, getCompanyActivities } = useActivities()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('home')

  useEffect(() => {
    fetchBusinessProfile()
  }, [params.id])

  const fetchBusinessProfile = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", params.id)
        .eq("user_type", "company")
        .single()

      if (error) throw error

      if (data) {
        setBusiness({
          id: data.id,
          name: data.name,
          email: data.email,
          businessType: data.business_type || 'activity',
          tagline: data.tagline,
          businessDescription: data.business_description,
          businessStory: data.business_story,
          businessImages: data.business_images || [],
          contactPhone: data.contact_phone,
          contactEmail: data.contact_email,
          contactAddress: data.contact_address,
          ratesInfo: data.rates_info,
          policies: data.policies,
          planningInfo: data.planning_info,
          location: data.location,
          website: data.website,
          blogUrl: data.blog_url,
          externalBookingLink: data.external_booking_link,
          roomTypes: data.room_types || [],
          amenities: data.amenities || [],
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
          cancellationPolicy: data.cancellation_policy,
          minimumStay: data.minimum_stay,
          houseRules: data.house_rules,
          storyImage: data.story_image,
        })
      }
    } catch (error) {
      console.error("Error fetching business profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
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
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  const businessActivities = getCompanyActivities(business.id)
  const generalActivities = businessActivities.filter(a => a.activityType === 'general')
  const lodgeExperiences = businessActivities.filter(a => a.activityType === 'lodge-experience')

  // Lodge with tabs layout
  if (business.businessType === 'lodge') {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-ocean-blue to-ocean-dark text-white py-12">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/")} 
              className="mb-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Activities
            </Button>
            
            <h1 className="text-5xl font-bold mb-4">{business.name}</h1>
            {business.tagline && (
              <p className="text-xl italic mb-2">{business.tagline}</p>
            )}
            {business.location && (
              <p className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {business.location}
              </p>
            )}
            {business.businessDescription && (
              <p className="text-lg mt-4 max-w-3xl">{business.businessDescription}</p>
            )}
            <div className="mt-6 flex gap-4">
              {business.externalBookingLink ? (
                <Button 
                  onClick={() => window.open(business.externalBookingLink, '_blank')}
                  size="lg"
                  className="bg-white text-ocean-blue hover:bg-white/90 font-semibold"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Book Your Stay
                </Button>
              ) : (
                <Button 
                  onClick={() => setActiveTab('contact')}
                  size="lg"
                  className="bg-white text-ocean-blue hover:bg-white/90 font-semibold"
                >
                  Contact Us
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <nav className="flex gap-8 overflow-x-auto">
              {[
                { id: 'home', label: 'Home' },
                ...(lodgeExperiences.length > 0 ? [{ id: 'experiences', label: 'Experiences & Add-ons' }] : []),
                { id: 'about', label: `About ${business.name.split(' ')[0]}` },
                { id: 'rates', label: 'Rates' },
                { id: 'planning', label: 'Planning Your Trip' },
                { id: 'policy', label: 'Policy' },
                { id: 'contact', label: 'Contact' },
                ...(business.blogUrl ? [{ id: 'blog', label: 'Blog' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
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
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-12">
              {/* Image Gallery */}
              {business.businessImages && business.businessImages.length > 0 && (
                <section>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.businessImages.slice(0, 6).map((img, idx) => (
                      <div key={idx} className="relative h-64 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`${business.name} image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-3xl font-bold text-slate mb-6">Welcome to {business.name}</h2>
                {business.businessStory && (
                  <div className="prose max-w-none">
                    <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                      {business.businessStory}
                    </p>
                  </div>
                )}
              </section>

              {/* Room Types */}
              {business.roomTypes && business.roomTypes.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-slate mb-6">Accommodations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.roomTypes.map((room) => (
                      <Card key={room.id}>
                        <CardHeader>
                          <CardTitle>{room.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {room.description && (
                            <p className="text-slate-light">{room.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Max Occupancy:</span> {room.maxOccupancy} guests
                            </div>
                            {room.bedTypes && (
                              <div>
                                <span className="font-semibold">Beds:</span> {room.bedTypes}
                              </div>
                            )}
                            {room.nightlyRate && (
                              <div>
                                <span className="font-semibold">From:</span> ${room.nightlyRate}/night
                              </div>
                            )}
                          </div>
                          {room.amenities && room.amenities.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm mb-2">Room Amenities:</p>
                              <div className="flex flex-wrap gap-2">
                                {room.amenities.map((amenity, idx) => (
                                  <Badge key={idx} variant="secondary">{amenity}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Lodge Amenities */}
              {business.amenities && business.amenities.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-slate mb-6">Lodge Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {business.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                        <div className="w-2 h-2 bg-ocean-blue rounded-full" />
                        <span className="text-slate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* General Activities */}
              {generalActivities.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-slate mb-6">Activities & Tours</h2>
                  <p className="text-muted-foreground mb-6">
                    Explore the area with these activities and excursions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generalActivities.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Experiences Tab */}
          {activeTab === 'experiences' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate mb-4">Experiences & Add-ons</h2>
                <p className="text-lg text-slate-light mb-8">
                  Enhance your stay with these exclusive experiences available at {business.name}
                </p>
              </div>

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
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-slate mb-6">About {business.name}</h2>
              {business.businessStory ? (
                <div className="prose max-w-none">
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.businessStory}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No information available.</p>
              )}
            </div>
          )}

          {/* Rates Tab */}
          {activeTab === 'rates' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-slate mb-6">Rates & Pricing</h2>
              {business.ratesInfo ? (
                <div className="prose max-w-none">
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.ratesInfo}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Please contact us for current rates and availability.
                </p>
              )}
            </div>
          )}

          {/* Planning Tab */}
          {activeTab === 'planning' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-slate mb-6">Planning Your Trip</h2>
              {business.planningInfo ? (
                <div className="prose max-w-none">
                  <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                    {business.planningInfo}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No planning information available.</p>
              )}
            </div>
          )}

          {/* Policy Tab */}
          {activeTab === 'policy' && (
            <div className="max-w-4xl space-y-8">
              <h2 className="text-3xl font-bold text-slate mb-6">Policies & Important Information</h2>
              
              {/* Check-in/out Times */}
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

              {/* Minimum Stay */}
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

              {/* Cancellation Policy */}
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

              {/* House Rules */}
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

              {/* Legacy Policies Field */}
              {business.policies && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                      {business.policies}
                    </p>
                  </CardContent>
                </Card>
              )}
              {!business.checkInTime && !business.checkOutTime && !business.minimumStay && 
               !business.cancellationPolicy && !business.houseRules && !business.policies && (
                <p className="text-muted-foreground">No policies available.</p>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-slate mb-6">Contact Us</h2>
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
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-slate mb-6">Blog</h2>
              <Card>
                <CardContent className="pt-6">
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
        </div>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  // Simple activity provider layout
  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Button>

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

        {/* About Section */}
        {business.businessStory && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">About Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-light leading-relaxed whitespace-pre-line">
                {business.businessStory}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Activities */}
        {generalActivities.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate mb-6">Our Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generalActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </section>
        )}

        {/* Contact Info */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
