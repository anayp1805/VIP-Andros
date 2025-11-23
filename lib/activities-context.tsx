"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

export interface Activity {
  id: string
  companyId: string
  companyName: string
  title: string
  tagline: string
  experienceDescription: string
  price: number
  pricePer: string
  duration: string
  capacity: number
  included: string[]
  whatToBring: string[]
  images: string[]
  isAvailable: boolean
  availability: {
    date: string
    slots: { time: string; capacity: number; booked: number }[]
  }[]
  ourStory?: string
  ourStoryImage?: string
  activityType: 'general' | 'lodge-experience'
}

export interface Booking {
  id: string
  activityId: string
  userId: string
  userName: string
  userEmail: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  createdAt: string
}

interface ActivitiesContextType {
  activities: Activity[]
  bookings: Booking[]
  addActivity: (activity: Omit<Activity, "id">) => void
  updateActivity: (id: string, activity: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  bookActivity: (
    activityId: string,
    userId: string,
    userName: string,
    userEmail: string,
    date: string,
    time: string,
  ) => boolean
  getCompanyActivities: (companyId: string) => Activity[]
  getUserBookings: (userId: string) => Booking[]
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined)

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
      console.log("[v0] Activities: Supabase client created successfully")
    } catch (error) {
      console.error("[v0] Activities: Failed to create Supabase client:", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    fetchActivities()
    if (user) {
      fetchBookings()
    }
  }, [user, supabase])

  const fetchActivities = async () => {
    if (!supabase) {
      console.error("[v0] Activities: Supabase client not initialized")
      return
    }

    try {
      console.log("[v0] Activities: Fetching activities...")
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          *,
          company:users!activities_company_id_fkey(name)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Activities: Error fetching activities:", error)
        throw error
      }

      if (data) {
        console.log("[v0] Activities: Found", data.length, "activities")
        console.log("[v0] Activities: Raw data from database:", JSON.stringify(data, null, 2))
        // Transform database format to app format
        const transformedActivities: Activity[] = data.map((activity) => {
          const images =
            activity.images && activity.images.length > 0 ? activity.images : ["/diverse-group-activity.png"]
          console.log(`[v0] Activities: Activity "${activity.title}" images:`, images)
          console.log(`[v0] Activities: Activity "${activity.title}" company data:`, activity.company)
          return {
            id: activity.id,
            companyId: activity.company_id,
            companyName: activity.company?.name || "Unknown Company",
            title: activity.title,
            tagline: activity.tagline || "",
            experienceDescription: activity.experience_description,
            price: Number(activity.price),
            pricePer: activity.price_per,
            duration: String(activity.duration),
            capacity: activity.capacity,
            included: activity.included || [],
            whatToBring: activity.what_to_bring || [],
            images,
            isAvailable: activity.is_available,
            availability: [], // Will be populated from availability_slots
            ourStory: activity.our_story || "",
            ourStoryImage: activity.our_story_image || "",
            activityType: activity.activity_type || 'general',
          }
        })

        // Fetch availability slots for each activity
        const activitiesWithSlots = await Promise.all(
          transformedActivities.map(async (activity) => {
            const { data: slots } = await supabase.from("availability_slots").select("*").eq("activity_id", activity.id)

            // Group slots by date
            const availabilityMap = new Map<string, { time: string; capacity: number; booked: number }[]>()

            slots?.forEach((slot) => {
              const date = new Date()
              date.setDate(date.getDate() + slot.day_of_week)
              const dateStr = date.toISOString().split("T")[0]

              if (!availabilityMap.has(dateStr)) {
                availabilityMap.set(dateStr, [])
              }

              availabilityMap.get(dateStr)!.push({
                time: slot.time_slot,
                capacity: activity.capacity,
                booked: slot.bookings_count,
              })
            })

            const availability = Array.from(availabilityMap.entries()).map(([date, slots]) => ({
              date,
              slots,
            }))

            return { ...activity, availability }
          }),
        )

        setActivities(activitiesWithSlots)
        console.log("[v0] Activities: Successfully loaded", activitiesWithSlots.length, "activities with slots")
      }
    } catch (error) {
      console.error("[v0] Activities: Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    if (!user || !supabase) return

    try {
      console.log("[v0] Activities: Fetching bookings for user type:", user.type)
      let query = supabase.from("bookings").select("*")

      if (user.type === "user") {
        // Users see their own bookings
        query = query.eq("user_id", user.id)
      } else if (user.type === "company") {
        // Companies see bookings for their activities
        const companyActivityIds = activities.filter((a) => a.companyId === user.id).map((a) => a.id)
        if (companyActivityIds.length > 0) {
          query = query.in("activity_id", companyActivityIds)
        } else {
          // No activities yet, return empty
          console.log("[v0] Activities: No activities found for company")
          setBookings([])
          return
        }
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Activities: Error fetching bookings:", error)
        throw error
      }

      if (data) {
        console.log("[v0] Activities: Found", data.length, "bookings")
        const transformedBookings: Booking[] = data.map((booking) => ({
          id: booking.id,
          activityId: booking.activity_id,
          userId: booking.user_id,
          userName: booking.user_name,
          userEmail: booking.user_email,
          date: booking.date,
          time: booking.time_slot,
          status: booking.status as "confirmed" | "pending" | "cancelled",
          createdAt: booking.created_at,
        }))

        setBookings(transformedBookings)
      }
    } catch (error) {
      console.error("[v0] Activities: Error fetching bookings:", error)
    }
  }

  const addActivity = async (activity: Omit<Activity, "id">) => {
    if (!user || !supabase) {
      console.error("[v0] Activities: Cannot add activity - user or supabase not initialized")
      return
    }

    try {
      console.log("[v0] Activities: Adding new activity:", activity.title)
      console.log("[v0] Activities: Images being saved:", activity.images)
      const activityId = Math.random().toString(36).substr(2, 9)

      // Insert activity
      const { error: activityError } = await supabase.from("activities").insert({
        id: activityId,
        company_id: user.id,
        title: activity.title,
        tagline: activity.tagline,
        experience_description: activity.experienceDescription,
        price: activity.price,
        price_per: activity.pricePer,
        duration: Number(activity.duration),
        capacity: activity.capacity,
        included: activity.included,
        what_to_bring: activity.whatToBring,
        images: activity.images,
        is_available: activity.isAvailable,
        our_story: activity.ourStory || null,
        our_story_image: activity.ourStoryImage || null,
        activity_type: activity.activityType || 'general',
      })

      if (activityError) {
        console.error("[v0] Activities: Error inserting activity:", activityError)
        throw activityError
      }

      // Insert availability slots
      const slotsToInsert = activity.availability.flatMap((av) =>
        av.slots.map((slot) => {
          const dayOfWeek = new Date(av.date).getDay()
          return {
            activity_id: activityId,
            day_of_week: dayOfWeek,
            time_slot: slot.time,
            bookings_count: 0,
          }
        }),
      )

      if (slotsToInsert.length > 0) {
        const { error: slotsError } = await supabase.from("availability_slots").insert(slotsToInsert)
        if (slotsError) {
          console.error("[v0] Activities: Error inserting slots:", slotsError)
          throw slotsError
        }
      }

      console.log("[v0] Activities: Successfully added activity")
      // Refresh activities
      await fetchActivities()
    } catch (error) {
      console.error("[v0] Activities: Error adding activity:", error)
    }
  }

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    if (!supabase) {
      console.error("[v0] Activities: Cannot update activity - supabase not initialized")
      return
    }

    try {
      console.log("[v0] Activities: Updating activity:", id)
      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.tagline !== undefined) updateData.tagline = updates.tagline
      if (updates.experienceDescription !== undefined) updateData.experience_description = updates.experienceDescription
      if (updates.price !== undefined) updateData.price = updates.price
      if (updates.pricePer !== undefined) updateData.price_per = updates.pricePer
      if (updates.duration !== undefined) updateData.duration = Number(updates.duration)
      if (updates.capacity !== undefined) updateData.capacity = updates.capacity
      if (updates.included !== undefined) updateData.included = updates.included
      if (updates.whatToBring !== undefined) updateData.what_to_bring = updates.whatToBring
      if (updates.images !== undefined) updateData.images = updates.images
      if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable
      if (updates.ourStory !== undefined) updateData.our_story = updates.ourStory
      if (updates.ourStoryImage !== undefined) updateData.our_story_image = updates.ourStoryImage
      if (updates.activityType !== undefined) updateData.activity_type = updates.activityType

      const { error } = await supabase.from("activities").update(updateData).eq("id", id)

      if (error) {
        console.error("[v0] Activities: Error updating activity:", error)
        throw error
      }

      // Update availability slots if provided
      if (updates.availability) {
        // Delete existing slots
        await supabase.from("availability_slots").delete().eq("activity_id", id)

        // Insert new slots
        const slotsToInsert = updates.availability.flatMap((av) =>
          av.slots.map((slot) => {
            const dayOfWeek = new Date(av.date).getDay()
            return {
              activity_id: id,
              day_of_week: dayOfWeek,
              time_slot: slot.time,
              bookings_count: slot.booked || 0,
            }
          }),
        )

        if (slotsToInsert.length > 0) {
          await supabase.from("availability_slots").insert(slotsToInsert)
        }
      }

      console.log("[v0] Activities: Successfully updated activity")
      await fetchActivities()
    } catch (error) {
      console.error("[v0] Activities: Error updating activity:", error)
    }
  }

  const deleteActivity = async (id: string) => {
    if (!supabase) {
      console.error("[v0] Activities: Cannot delete activity - supabase not initialized")
      return
    }

    try {
      console.log("[v0] Activities: Deleting activity:", id)
      const { error } = await supabase.from("activities").delete().eq("id", id)

      if (error) {
        console.error("[v0] Activities: Error deleting activity:", error)
        throw error
      }

      console.log("[v0] Activities: Successfully deleted activity")
      await fetchActivities()
    } catch (error) {
      console.error("[v0] Activities: Error deleting activity:", error)
    }
  }

  const bookActivity = async (
    activityId: string,
    userId: string,
    userName: string,
    userEmail: string,
    date: string,
    time: string,
  ): Promise<boolean> => {
    if (!supabase) {
      console.error("[v0] Activities: Cannot book activity - supabase not initialized")
      return false
    }

    try {
      console.log("[v0] Activities: Booking activity:", activityId, "for user:", userName)
      const bookingId = Math.random().toString(36).substr(2, 9)

      // Insert booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        id: bookingId,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        activity_id: activityId,
        date,
        time_slot: time,
        status: "confirmed",
      })

      if (bookingError) {
        console.error("[v0] Activities: Error creating booking:", bookingError)
        throw bookingError
      }

      // Update slot booking count
      const dayOfWeek = new Date(date).getDay()
      const { data: slot } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("activity_id", activityId)
        .eq("day_of_week", dayOfWeek)
        .eq("time_slot", time)
        .single()

      if (slot) {
        await supabase
          .from("availability_slots")
          .update({ bookings_count: slot.bookings_count + 1 })
          .eq("id", slot.id)
      }

      console.log("[v0] Activities: Successfully booked activity")
      // Refresh data
      await fetchActivities()
      await fetchBookings()

      return true
    } catch (error) {
      console.error("[v0] Activities: Error booking activity:", error)
      return false
    }
  }

  const getCompanyActivities = (companyId: string) => {
    return activities.filter((a) => a.companyId === companyId)
  }

  const getUserBookings = (userId: string) => {
    return bookings.filter((b) => b.userId === userId)
  }

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        bookings,
        addActivity,
        updateActivity,
        deleteActivity,
        bookActivity,
        getCompanyActivities,
        getUserBookings,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  )
}

export function useActivities() {
  const context = useContext(ActivitiesContext)
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider")
  }
  return context
}
