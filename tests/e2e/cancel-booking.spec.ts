import { expect, test } from "@playwright/test"
import { createConfirmedUser, getSupabaseAdmin, signIn, testEmail } from "./helpers"

test("user cancels a future booking and sees it move to cancelled", async ({ page }) => {
  const userEmail = testEmail("cancel-user")
  const companyEmail = testEmail("cancel-company")
  const activityId = `cancel-${Date.now()}`
  const bookingId = `booking-${Date.now()}`
  const activityTitle = `Refund Preview ${Date.now()}`
  const bookingDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const supabase = getSupabaseAdmin()

  const company = await createConfirmedUser("company", "Cancel Company", companyEmail)
  const user = await createConfirmedUser("user", "Cancel User", userEmail)

  const { error: activityError } = await supabase.from("activities").insert({
    id: activityId,
    company_id: company.id,
    title: activityTitle,
    tagline: "Refundable workshop",
    experience_description: "Cancellation policy test activity.",
    price: 80,
    price_per: "person",
    duration: 1,
    capacity: 5,
    included: [],
    what_to_bring: [],
    images: [],
    is_available: true,
  })
  if (activityError) throw activityError

  const { error: bookingError } = await supabase.from("bookings").insert({
    id: bookingId,
    user_id: user.id,
    user_name: "Cancel User",
    user_email: userEmail,
    activity_id: activityId,
    date: bookingDate,
    time_slot: "10:00",
    status: "confirmed",
  })
  if (bookingError) throw bookingError

  await signIn(page, userEmail)
  await page.goto("/my-bookings")
  await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible()
  await expect(page.getByText(activityTitle)).toBeVisible()

  await page.getByRole("button", { name: "Cancel booking" }).click()
  await expect(page.getByText(/moderate policy: 100% refund/i)).toBeVisible()
  await page.getByRole("button", { name: "Cancel booking" }).last().click()
  await expect(page.getByText("Booking cancelled.")).toBeVisible()

  const cancelledSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Cancelled" }) })
  await expect(cancelledSection.getByText(activityTitle)).toBeVisible()

  const { data, error } = await supabase.from("bookings").select("status").eq("id", bookingId).single()
  if (error) throw error
  expect(data.status).toBe("cancelled_by_user")
})
