#!/usr/bin/env npx ts-node --esm
/**
 * A3: One-shot migration — converts base64 images stored in activities.images
 * to files in the activity-images Supabase Storage bucket.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
 *   npx ts-node --esm scripts/006_migrate_images_to_storage.ts
 *
 * The service-role key bypasses RLS and is required to read all activities
 * and write to Storage on behalf of any user. Never expose this key client-side.
 *
 * Run once after deploying 005_create_image_bucket.sql.
 * Safe to re-run — already-migrated rows (no data: prefix) are skipped.
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = "activity-images"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

function base64ToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string; ext: string } {
  const [header, data] = dataUrl.split(",")
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg"
  const ext = mimeType.split("/")[1] ?? "jpg"
  const buffer = Buffer.from(data, "base64")
  return { buffer, mimeType, ext }
}

async function migrateActivity(activity: { id: string; images: string[] }) {
  const updatedImages: string[] = []
  let changed = false

  for (const img of activity.images) {
    if (!img.startsWith("data:")) {
      // Already a URL or storage path — leave untouched
      updatedImages.push(img)
      continue
    }

    const { buffer, mimeType, ext } = base64ToBuffer(img)
    const path = `${activity.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false })

    if (uploadError) {
      console.error(`  ✗ Upload failed for activity ${activity.id}:`, uploadError.message)
      updatedImages.push(img) // keep original on failure
      continue
    }

    updatedImages.push(path)
    changed = true
    console.log(`  ✓ Uploaded ${(buffer.length / 1024).toFixed(1)} KB → ${path}`)
  }

  if (!changed) return

  const { error: updateError } = await supabase
    .from("activities")
    .update({ images: updatedImages })
    .eq("id", activity.id)

  if (updateError) {
    console.error(`  ✗ DB update failed for activity ${activity.id}:`, updateError.message)
  } else {
    console.log(`  ✓ Updated activities.images for ${activity.id}`)
  }
}

async function main() {
  console.log("Fetching activities with base64 images…\n")

  // Fetch all activities; filter client-side so we can check each images element
  const { data, error } = await supabase.from("activities").select("id, images")
  if (error) {
    console.error("Failed to fetch activities:", error.message)
    process.exit(1)
  }

  const toMigrate = (data ?? []).filter((a) =>
    (a.images ?? []).some((img: string) => img.startsWith("data:")),
  )

  if (toMigrate.length === 0) {
    console.log("No base64 images found. Nothing to migrate.")
    return
  }

  console.log(`Found ${toMigrate.length} activities with base64 images.\n`)

  for (const activity of toMigrate) {
    console.log(`Migrating activity ${activity.id} (${activity.images.length} images)…`)
    await migrateActivity(activity as { id: string; images: string[] })
  }

  console.log("\nMigration complete.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
