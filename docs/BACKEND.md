# Revive Mode: Backend Plan

Status: **schema ready, not yet connected.** The frontend runs entirely on `localStorage` until a Supabase project is configured. Nothing here has been run against a live database yet.

## What exists

| File | Purpose |
|---|---|
| `supabase/migrations/20261112000000_init.sql` | All tables, indexes, row-level security, storage buckets, new-user trigger |
| `supabase/gen-seed.mjs` → `supabase/seed.sql` | Seeds `games` from `web/src/data/games.ts` (32 games) |
| `web/src/lib/supabase.ts` | Client; `null` when env vars are missing |
| `web/.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

Already wired:
- **Newsletter signup** writes to `newsletter_subscribers` when keys are set.
- **Sign-in** (`lib/auth.ts`, `components/SignInModal.tsx`): email magic link, plus Google/Discord buttons that appear automatically once those providers are enabled. The navbar shows a Sign in button or the account avatar. Profile → Account Settings edits `profiles.display_name` and has Sign out.

## Data model

```
auth.users ─1:1─ profiles (settings jsonb)
                   │
   ┌───────────────┼──────────────────────────┬─────────────────────┐
library_items   collections ─< collection_games   play_sessions      save_states → storage 'saves/<uid>/…'
   │                                               │
 games ─< game_comments, game_votes                rooms ─< room_members
   │
posts (kind = discussions | challenges | creations) ─< post_replies, post_likes, challenge_entries
                                                       creations images → storage 'creations/<uid>/…'
newsletter_subscribers (insert-only)
```

### Frontend store → table mapping

| Frontend (today) | Table(s) |
|---|---|
| `data/games.ts` (`GAMES`, `FEATURED`…) | `games` (+ `featured` flag) |
| `data/gameDetails.ts` (plot, screenshots) | `games.plot / gameplay / screenshots` |
| `lib/libraryStore.ts` (myGames, collections, lastPlayed) | `library_items`, `collections`, `collection_games`, `play_sessions` |
| `lib/settingsStore.ts` | `profiles.settings` (jsonb) |
| `pages/game/ControlTable.tsx` key map | `profiles.settings.controls` |
| `data/community.ts` (posts, replies) | `posts`, `post_replies`, `post_likes`, `challenge_entries` |
| `pages/game/Discussion.tsx` comments, like/dislike | `game_comments`, `game_votes` |
| `pages/game/RoomPanel.tsx` | `rooms`, `room_members` + Realtime channel `room:<code>` |
| EmulatorJS save states (IndexedDB) | `save_states` + private `saves` bucket |

## Security model (RLS)

- **Public read:** profiles, games, comments, votes, posts, replies, likes, challenge entries.
- **Owner-only:** library, collections, play sessions, save states, settings (via `profiles`).
- **Writes:** users can only insert or edit rows where `user_id = auth.uid()`.
- **Rooms:** public open rooms are visible to everyone. Private rooms are visible to the host and members only (`is_room_member()` is SECURITY DEFINER to avoid RLS recursion). The host can kick.
- **Newsletter:** insert-only from the browser; the list is readable only with the service key.
- **Legal guardrail in the DB:** `games.rom_url` requires `rom_license` (`rom_needs_license` check).

## Setup (your side)

1. Create a free project at supabase.com and note the **Project URL** and **anon key**.
2. Apply the schema: SQL editor → paste the migration → Run. Or with the CLI:
   ```bash
   npx supabase link --project-ref <ref> && npx supabase db push
   ```
3. Seed games: run `supabase/seed.sql` in the SQL editor (regenerate it first with `node supabase/gen-seed.mjs` if `games.ts` changed).
4. Auth → Providers: enable **Google** and/or **Discord** (each needs a free OAuth app). Add `http://localhost:5173` and your Pages URL to the redirect allow-list.
5. Copy `web/.env.example` to `web/.env.local` and fill both values. In Cloudflare Pages, add the same two as environment variables.

## Wiring order (next sessions)

Each step swaps one localStorage store for Supabase, keeping the localStorage path as a fallback:

1. ~~**Auth:** sign-in modal and session hook (`useAuth()`); the navbar avatar shows the real profile.~~ Done.
2. **Games catalog:** `games` query replaces `GAMES`; search moves to the `games_search_idx` full-text index.
3. **Library + collections + continue playing.** On first login, migrate the local library to the account.
4. **Settings and controls:** stored in `profiles.settings`.
5. **Community:** posts, replies, likes; creation images upload to the `creations` bucket.
6. **Game comments and votes.**
7. **Cloud saves:** EmulatorJS save-state export → `saves` bucket + `save_states`.
8. **Rooms / netplay:** `rooms` table plus Realtime broadcast for WebRTC signaling. A TURN relay is the first paid item.

## Free-tier notes

- The free plan includes 500 MB of database, 1 GB of storage and 50k monthly active users. **Free projects pause after about a week with no activity.**
- Save states are small (KB to low MB), but cap slots per game (for example 3) to stay inside 1 GB.
- Move cover art and game files to Cloudflare R2 (no egress fees) before traffic grows. Storage URLs in `games.cover_url` / `rom_url` are plain strings, so no schema change is needed.
