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
  addActivity: (activity: Omit<Activity, "id">) => Promise<void>
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  bookActivity: (
    activityId: string,
    userId: string,
    userName: string,
    userEmail: string,
    date: string,
    time: string,
  ) => Promise<boolean>
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
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    fetchActivities()
    if (user) fetchBookings()
  }, [user, supabase])

  const fetchActivities = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          *,
          company:users!activities_company_id_fkey(name)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        const transformedActivities: Activity[] = data.map((activity) => {
          const images =
            activity.images && activity.images.length > 0 ? activity.images : ["/diverse-group-activity.png"]
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
            availability: [],
          }
        })

        const activitiesWithSlots = await Promise.all(
          transformedActivities.map(async (activity) => {
            const { data: slots } = await supabase
              .from("availability_slots")
              .select("*")
              .eq("activity_id", activity.id)

            const availabilityMap = new Map<string, { time: string; capacity: number; booked: number }[]>()

            slots?.forEach((slot) => {
              // Compute the next occurrence of this weekday from today (A2 fix)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const daysUntil = (slot.day_of_week - today.getDay() + 7) % 7
              const date = new Date(today)
              date.setDate(today.getDate() + daysUntil)
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
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    if (!user || !supabase) return

    try {
      let combinedBookings: Record<string, unknown>[] = []

      if (user.type === "user") {
        const { data, error } = await supabase.from("bookings").select("*").eq("user_id", user.id)
        if (error) throw error
        combinedBookings = data || []
      } else if (user.type === "company") {
        const companyActivityIds = activities.filter((a) => a.companyId === user.id).map((a) => a.id)
        if (companyActivityIds.length > 0) {
          const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .in("activity_id", companyActivityIds)
          if (error) throw error
          combinedBookings = data || []
        } else {
          setBookings([])
          return
        }
      } else if (user.type === "philanthropist") {
        const { data: userBookings, error: userErr } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
        if (userErr) throw userErr

        const philanthropistActivityIds = activities.filter((a) => a.companyId === user.id).map((a) => a.id)
        let orgBookings: Record<string, unknown>[] = []
        if (philanthropistActivityIds.length > 0) {
          const { data: orgData, error: orgErr } = await supabase
            .from("bookings")
            .select("*")
            .in("activity_id", philanthropistActivityIds)
          if (orgErr) throw orgErr
          orgBookings = orgData || []
        }

        const map = new Map<string, Record<string, unknown>>()
        ;[...(userBookings || []), ...orgBookings].forEach((b) => map.set(b.id as string, b))
        combinedBookings = Array.from(map.values())
      }

      const transformedBookings: Booking[] = combinedBookings.map((booking) => ({
        id: booking.id as string,
        activityId: booking.activity_id as string,
        userId: booking.user_id as string,
        userName: booking.user_name as string,
        userEmail: booking.user_email as string,
        date: booking.date as string,
        time: booking.time_slot as string,
        status: booking.status as "confirmed" | "pending" | "cancelled",
        createdAt: booking.created_at as string,
      }))

      setBookings(transformedBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const addActivity = async (activity: Omit<Activity, "id">) => {
    if (!user || !supabase) return

    try {
      const activityId = crypto.randomUUID()

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
      })

      if (activityError) throw activityError

      const slotsToInsert = activity.availability.flatMap((av) =>
        av.slots.map((slot) => ({
          activity_id: activityId,
          day_of_week: new Date(av.date).getDay(),
          time_slot: slot.time,
          bookings_count: 0,
        })),
      )

      if (slotsToInsert.length > 0) {
        const { error: slotsError } = await supabase.from("availability_slots").insert(slotsToInsert)
        if (slotsError) throw slotsError
      }

      await fetchActivities()
    } catch (error) {
      console.error("Error adding activity:", error)
    }
  }

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    if (!supabase) return

    try {
      const updateData: Record<string, unknown> = {}

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

      const { error } = await supabase.from("activities").update(updateData).eq("id", id)
      if (error) throw error

      if (updates.availability) {
        await supabase.from("availability_slots").delete().eq("activity_id", id)

        const slotsToInsert = updates.availability.flatMap((av) =>
          av.slots.map((slot) => ({
            activity_id: id,
            day_of_week: new Date(av.date).getDay(),
            time_slot: slot.time,
            bookings_count: slot.booked || 0,
          })),
        )

        if (slotsToInsert.length > 0) {
          await supabase.from("availability_slots").insert(slotsToInsert)
        }
      }

      await fetchActivities()
    } catch (error) {
      console.error("Error updating activity:", error)
    }
  }

  const deleteActivity = async (id: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id)
      if (error) throw error
      await fetchActivities()
    } catch (error) {
      console.error("Error deleting activity:", error)
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
    if (!supabase) return false

    try {
      // A1 fix: atomic RPC — inserts booking + increments bookings_count in one transaction
      const { data, error } = await supabase.rpc("book_activity_slot", {
        p_activity_id: activityId,
        p_user_id: userId,
        p_user_name: userName,
        p_user_email: userEmail,
        p_date: date,
        p_time: time,
      })

      if (error) throw error

      if (!data?.ok) {
        // Slot is full or does not exist
        return false
      }

      await fetchActivities()
      await fetchBookings()
      return true
    } catch (error) {
      console.error("Error booking activity:", error)
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
