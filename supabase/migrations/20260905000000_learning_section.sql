-- Learning Section: content, progress, habits, and versioning.
-- Additive migrations for the learning section feature (002-learning-section).

-- ---------------------------------------------------------------------------
-- Content metadata (single row holding the content version)
-- ---------------------------------------------------------------------------
create table if not exists public.learning_meta (
  id int primary key default 1 check (id = 1),
  content_version int not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.learning_meta (id, content_version)
values (1, 1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Levels: stages of the curriculum.
-- ---------------------------------------------------------------------------
create table if not exists public.learning_levels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  "order" int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Topics: units of learning inside a level. Content is stored as structured
-- JSON blocks (see the authoring guide and @repo/learning block vocabulary).
-- ---------------------------------------------------------------------------
create table if not exists public.learning_topics (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.learning_levels (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  "order" int not null default 0,
  blocks jsonb not null default '[]'::jsonb,
  is_sample boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles: intro-seen flag (mirrors the existing `welcome` precedent)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists learning_intro_seen boolean not null default false;

-- ---------------------------------------------------------------------------
-- Topic progress: per-user completion of a topic (in_progress | completed).
-- ---------------------------------------------------------------------------
create table if not exists public.learning_topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id uuid not null references public.learning_topics (id) on delete cascade,
  status text not null check (status in ('in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_topic_progress_user_topic_unique unique (user_id, topic_id)
);

-- ---------------------------------------------------------------------------
-- Habit progress: per-user habit tracking (tracking | completed).
-- identity is (topic_id, habit_slug); habit_slug is an authored stable contract.
-- ---------------------------------------------------------------------------
create table if not exists public.learning_habit_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id uuid not null references public.learning_topics (id) on delete cascade,
  habit_slug text not null,
  status text not null check (status in ('tracking', 'completed')),
  tracking_started_at timestamptz,
  completed_at timestamptz,
  evaluation_note jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_habit_progress_user_habit_unique unique (user_id, topic_id, habit_slug)
);

-- ---------------------------------------------------------------------------
-- Trigger: bump the content version whenever published content changes.
-- ---------------------------------------------------------------------------
create or replace function public.bump_learning_content_version()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.learning_meta
  set content_version = content_version + 1,
      updated_at = now()
  where id = 1;
  return coalesce(new, old);
end;
$$;

drop trigger if exists learning_levels_bump_version on public.learning_levels;
create trigger learning_levels_bump_version
after insert or update on public.learning_levels
for each row
when (new.published = true)
execute function public.bump_learning_content_version();

drop trigger if exists learning_topics_bump_version on public.learning_topics;
create trigger learning_topics_bump_version
after insert or update on public.learning_topics
for each row
when (new.published = true)
execute function public.bump_learning_content_version();

-- ---------------------------------------------------------------------------
-- Trigger: habit immutability. A completed habit row can no longer change.
-- ---------------------------------------------------------------------------
create or replace function public.learning_habit_immutable()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.status = 'completed' then
    raise exception 'Completed learning habits are immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists learning_habit_progress_immutable on public.learning_habit_progress;
create trigger learning_habit_progress_immutable
before update on public.learning_habit_progress
for each row
execute function public.learning_habit_immutable();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.learning_meta enable row level security;
alter table public.learning_levels enable row level security;
alter table public.learning_topics enable row level security;
alter table public.learning_topic_progress enable row level security;
alter table public.learning_habit_progress enable row level security;

-- Content tables + meta: readable by any authenticated user, not writable by users.
create policy "Enable read for authenticated users only"
on public.learning_meta for select
to authenticated using (true);

create policy "Enable read for authenticated users only"
on public.learning_levels for select
to authenticated using (true);

create policy "Enable read for authenticated users only"
on public.learning_topics for select
to authenticated using (true);

-- Topic progress: user-scoped CRUD.
create policy "Enable insert for authenticated users only"
on public.learning_topic_progress for insert
to authenticated with check ((select auth.uid()) = user_id);

create policy "Enable users to view their own data only"
on public.learning_topic_progress for select
to authenticated using ((select auth.uid()) = user_id);

create policy "Enable update for users based on user_id"
on public.learning_topic_progress for update
to authenticated using ((select auth.uid()) = user_id);

create policy "Enable delete for users based on user_id"
on public.learning_topic_progress for delete
to authenticated using ((select auth.uid()) = user_id);

-- Habit progress: user-scoped CRUD (immutability of completed rows is a trigger).
create policy "Enable insert for authenticated users only"
on public.learning_habit_progress for insert
to authenticated with check ((select auth.uid()) = user_id);

create policy "Enable users to view their own data only"
on public.learning_habit_progress for select
to authenticated using ((select auth.uid()) = user_id);

create policy "Enable update for users based on user_id"
on public.learning_habit_progress for update
to authenticated using ((select auth.uid()) = user_id);

create policy "Enable delete for users based on user_id"
on public.learning_habit_progress for delete
to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for learning assets (infographics, illustrations, tutorials).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('learning-assets', 'learning-assets', true)
on conflict (id) do nothing;

create policy "Enable read for authenticated users only"
on storage.objects for select
to authenticated
using (bucket_id = 'learning-assets');
