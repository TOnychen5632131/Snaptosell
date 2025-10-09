-- Capture bulk-edit leads submitted from the marketing banner.
create table if not exists public.bulk_leads (
  id bigserial primary key,
  email text not null,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

drop index if exists public.bulk_leads_email_idx;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bulk_leads_email_key'
  ) then
    alter table public.bulk_leads
      add constraint bulk_leads_email_key unique (email);
  end if;
end $$;

alter table public.bulk_leads enable row level security;

create policy "Allow service role management of bulk leads"
  on public.bulk_leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
