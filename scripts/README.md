# Database Scripts

Run these in order against your Supabase project (SQL editor or `psql`).

| File | Purpose |
|------|---------|
| `001_create_tables.sql` | Initial schema — users, activities, availability_slots, bookings |
| `002_create_user_trigger.sql` | Auto-creates `public.users` row on Supabase auth signup |
| `003_fix_company_name_visibility.sql` | RLS update so anyone can read company names |
| `004_book_activity_slot.sql` | Atomic booking RPC (A1 fix — eliminates race condition) |
| `005_create_image_bucket.sql` | Creates `activity-images` Supabase Storage bucket (A3) |
| `006_migrate_images_to_storage.ts` | One-shot migration of base64 images → Storage paths (A3) |

---

## Load Test (A1 — booking race condition)

Verifies that the atomic `book_activity_slot` RPC prevents over-booking even under 50 concurrent requests.

### Prerequisites

1. Deploy `004_book_activity_slot.sql` to your Supabase project.
2. Create a test activity with a slot whose capacity you know (e.g. 5).

### Run

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_ANON_KEY=your-anon-key \
ACTIVITY_ID=your-activity-id \
SLOT_DATE=2025-06-04 \
SLOT_TIME="09:00" \
USER_ID=your-user-uuid \
node scripts/load-test-booking.js
```

### Expected output (capacity = 5, 50 attempts)

```
Firing 50 concurrent booking requests…
  activity_id : abc123
  date        : 2025-06-04
  time        : 09:00

successes (ok=true)  : 5
failures  (slot_full): 45
network errors       : 0
Total attempts       : 50

DB bookings_count after test: [{"bookings_count":5}]
  → should equal 5 (no over-booking)
```

The `bookings_count` in the DB must equal the number of successes — never more — regardless of concurrency.
