-- A3: Create the activity-images Supabase Storage bucket.
-- Run in the Supabase SQL editor.

-- Create private bucket (objects are not publicly readable by URL alone)
insert into storage.buckets (id, name, public)
values ('activity-images', 'activity-images', false)
on conflict (id) do nothing;

-- Authenticated users (company accounts) may upload images
create policy "Authenticated users can upload activity images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'activity-images');

-- Authenticated users may update their own uploads
create policy "Authenticated users can update activity images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'activity-images');

-- Authenticated users may delete their own uploads
create policy "Authenticated users can delete activity images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'activity-images');

-- Anyone (including anonymous visitors) may read images via signed URL
-- Signed URLs are generated server-side and expire after 1 hour
create policy "Anyone can read activity images"
  on storage.objects for select
  using (bucket_id = 'activity-images');
