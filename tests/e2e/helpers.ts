import { expect, type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

type TestUserType = "user" | "company" | "philanthropist"

export const testRunId = Date.now().toString(36)

export function testEmail(prefix: string) {
  return `tokuma-${prefix}-${testRunId}@example.com`
}

export const testPassword = "Playwright123!"

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex)
    const rawValue = trimmed.slice(separatorIndex + 1)
    if (!process.env[key]) {
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "")
    }
  }
}

export function getSupabaseAdmin() {
  loadLocalEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for E2E tests.")
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function openSignup(page: Page) {
  await page.goto("/")
  await page.getByRole("button", { name: /^Sign In$/ }).click()
  await page.getByText("Sign up").click()
}

export async function signUpViaUi(page: Page, userType: TestUserType, name: string, email: string) {
  await openSignup(page)
  await page.getByRole("tab", { name: userType === "user" ? "User" : userType === "company" ? "Company" : "Philanthropist" }).click()
  await page.getByLabel("Name").fill(name)

  if (userType === "philanthropist") {
    await page.getByLabel("Access code").fill(process.env.PLAYWRIGHT_PHILANTHROPY_CODE || "TEST-CODE")
  }

  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(testPassword)
  await page.getByRole("button", { name: "Sign Up" }).click()
}

export async function createConfirmedUser(userType: TestUserType, name: string, email: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      name,
      user_type: userType,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error(`Could not create ${email}`)

  await supabase.from("users").upsert(
    {
      id: data.user.id,
      email,
      name,
      user_type: userType,
      company_experience_level: userType === "company" ? "education" : null,
    },
    { onConflict: "id" },
  )

  return data.user
}

export async function signIn(page: Page, email: string) {
  await page.goto("/")
  await page.getByRole("button", { name: /^Sign In$/ }).click()
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(testPassword)
  await page.locator("form").getByRole("button", { name: "Sign In" }).click()
  await page.locator("nav button.rounded-full").click()
  await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible()
}

export async function signOut(page: Page) {
  if (!(await page.getByRole("menuitem", { name: "Log out" }).isVisible().catch(() => false))) {
    await page.locator("nav button.rounded-full").click()
  }
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible()
}

export async function assertUserProfileExists(email: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("users").select("id, email").eq("email", email).maybeSingle()
  if (error) throw error
  expect(data?.email).toBe(email)
  return data
}
