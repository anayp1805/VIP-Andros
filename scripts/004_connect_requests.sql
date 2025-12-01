-- Connect requests table for routing messages from users to companies
create table if not exists public.connect_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  company_id uuid not null references public.users(id) on delete cascade,
  company_name text not null,
  questions text not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamp with time zone default now()
);

alter table public.connect_requests enable row level security;

-- Anyone can submit a connect request (no authentication required)
create policy "connect_requests_insert_anyone"
  on public.connect_requests
  for insert
  with check (true);

-- Companies can read requests sent to them; users can read their own submissions
create policy "connect_requests_select_scoped"
  on public.connect_requests
  for select
  using (auth.uid() = company_id or auth.uid() = user_id);

-- Companies can update the status of their requests
create policy "connect_requests_update_company"
  on public.connect_requests
  for update
  using (auth.uid() = company_id);

-- Companies can delete their own requests if needed
create policy "connect_requests_delete_company"
  on public.connect_requests
  for delete
  using (auth.uid() = company_id);

create index if not exists idx_connect_requests_company_id on public.connect_requests(company_id);
create index if not exists idx_connect_requests_status on public.connect_requests(status);
create index if not exists idx_connect_requests_created_at on public.connect_requests(created_at desc);
