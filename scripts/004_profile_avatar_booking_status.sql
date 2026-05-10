-- Profile editing support
alter table public.users
  add column if not exists bio text check (char_length(bio) <= 500),
  add column if not exists avatar_url text;

-- Keep the historical user_type check compatible with existing app roles.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.users'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%user_type%';

  if constraint_name is not null then
    execute format('alter table public.users drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.users
  add constraint users_user_type_check
  check (user_type in ('user', 'company', 'philanthropist'));

-- Public avatar bucket. The app stores files under {auth.uid()}/filename.
insert into storage.buckets (id, name, public)
values ('user-avatars', 'user-avatars', true)
on conflict (id) do update set public = excluded.public;

create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Cancellation support for the bonus task.
alter table public.activities
  add column if not exists cancellation_policy text not null default 'moderate'
  check (cancellation_policy in ('flexible', 'moderate', 'strict'));

alter table public.bookings
  drop constraint if exists bookings_status_check,
  add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'cancelled_by_user'));

create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
