-- Hearts on game page comments (pages/game/Discussion.tsx).
create table public.game_comment_likes (
  comment_id uuid not null references public.game_comments (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
create index game_comment_likes_user_idx on public.game_comment_likes (user_id);

alter table public.game_comment_likes enable row level security;
create policy "comment likes are public" on public.game_comment_likes for select using (true);
create policy "own comment likes" on public.game_comment_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
