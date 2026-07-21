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

update public.projects
set is_default = case when slug = 'default' then true else false end
where is_default is distinct from (slug = 'default');

create unique index if not exists projects_single_default_idx
  on public.projects (is_default)
  where is_default = true;

alter table if exists public.tasks
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

alter table if exists public.retros
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

update public.tasks
set project_id = (select id from public.projects where slug = 'default')
where project_id is null;

update public.retros
set project_id = (select id from public.projects where slug = 'default')
where project_id is null;

alter table if exists public.tasks
  alter column project_id set not null;

alter table if exists public.retros
  alter column project_id set not null;

alter table if exists public.retros
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

notify pgrst, 'reload schema';
