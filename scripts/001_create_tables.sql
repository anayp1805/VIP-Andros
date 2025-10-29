-- Create users table (extends auth.users with user type)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  user_type text not null check (user_type in ('user', 'company')),
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;

-- Users can view their own data
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- Users can insert their own data
create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

-- Users can update their own data
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Create activities table
create table if not exists public.activities (
  id text primary key,
  company_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  tagline text,
  experience_description text not null,
  price numeric not null,
  price_per text not null,
  duration numeric not null,
  capacity integer not null default 10,
  included text[] not null default '{}',
  what_to_bring text[] not null default '{}',
  images text[] not null default '{}',
  is_available boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.activities enable row level security;

-- Everyone can view available activities
create policy "activities_select_all"
  on public.activities for select
  using (is_available = true or auth.uid() = company_id);

-- Companies can insert their own activities
create policy "activities_insert_own"
  on public.activities for insert
  with check (auth.uid() = company_id);

-- Companies can update their own activities
create policy "activities_update_own"
  on public.activities for update
  using (auth.uid() = company_id);

-- Companies can delete their own activities
create policy "activities_delete_own"
  on public.activities for delete
  using (auth.uid() = company_id);

-- Create availability slots table
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null references public.activities(id) on delete cascade,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  time_slot text not null,
  bookings_count integer not null default 0,
  created_at timestamp with time zone default now()
);

alter table public.availability_slots enable row level security;

-- Everyone can view availability slots
create policy "slots_select_all"
  on public.availability_slots for select
  using (true);

-- Companies can manage slots for their activities
create policy "slots_insert_own"
  on public.availability_slots for insert
  with check (
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.company_id = auth.uid()
    )
  );

create policy "slots_update_own"
  on public.availability_slots for update
  using (
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.company_id = auth.uid()
    )
  );

-- Create bookings table
create table if not exists public.bookings (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  user_name text not null,
  user_email text not null,
  activity_id text not null references public.activities(id) on delete cascade,
  date date not null,
  time_slot text not null,
  status text not null default 'confirmed',
  created_at timestamp with time zone default now()
);

alter table public.bookings enable row level security;

-- Users can view their own bookings
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Companies can view bookings for their activities
create policy "bookings_select_company"
  on public.bookings for select
  using (
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.company_id = auth.uid()
    )
  );

-- Users can create bookings
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Users can cancel their own bookings
create policy "bookings_delete_own"
  on public.bookings for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_activities_company_id on public.activities(company_id);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_activity_id on public.bookings(activity_id);
create index if not exists idx_availability_slots_activity_id on public.availability_slots(activity_id);
