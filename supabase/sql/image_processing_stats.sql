-- Create a table to track the cumulative number of processed images.
create table if not exists public.image_processing_stats (
  id text primary key,
  processed_total bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Ensure there is a default row that we can update.
insert into public.image_processing_stats (id, processed_total)
values ('global', 0)
on conflict (id) do nothing;

-- Helper function used by the job processor to increment the total.
create or replace function public.increment_processed_total(step integer default 1)
returns void
language plpgsql
as $$
begin
  insert into public.image_processing_stats (id, processed_total)
  values ('global', coalesce(step, 0))
  on conflict (id) do update
    set processed_total = public.image_processing_stats.processed_total + coalesce(step, 0),
        updated_at = now();
end;
$$;

-- Optional: allow authenticated users to read the total.
alter table public.image_processing_stats enable row level security;
create policy "Allow read access to image_processing_stats"
  on public.image_processing_stats
  for select
  to authenticated
  using (true);
