-- Capture bulk-edit leads submitted from the marketing banner.
create table if not exists public.bulk_leads (
  id bigserial primary key,
  email text not null,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists bulk_leads_email_idx on public.bulk_leads (lower(email));

alter table public.bulk_leads enable row level security;

create policy "Allow service role management of bulk leads"
  on public.bulk_leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
