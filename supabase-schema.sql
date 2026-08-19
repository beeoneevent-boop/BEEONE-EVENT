-- Supabase database for BeeOne Event / Eventalk
-- Run this entire file in Supabase SQL Editor.

create table if not exists public.eventalk_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.eventalk_content enable row level security;

-- The current website uses browser-side localStorage sync and does not have
-- Supabase Auth yet, so public browser access is enabled to preserve its behavior.
-- For production, replace these policies with authenticated-user policies.
drop policy if exists "public read eventalk content" on public.eventalk_content;
create policy "public read eventalk content"
on public.eventalk_content for select
to anon, authenticated
using (true);

drop policy if exists "public insert eventalk content" on public.eventalk_content;
create policy "public insert eventalk content"
on public.eventalk_content for insert
to anon, authenticated
with check (true);

drop policy if exists "public update eventalk content" on public.eventalk_content;
create policy "public update eventalk content"
on public.eventalk_content for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public delete eventalk content" on public.eventalk_content;
create policy "public delete eventalk content"
on public.eventalk_content for delete
to anon, authenticated
using (true);

grant select, insert, update, delete on public.eventalk_content to anon, authenticated;

-- Initial data migrated from db/eventalk.sqlite
insert into public.eventalk_content (key, data) values ('eventalk_categories', '[]'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
insert into public.eventalk_content (key, data) values ('eventalk_final_results', '{}'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
insert into public.eventalk_content (key, data) values ('eventalk_mark_entries', '{}'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
insert into public.eventalk_content (key, data) values ('eventalk_participants', '[]'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
insert into public.eventalk_content (key, data) values ('eventalk_programs', '[]'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
insert into public.eventalk_content (key, data) values ('eventalk_schedule', '[{"dayLabel":"Day 01","date":"Dec 21, 2019","sessions":[{"time":"09:00","title":"Opening Keynote","speaker":"Host","desc":"Welcome and introduction"}]},{"dayLabel":"Day 02","date":"Dec 22, 2019","sessions":[{"time":"10:00","title":"Workshop: Web","speaker":"John Adams","desc":"Hands-on web workshop"}]}]'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
delete from public.eventalk_content where key = 'eventalk_speakers';
insert into public.eventalk_content (key, data) values ('eventalk_speakers', '[]'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
insert into public.eventalk_content (key, data) values ('homepage', '{"programName":"Developer Conference 2019","programPlaceDate":"December 21-24, 2019. Paris, Italy","counts":{"participants":0,"programs":0,"teams":0},"services":[{"title":"Results","href":"#finalised-results-section","iconClass":"fa fa-trophy","iconStyle":"background: linear-gradient(135deg,#2ecc71,#27ae60);"},{"title":"Speakers","href":"speakers.html","iconClass":"fa fa-microphone","iconStyle":"background: linear-gradient(135deg,#34495e,#2c3e50);"},{"title":"Blog","href":"blog.html","iconClass":"fa fa-blog","iconStyle":"background: linear-gradient(135deg,#1abc9c,#16a085);"},{"title":"Team Points","href":"team-points.html","iconClass":"fa fa-users","iconStyle":"background: linear-gradient(135deg,#4cd964,#2ecc71);"},{"title":"Schedule","href":"schedule.html","iconClass":"fa fa-calendar-alt","iconStyle":"background: linear-gradient(135deg,#f1c40f,#f39c12);"}]}'::jsonb) on conflict (key) do update set data = excluded.data, updated_at = now();
