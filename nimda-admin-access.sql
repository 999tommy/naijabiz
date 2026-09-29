-- Run once in Supabase SQL Editor to enable durable three-strike lockouts for /nimda.
-- RLS is on and browser roles receive no table access. Only the server service role can use it.
create table if not exists public.nimda_login_attempts (
  fingerprint text primary key check (fingerprint ~ '^[a-f0-9]{64}$'),
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 3),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.nimda_login_attempts enable row level security;
revoke all on table public.nimda_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on table public.nimda_login_attempts to service_role;

create or replace function public.record_nimda_login_failure(p_fingerprint text)
returns table(failed_attempts smallint, locked_until timestamptz)
language sql
volatile
set search_path = ''
as $$
  insert into public.nimda_login_attempts as current_attempt (fingerprint, failed_attempts, locked_until, updated_at)
  values (p_fingerprint, 1, null, now())
  on conflict (fingerprint) do update set
    failed_attempts = case
      when current_attempt.locked_until is not null and current_attempt.locked_until <= now() then 1
      else least(current_attempt.failed_attempts + 1, 3)::smallint
    end,
    locked_until = case
      when current_attempt.locked_until is not null and current_attempt.locked_until <= now() then null
      when current_attempt.failed_attempts + 1 >= 3 then now() + interval '24 hours'
      else current_attempt.locked_until
    end,
    updated_at = now()
  returning current_attempt.failed_attempts, current_attempt.locked_until;
$$;

revoke all on function public.record_nimda_login_failure(text) from public, anon, authenticated;
grant execute on function public.record_nimda_login_failure(text) to service_role;


create table if not exists public.nimda_admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  subject_id uuid not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.nimda_admin_audit enable row level security;
revoke all on table public.nimda_admin_audit from public, anon, authenticated;
grant select, insert on table public.nimda_admin_audit to service_role;
