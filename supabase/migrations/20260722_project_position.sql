alter table if exists public.projects
  add column if not exists position integer;

with ordered as (
  select id, row_number() over (order by is_default desc, created_at asc) - 1 as rn
  from public.projects
)
update public.projects p
set position = ordered.rn
from ordered
where ordered.id = p.id
  and p.position is null;

alter table if exists public.projects
  alter column position set default 0;

alter table if exists public.projects
  alter column position set not null;

notify pgrst, 'reload schema';
