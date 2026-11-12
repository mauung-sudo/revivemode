-- Revive Mode: initial schema (Supabase / Postgres 15+)
-- Apply with:  supabase db push   (or paste into the SQL editor)
--
-- Maps 1:1 to the frontend stores that currently live in localStorage:
--   web/src/data/games.ts        -> games
--   web/src/lib/libraryStore.ts  -> library_items, collections, collection_games, play_sessions
--   web/src/lib/settingsStore.ts -> profiles.settings
--   web/src/data/community.ts    -> posts, post_replies, post_likes, challenge_entries
--   game page comments / votes   -> game_comments, game_votes
--   rooms panel                  -> rooms, room_members
--   newsletter form              -> newsletter_subscribers

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text not null,
  avatar_url   text,
  level        int  not null default 1,
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- Create a profile row for every new auth user.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare base text := regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1), 'player'), '[^A-Za-z0-9_]', '', 'g');
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(base, ''), 'player'), 14) || '_' || substr(new.id::text, 1, 5),
    coalesce(new.raw_user_meta_data->>'full_name', base, 'Player'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------- games
create table public.games (
  id          text primary key,                       -- slug, e.g. 'super-mario-bros'
  title       text not null,
  platform    text not null,
  genre       text not null,
  year        int,
  players     int  not null default 1,
  cover_url   text not null,
  rom_url     text,                                   -- only for redistributable games
  rom_license text,                                   -- SPDX id or written permission note
  publisher   text,
  series      text,
  plot        text,
  gameplay    text,
  screenshots text[] not null default '{}',
  featured    boolean not null default false,
  created_at  timestamptz not null default now(),
  -- Legal guardrail: a hosted ROM must carry its license.
  constraint rom_needs_license check (rom_url is null or rom_license is not null)
);
create index games_platform_idx on public.games (platform);
create index games_genre_idx on public.games (genre);
create index games_search_idx on public.games using gin (to_tsvector('simple', title || ' ' || platform || ' ' || genre));

create table public.game_votes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id) on delete cascade,
  value   smallint not null check (value in (-1, 1)),
  primary key (user_id, game_id)
);

