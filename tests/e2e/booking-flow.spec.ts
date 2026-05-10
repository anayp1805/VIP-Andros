import { expect, test } from "@playwright/test"
import { createConfirmedUser, signIn, signOut, testEmail } from "./helpers"

test("company creates an activity and a user books it end-to-end", async ({ page }) => {
  const companyEmail = testEmail("company")
  const userEmail = testEmail("booker")
  const activityTitle = `Circular Workshop ${Date.now()}`
  const bookingDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  await createConfirmedUser("company", "Playwright Company", companyEmail)
  await createConfirmedUser("user", "Playwright Booker", userEmail)

  await signIn(page, companyEmail)
  await page.goto("/dashboard/new-activity")
  await page.getByLabel("Package Title").fill(activityTitle)
  await page.getByLabel("Max Capacity").fill("4")
  await page.getByLabel("Price").fill("25")
  await page.getByLabel("Per").fill("person")
  await page.getByLabel("How long will it be").fill("1")
  await page.getByLabel("What you'll do").fill("Hands-on circular economy workshop.")
  await page.getByLabel("Date").fill(bookingDate)
  await page.locator('input[type="time"]').first().fill("10:00")
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto("/activities")
  await page.reload()
  await expect(page.getByText(activityTitle)).toBeVisible()

  await signOut(page)
  await signIn(page, userEmail)
  await page.goto("/activities")
  await page.getByText(activityTitle).click()
  await page.getByRole("button", { name: /book/i }).click()
  await page.getByRole("button", { name: /select/i }).first().click()
  await page.getByRole("button", { name: "10:00" }).click()
  await page.getByRole("button", { name: /confirm booking/i }).click()
  await expect(page.getByText("Booking Confirmed!")).toBeVisible()
  await page.goto("/my-bookings")
  await expect(page.getByText(activityTitle)).toBeVisible()

  await signOut(page)
  await signIn(page, companyEmail)
  await page.goto("/dashboard")
  await expect(page.getByText(activityTitle)).toBeVisible()
  await expect(page.getByText(userEmail)).toBeVisible()
})
