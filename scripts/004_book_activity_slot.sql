-- A1: Atomic booking function — replaces the JS read-modify-write race condition.
--
-- The function inserts the booking and increments bookings_count in a single
-- transaction. The SELECT ... FOR UPDATE on the slot row serialises concurrent
-- requests: only one transaction holds the lock at a time, so two callers
-- racing for the last slot cannot both succeed.
--
-- Run in the Supabase SQL editor or via `psql`.

create or replace function public.book_activity_slot(
  p_activity_id text,
  p_user_id     uuid,
  p_user_name   text,
  p_user_email  text,
  p_date        date,
  p_time        text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot       record;
  v_booking_id uuid;
begin
  -- Lock the matching slot row and confirm there is still capacity.
  -- extract(dow ...) returns 0=Sunday … 6=Saturday, matching day_of_week.
  select s.*
    into v_slot
    from availability_slots s
    join activities a on a.id = s.activity_id
   where s.activity_id   = p_activity_id
     and s.day_of_week   = extract(dow from p_date)::int
     and s.time_slot     = p_time
     and s.bookings_count < a.capacity
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'slot_full_or_not_found');
  end if;

  v_booking_id := gen_random_uuid();

  insert into bookings(id, user_id, user_name, user_email, activity_id, date, time_slot, status)
  values (
    v_booking_id::text,
    p_user_id,
    p_user_name,
    p_user_email,
    p_activity_id,
    p_date,
    p_time,
    'confirmed'
  );

  update availability_slots
     set bookings_count = bookings_count + 1
   where id = v_slot.id;

  return jsonb_build_object('ok', true, 'booking_id', v_booking_id);
end;
$$;
