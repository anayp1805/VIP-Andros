import { expect, test } from "@playwright/test"
import { assertUserProfileExists, signUpViaUi, testEmail } from "./helpers"

test("signup creates a user profile and lands logged in", async ({ page }) => {
  const email = testEmail("signup")

  await signUpViaUi(page, "user", "Playwright User", email)

  await expect(page.locator("nav button.rounded-full")).toBeVisible({ timeout: 15_000 })
  await assertUserProfileExists(email)
})
