create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assignee text not null check (assignee in ('hyejin', 'mingyoo')),
  status text not null check (status in ('todo', 'doing', 'done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.retros (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('hyejin', 'mingyoo')),
  week_of date not null,
  good text not null,
  bad text not null,
  next_action text not null,
  created_at timestamptz not null default now(),
  unique (author, week_of)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.retros enable row level security;

-- MVP에서는 브라우저 직결을 쓰지 않으므로 policy는 만들지 않는다.
