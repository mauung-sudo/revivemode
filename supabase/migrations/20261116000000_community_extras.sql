-- Community leftovers (web/src/data/community.ts):
--   * likes on replies (post_reply_likes)
--   * view counts: anyone may bump posts.views by one through a function,
--     since the posts update policy only lets the author edit their own row.

create table public.post_reply_likes (
  reply_id   uuid not null references public.post_replies (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id)
);
create index post_reply_likes_user_idx on public.post_reply_likes (user_id);

alter table public.post_reply_likes enable row level security;
create policy "reply likes are public" on public.post_reply_likes for select using (true);
create policy "own reply likes" on public.post_reply_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- One view per call; the site calls it once per post page visit per browser session.
create function public.bump_post_view(pid uuid) returns void
language sql security definer set search_path = public as $$
  update public.posts set views = views + 1 where id = pid;
$$;
revoke all on function public.bump_post_view(uuid) from public;
grant execute on function public.bump_post_view(uuid) to anon, authenticated;
