import type { SupabaseClient } from "@supabase/supabase-js"

const BUCKET = "activity-images"
const SIGNED_URL_TTL = 60 * 60 // 1 hour

/**
 * Upload a File to the activity-images bucket.
 * Returns the storage path (e.g. "uuid/photo.jpg") — NOT a full URL.
 * Paths are stable; signed URLs are generated on the read path.
 */
export async function uploadActivityImage(
  supabase: SupabaseClient,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })
  if (error) throw error
  return path
}

/**
 * Resolve an image reference to a displayable URL.
 * - If it already looks like a URL (starts with http or /) return as-is.
 * - Otherwise treat it as a storage path and generate a signed URL.
 */
export async function resolveImageUrl(
  supabase: SupabaseClient,
  pathOrUrl: string,
): Promise<string> {
  if (pathOrUrl.startsWith("http") || pathOrUrl.startsWith("/")) {
    return pathOrUrl
  }
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(pathOrUrl, SIGNED_URL_TTL)
  if (error || !data?.signedUrl) return pathOrUrl
  return data.signedUrl
}

/** Batch-resolve an array of image references. */
export async function resolveImageUrls(
  supabase: SupabaseClient,
  paths: string[],
): Promise<string[]> {
  return Promise.all(paths.map((p) => resolveImageUrl(supabase, p)))
}
