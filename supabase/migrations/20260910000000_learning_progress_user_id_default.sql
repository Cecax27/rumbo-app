-- Fix: learning progress tables were missing the auth.uid() default on
-- user_id that every other user-scoped table has. The client never supplies
-- user_id, relying on the DB default + RLS (`auth.uid() = user_id`). Without
-- the default the column was NULL on insert, failing RLS with 403.
alter table public.learning_topic_progress
  alter column user_id set default auth.uid();

alter table public.learning_habit_progress
  alter column user_id set default auth.uid();