create table public.game_comments (
  id         uuid primary key default gen_random_uuid(),
  game_id    text not null references public.games (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  parent_id  uuid references public.game_comments (id) on delete cascade,
  body       text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index game_comments_game_idx on public.game_comments (game_id, created_at desc);

-- ----------------------------------------------------------- library
create table public.library_items (
  user_id  uuid not null references public.profiles (id) on delete cascade,
  game_id  text not null references public.games (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table public.collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  name       text not null check (length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.collection_games (
  collection_id uuid not null references public.collections (id) on delete cascade,
  game_id       text not null references public.games (id) on delete cascade,
  position      int  not null default 0,
  primary key (collection_id, game_id)
);

-- "Continue playing" + hours played.
create table public.play_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  game_id    text not null references public.games (id) on delete cascade,
  started_at timestamptz not null default now(),
  seconds    int not null default 0
);
create index play_sessions_user_idx on public.play_sessions (user_id, started_at desc);

-- Save-state metadata; the file lives in the private 'saves' storage bucket
-- at saves/<user_id>/<game_id>/<slot>.state
create table public.save_states (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  game_id      text not null,   -- not FK: BYOR games may not be in the catalog
  slot         int  not null default 0,
  storage_path text not null,
  updated_at   timestamptz not null default now(),
  unique (user_id, game_id, slot)
);

-- --------------------------------------------------------------- community
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('discussions', 'challenges', 'creations')),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (length(title) between 3 and 80),
  body        text not null default '',
  tags        text[] not null default '{}',
  images      text[] not null default '{}',   -- creations: public 'creations' bucket URLs
  views       int not null default 0,
  -- challenges only
  game_title  text,
  difficulty  text check (difficulty in ('EZ', 'Medium', 'Hard', 'Extreme')),
  points      int,
  badge_name  text,
  rules       text[] not null default '{}',
  created_at  timestamptz not null default now(),
  constraint challenge_fields check (kind <> 'challenges' or (game_title is not null and difficulty is not null))
);
create index posts_kind_idx on public.posts (kind, created_at desc);
create index posts_tags_idx on public.posts using gin (tags);

create table public.post_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  parent_id  uuid references public.post_replies (id) on delete cascade,
  body       text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index post_replies_post_idx on public.post_replies (post_id, created_at);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (post_id, user_id)
);

create table public.challenge_entries (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  proof_url  text,
  score      int,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create view public.post_stats with (security_invoker = true) as
select p.id,
       (select count(*) from public.post_likes l where l.post_id = p.id)        as likes,
       (select count(*) from public.post_replies r where r.post_id = p.id)      as replies,
       (select count(*) from public.challenge_entries e where e.post_id = p.id) as competitors
from public.posts p;

-- ------------------------------------------------------------------- rooms
-- Netplay rooms. Signaling (WebRTC offers/answers) goes over Supabase
-- Realtime broadcast on channel 'room:<code>'; only membership is stored.
create table public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null check (code ~ '^[A-Z0-9]{6}$'),
  game_id     text references public.games (id) on delete set null,
  host_id     uuid not null references public.profiles (id) on delete cascade,
  name        text not null default 'Room',
  is_public   boolean not null default true,
  max_players int not null default 4 check (max_players between 2 and 4),
  created_at  timestamptz not null default now(),
  closed_at   timestamptz
);

create table public.room_members (
  room_id   uuid not null references public.rooms (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- -------------------------------------------------------------- newsletter
create table public.newsletter_subscribers (
  email      text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ===================================================== row-level security
alter table public.profiles               enable row level security;
alter table public.games                  enable row level security;
alter table public.game_votes             enable row level security;
alter table public.game_comments          enable row level security;
alter table public.library_items          enable row level security;
alter table public.collections            enable row level security;
alter table public.collection_games       enable row level security;
alter table public.play_sessions          enable row level security;
alter table public.save_states            enable row level security;
alter table public.posts                  enable row level security;
alter table public.post_replies           enable row level security;
alter table public.post_likes             enable row level security;
alter table public.challenge_entries      enable row level security;
alter table public.rooms                  enable row level security;
alter table public.room_members           enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Membership check used by room policies. SECURITY DEFINER avoids RLS
-- recursion (a room_members policy can't query room_members directly).
create function public.is_room_member(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.room_members where room_id = rid and user_id = auth.uid())
$$;

-- Public reads
create policy "profiles are public"      on public.profiles      for select using (true);
create policy "games are public"         on public.games         for select using (true);
create policy "votes are public"         on public.game_votes    for select using (true);
create policy "game comments are public" on public.game_comments for select using (true);
create policy "posts are public"         on public.posts         for select using (true);
create policy "replies are public"       on public.post_replies  for select using (true);
create policy "likes are public"         on public.post_likes    for select using (true);
create policy "entries are public"       on public.challenge_entries for select using (true);
create policy "open public rooms are visible" on public.rooms for select
  using ((is_public and closed_at is null) or host_id = auth.uid() or public.is_room_member(id));
create policy "room members are visible to members" on public.room_members for select
  using (public.is_room_member(room_members.room_id));

-- Own rows only
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "own votes"    on public.game_votes    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "write own game comments"  on public.game_comments for insert with check (user_id = auth.uid());
create policy "delete own game comments" on public.game_comments for delete using (user_id = auth.uid());

create policy "own library"     on public.library_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own collections" on public.collections   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own collection games" on public.collection_games for all
  using (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()));
create policy "own play sessions" on public.play_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own save states"   on public.save_states   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "create own posts" on public.posts for insert with check (user_id = auth.uid());
create policy "edit own posts"   on public.posts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own posts" on public.posts for delete using (user_id = auth.uid());
create policy "create own replies" on public.post_replies for insert with check (user_id = auth.uid());
create policy "delete own replies" on public.post_replies for delete using (user_id = auth.uid());
create policy "own likes" on public.post_likes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "submit own entries" on public.challenge_entries for insert with check (user_id = auth.uid() and status = 'pending');

create policy "host creates rooms" on public.rooms for insert with check (host_id = auth.uid());
create policy "host manages rooms" on public.rooms for update using (host_id = auth.uid());
create policy "host deletes rooms" on public.rooms for delete using (host_id = auth.uid());
create policy "join rooms" on public.room_members for insert with check (user_id = auth.uid());
create policy "leave or kick" on public.room_members for delete
  using (user_id = auth.uid() or exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid()));

-- Anyone may subscribe; nobody can read the list through the API.
create policy "anyone can subscribe" on public.newsletter_subscribers for insert with check (true);

-- ================================================================ storage
insert into storage.buckets (id, name, public) values ('saves', 'saves', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('creations', 'creations', true) on conflict do nothing;

create policy "own save files" on storage.objects for all
  using (bucket_id = 'saves' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'saves' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "creation images are public" on storage.objects for select using (bucket_id = 'creations');
create policy "upload own creation images" on storage.objects for insert
  with check (bucket_id = 'creations' and (storage.foldername(name))[1] = auth.uid()::text);
