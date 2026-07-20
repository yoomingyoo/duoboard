create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.projects (slug, name, is_default)
values ('default', '기본 프로젝트', true)
on conflict (slug) do update
set name = excluded.name,
    is_default = true;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  assignee text not null check (assignee in ('hyejin', 'mingyoo')),
  status text not null check (status in ('todo', 'doing', 'done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.retros (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  author text not null check (author in ('hyejin', 'mingyoo')),
  week_of date not null,
  good text not null,
  bad text not null,
  next_action text not null,
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

alter table public.retros
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

update public.tasks
set project_id = (select id from public.projects where slug = 'default')
where project_id is null;

update public.retros
set project_id = (select id from public.projects where slug = 'default')
where project_id is null;

alter table public.tasks
  alter column project_id set not null;

alter table public.retros
  alter column project_id set not null;

alter table public.retros
  drop constraint if exists retros_author_week_of_key;

create unique index if not exists retros_project_author_week_key
  on public.retros(project_id, author, week_of);

create index if not exists tasks_project_status_position_idx
  on public.tasks(project_id, status, position);

create index if not exists retros_project_week_idx
  on public.retros(project_id, week_of desc, created_at desc);

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

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.retros enable row level security;

-- MVP에서는 브라우저 직결을 쓰지 않으므로 policy는 만들지 않는다.
