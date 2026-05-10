#!/usr/bin/env node
/**
 * A1 load test — fires 50 concurrent booking attempts for the same slot.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_ANON_KEY=<anon-key> \
 *   ACTIVITY_ID=<activity-id> \
 *   SLOT_DATE=2025-06-04 \
 *   SLOT_TIME="09:00" \
 *   USER_ID=<uuid> \
 *   node scripts/load-test-booking.js
 *
 * Expected output:
 *   successes (ok=true)  : <N>   ← must equal slot capacity, never more
 *   failures  (slot_full): <50-N>
 *   Total attempts       : 50
 *
 * A slot with capacity=5 should yield exactly 5 successes no matter how
 * many concurrent requests arrive.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const ACTIVITY_ID = process.env.ACTIVITY_ID
const SLOT_DATE = process.env.SLOT_DATE || "2025-06-04"
const SLOT_TIME = process.env.SLOT_TIME || "09:00"
const USER_ID = process.env.USER_ID
const CONCURRENCY = 50

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ACTIVITY_ID || !USER_ID) {
  console.error(
    "Missing required env vars: SUPABASE_URL, SUPABASE_ANON_KEY, ACTIVITY_ID, USER_ID",
  )
  process.exit(1)
}

async function bookOnce(index) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_activity_slot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      p_activity_id: ACTIVITY_ID,
      p_user_id: USER_ID,
      p_user_name: `LoadTestUser${index}`,
      p_user_email: `loadtest${index}@example.com`,
      p_date: SLOT_DATE,
      p_time: SLOT_TIME,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, error: `HTTP ${res.status}: ${text}` }
  }

  return res.json()
}

async function main() {
  console.log(`Firing ${CONCURRENCY} concurrent booking requests…`)
  console.log(`  activity_id : ${ACTIVITY_ID}`)
  console.log(`  date        : ${SLOT_DATE}`)
  console.log(`  time        : ${SLOT_TIME}`)
  console.log()

  const results = await Promise.allSettled(
    Array.from({ length: CONCURRENCY }, (_, i) => bookOnce(i)),
  )

  let successes = 0
  let slotFull = 0
  let errors = 0

  for (const result of results) {
    if (result.status === "rejected") {
      errors++
    } else if (result.value?.ok === true) {
      successes++
    } else {
      slotFull++
    }
  }

  console.log(`successes (ok=true)  : ${successes}`)
  console.log(`failures  (slot_full): ${slotFull}`)
  console.log(`network errors       : ${errors}`)
  console.log(`Total attempts       : ${CONCURRENCY}`)

  // Fetch the slot to show the final bookings_count for verification
  const slotRes = await fetch(
    `${SUPABASE_URL}/rest/v1/availability_slots?activity_id=eq.${ACTIVITY_ID}&time_slot=eq.${encodeURIComponent(SLOT_TIME)}&select=bookings_count`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    },
  )
  const slots = await slotRes.json()
  console.log()
  console.log(`DB bookings_count after test: ${JSON.stringify(slots)}`)
  console.log(`  → should equal ${successes} (no over-booking)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
