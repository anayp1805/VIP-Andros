"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { LodgeProfileForm } from "@/components/lodge-profile-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false)
  const [pendingBusinessType, setPendingBusinessType] = useState<'activity' | 'lodge' | null>(null)

  const [businessType, setBusinessType] = useState<'activity' | 'lodge'>('activity')
  const [businessDescription, setBusinessDescription] = useState("")
  const [businessStory, setBusinessStory] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactAddress, setContactAddress] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [ratesInfo, setRatesInfo] = useState("")
  const [policies, setPolicies] = useState("")
  const [planningInfo, setPlanningInfo] = useState("")
  const [blogUrl, setBlogUrl] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }

    if (user && user.type !== "company") {
      router.push("/")
    }

    if (user) {
      setBusinessType(user.businessType || 'activity')
      setBusinessDescription(user.businessDescription || "")
      setBusinessStory(user.businessStory || "")
      setContactPhone(user.contactPhone || "")
      setContactEmail(user.contactEmail || user.email)
      setContactAddress(user.contactAddress || "")
      setLocation(user.location || "")
      setWebsite(user.website || "")
      setRatesInfo(user.ratesInfo || "")
      setPolicies(user.policies || "")
      setPlanningInfo(user.planningInfo || "")
      setBlogUrl(user.blogUrl || "")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({
          business_type: businessType,
          business_description: businessDescription,
          business_story: businessStory,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          contact_address: contactAddress,
          location: location,
          website: website,
          rates_info: ratesInfo,
          policies: policies,
          planning_info: planningInfo,
          blog_url: blogUrl,
        })
        .eq("id", user.id)

      if (error) throw error

      alert("Profile updated successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleLodgeSubmit = async (lodgeData: any) => {
    if (!user) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({
          business_type: 'lodge',
          name: lodgeData.name,
          tagline: lodgeData.tagline,
          business_description: lodgeData.description,
          location: lodgeData.location,
          contact_email: lodgeData.contactEmail,
          contact_phone: lodgeData.contactPhone,
          website: lodgeData.website,
          external_booking_link: lodgeData.externalBookingLink,
          room_types: lodgeData.roomTypes,
          amenities: lodgeData.amenities,
          business_images: lodgeData.images,
          check_in_time: lodgeData.checkInTime,
          check_out_time: lodgeData.checkOutTime,
          cancellation_policy: lodgeData.cancellationPolicy,
          minimum_stay: lodgeData.minimumStay,
          house_rules: lodgeData.houseRules,
          business_story: lodgeData.ourStory,
          story_image: lodgeData.ourStoryImage,
        })
        .eq("id", user.id)

      if (error) throw error

      alert("Lodge profile updated successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating lodge profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user || user.type !== "company") {
    return null
  }

  // If user is a lodge, show the comprehensive lodge form
  if (businessType === 'lodge') {
    const lodgeInitialData = {
      name: user?.name || "",
      tagline: user?.tagline || "",
      description: businessDescription,
      location: location,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      website: website,
      externalBookingLink: user?.externalBookingLink || "",
      roomTypes: user?.roomTypes || [],
      amenities: user?.amenities || [],
      images: user?.businessImages || [],
      checkInTime: user?.checkInTime || "",
      checkOutTime: user?.checkOutTime || "",
      cancellationPolicy: user?.cancellationPolicy || "",
      minimumStay: user?.minimumStay || "",
      houseRules: user?.houseRules || "",
      ourStory: businessStory,
      ourStoryImage: user?.storyImage || "",
    }

    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />

        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate mb-8">Edit Lodge Profile</h1>

          <LodgeProfileForm
            initialData={lodgeInitialData}
            onSubmit={handleLodgeSubmit}
            onCancel={() => router.push("/dashboard")}
            onBusinessTypeChange={(type) => {
              if (type === 'activity') {
                setPendingBusinessType(type)
                setShowTypeChangeWarning(true)
              }
            }}
          />
        </div>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        
        {/* Business Type Change Warning */}
        {showTypeChangeWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle>Switch to Activity Provider?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-light">
                  Switching to Activity Provider will show a simpler form. Your lodge information won't be lost, but you'll need to switch back to Lodge to edit it.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTypeChangeWarning(false)
                      setPendingBusinessType(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (pendingBusinessType) {
                        setBusinessType(pendingBusinessType)
                      }
                      setShowTypeChangeWarning(false)
                      setPendingBusinessType(null)
                    }}
                    className="bg-ocean-blue hover:bg-ocean-dark"
                  >
                    Switch to Activity Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Activity provider form (simplified)
  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold text-slate mb-8">Edit Business Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Type */}
          <Card>
            <CardHeader>
              <CardTitle>Business Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-type">What type of business are you? *</Label>
                <select
                  id="business-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as 'activity' | 'lodge')}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="activity">Activity Provider (Tours, Excursions)</option>
                  <option value="lodge">Lodge/Accommodation</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Lodges get a full profile page with tabs. Activity providers get a simple business page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="A brief description of your business..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">About Us / Our Story</Label>
                <Textarea
                  id="story"
                  value={businessStory}
                  onChange={(e) => setBusinessStory(e.target.value)}
                  placeholder="Tell your story..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Andros, Bahamas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (242) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea
                  id="contact-address"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="Your business address..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lodge-Specific Fields */}
          {businessType === 'lodge' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Rates & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="rates">Rates Information</Label>
                    <Textarea
                      id="rates"
                      value={ratesInfo}
                      onChange={(e) => setRatesInfo(e.target.value)}
                      placeholder="Describe your room rates, packages, seasonal pricing, etc..."
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="policies">Policies</Label>
                    <Textarea
                      id="policies"
                      value={policies}
                      onChange={(e) => setPolicies(e.target.value)}
                      placeholder="Cancellation policy, check-in/out times, house rules, etc..."
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Planning Your Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="planning">Trip Planning Information</Label>
                    <Textarea
                      id="planning"
                      value={planningInfo}
                      onChange={(e) => setPlanningInfo(e.target.value)}
                      placeholder="How to get here, what to bring, best time to visit, etc..."
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blog</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="blog">Blog URL</Label>
                    <Input
                      id="blog"
                      type="url"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      placeholder="https://yourblog.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to your external blog or leave empty if you don't have one.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center pb-8">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-ocean-blue hover:bg-ocean-dark min-w-[200px]"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
