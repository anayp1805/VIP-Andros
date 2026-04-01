"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { LodgeProfileForm } from "@/components/lodge-profile-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetupLodgePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingData, setExistingData] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    if (user.type !== 'company') {
      router.push('/dashboard')
      return
    }

    fetchExistingLodgeData()
  }, [user, router])

  const fetchExistingLodgeData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching lodge data:', error)
        // Don't throw - just set loading to false and continue
        setLoading(false)
        return
      }

      if (data) {
        setExistingData({
          name: data.name,
          tagline: data.tagline,
          description: data.business_description,
          location: data.location,
          contactEmail: data.contact_email || user.email,
          contactPhone: data.contact_phone,
          website: data.website,
          externalBookingLink: data.external_booking_link,
          roomTypes: data.room_types || [],
          amenities: data.amenities || [],
          images: data.business_images || [],
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
          cancellationPolicy: data.cancellation_policy,
          minimumStay: data.minimum_stay,
          houseRules: data.house_rules,
          ourStory: data.business_story,
          ourStoryImage: data.story_image,
        })
      }
    } catch (error) {
      console.error('Error fetching lodge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    if (!user) return

    try {
      const supabase = createClient()
      
      const updateData = {
        name: data.name,
        tagline: data.tagline,
        business_description: data.description,
        business_story: data.ourStory,
        business_type: 'lodge',
        location: data.location,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        contact_address: data.contactAddress,
        website: data.website,
        blog_url: data.blogUrl,
        business_images: data.images,
        external_booking_link: data.externalBookingLink,
        room_types: data.roomTypes,
        amenities: data.amenities,
        check_in_time: data.checkInTime,
        check_out_time: data.checkOutTime,
        cancellation_policy: data.cancellationPolicy,
        minimum_stay: data.minimumStay,
        house_rules: data.houseRules,
        story_image: data.ourStoryImage,
        rates_info: data.ratesInfo,
        planning_info: data.planningInfo,
        policies: data.policies,
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      alert('Lodge profile saved successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving lodge profile:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      alert(`Error saving lodge profile: ${errorMessage}\n\nCheck the browser console for details.`)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-slate mb-4">Please Log In</h1>
          <p className="text-lg text-muted-foreground mb-6">
            You need to be logged in as a company to set up a lodge profile.
          </p>
          <Button onClick={() => setShowAuthModal(true)}>Log In</Button>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  if (user.type !== 'company') {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-slate mb-4">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Only company accounts can set up lodge profiles.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate mb-2">
            {existingData ? 'Edit Lodge Profile' : 'Set Up Your Lodge Profile'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Fill out your comprehensive lodge profile to attract guests
          </p>
        </div>

        <LodgeProfileForm
          initialData={existingData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
