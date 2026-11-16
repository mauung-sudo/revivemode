# Study: RetroAchievements and where ReviveMode fits

_2026-11-15. Sources: RetroAchievements' public code (github.com/RetroAchievements), their docs, and press coverage. The main site (retroachievements.org) sits behind a Cloudflare bot check, so I couldn't click through it live. The page flows below come from the site's code._

## In one line

RetroAchievements (RA) adds Xbox-style achievements to old games played in emulators you install yourself. It does not host games, and you don't play on its website. The website is the scoreboard, the community and the workshop.

## Business model

- **Free and run by volunteers.** No ads and no paid tiers. Achievement sets are made by community "developers", and moderators are volunteers too.
- **Funded by Patreon donations**, which mainly pay for servers. Supporters get a "Patreon Supporter" badge on their profile (`AwardType::PatreonSupporter`) and a supporters page.
- **Growth comes from being built into other tools.** Their C library (`rcheevos`, MIT licence) is built into RetroArch, Dolphin, PCSX2, PPSSPP, DuckStation, MiSTer, Epilogue hardware, LaunchBox and others. Every emulator that adds RA brings users to RA. When Dolphin added GameCube and, in March 2026, Wii support, their servers struggled under the load.
- **No legal exposure on games.** They store only ROM *hashes* (fingerprints of the file) to know which game you're running. You bring your own ROM.
- **Limitation:** donations only. They can't easily make money, and nothing flows back to the people who made the games.

## Features

| Area | What it does |
|---|---|
| Achievements | Per-game sets matched by ROM hash. Points, plus weighted "RetroPoints" for harder unlocks. |
| Hardcore vs softcore | Hardcore turns off save states, rewind, slow motion and cheats. Only hardcore counts for leaderboards and events. |
| Awards | Mastery (all achievements in hardcore), Completion (all achievements in softcore), Beaten (finished the game), event badges, playtest and media contribution badges. |
| Leaderboards | Per-game speedrun and score boards, plus global rankings by points and time window. |
| Rich presence | Live status such as "World 3-2, 4 lives", shown on the profile and in Discord. |
| Subsets | Extra sets (bonus or challenge modes) on top of a game's main set. |
| Events | Time-limited community challenges, for example the Wii launch event (Mar–Jul 2026). |
| Hubs | Curated groups such as series, genres or "Homebrew – itch.io" (635 games). |
| Game requests | Users vote for which games should get sets next. |
| Claims | A developer "claims" a game while making its set, so two people don't build the same set. |
| Tickets | Bug reports against a single achievement ("didn't trigger", "triggered too early"). |
| Community | Forums, private messages, comments on games and achievements, friends, comparing yourself with another user on the same game, a news webzine. |
| API | Public web API and OAuth ("Sign in with RetroAchievements"), a JS client (`@retroachievements/api`) and a Discord bot. |

## Tech stack (from `RAWeb` composer.json / package.json)

- **Backend:** Laravel 13 on PHP 8.5, served by Octane on FrankenPHP. MySQL/MariaDB, Redis plus Horizon for background jobs, Meilisearch (via Scout) for search, Passport for OAuth, Fortify for login, Socialite for social login, Pulse for monitoring and Sentry for errors.
- **Frontend:** Inertia.js with React 19 and TypeScript, Tailwind v4, TanStack Query, Jotai, Radix UI and i18next for translations. Some older pages still use Livewire and Alpine, and they're being migrated.
- **Admin:** Filament (moderation, game data, emulator downloads).
- **Edge:** Cloudflare, including a bot check on the site.
- **Desktop tools for set makers:** RAIntegration (C++ DLL) and RALibretro. Achievement logic is memory-address conditions that `rcheevos` evaluates every frame.
- **Licences:** website GPL-3, `rcheevos` MIT.

Takeaway: it's a mature, server-heavy PHP monolith. ReviveMode's stack (static React plus Supabase) is much lighter and cheaper, which suits us. We don't need to copy theirs.

## Main flows

**Player**
1. Sign up on the site.
2. Go to Downloads and install an RA-compatible emulator.
3. Find your own ROM file.
4. Log in **inside the emulator** and load the ROM. The emulator hashes it and fetches the set.
5. Play. Unlocks pop up in the emulator, then show on your profile and in rankings.

That's five steps with three separate things (site, emulator, ROM) before the first unlock.

**Set developer**
Request or claim a game → build the set in desktop tools by inspecting memory → playtest → publish → fix bugs from tickets.

**Community**
Game page → comments, forums, leaderboards → events and hubs → profile awards.

## Gaps ReviveMode can fill

1. **Achievements you can earn in the browser.** RA can't be earned in browser emulators today. RomM's docs say you can't earn achievements in its EmulatorJS player, webRcade has no hardcore mode, and the EmulatorJS request for RA support was closed without it being built. We already run EmulatorJS. If we get achievements working in `player.html`, a player goes from "click" to "first unlock" in one step. *Biggest opportunity, also the biggest unknown (see next steps).*
2. **The games themselves, legally, in one click.** RA has more than 635 itch.io homebrew games with sets, but you still have to find and download each one yourself. We host licensed homebrew. "Play this homebrew with its achievements, right here" is something RA can't offer.
3. **Rewarding homebrew authors.** On RA, community developers make the sets, not the game's author, and nothing goes back to the author. We can have author pages, let authors make their own achievements, run game jams, and later share revenue. The catalog licence work we already do is the basis for this.
4. **Casual and mobile players.** RA is built for completionists: dense pages and desktop-first set tools. Touch controls, instant play and a simpler profile are open ground for us.
5. **Playing together live.** RA's social features are all asynchronous (forums, messages). Our planned rooms and netplay (`RoomPanel`, `rooms` tables) would give a "play together now" layer RA doesn't have.
6. **A business model.** RA is donation-only. We could run optional supporter tiers with cosmetic perks, a homebrew store with revenue share, and sponsored events. *Before charging anything, re-audit core licences: Snes9x and Genesis Plus GX are non-commercial only (see TECH_STACK.md).*

## Don't compete on

- Their library of thousands of sets across 50+ systems.
- Being built into many emulators.
- Hardcore integrity rules. RA has years of anti-cheat rules and enforcement.

The better position is to **complement RA**: RA is the scoreboard for players who install emulators, and ReviveMode is where you just press play.

## Feasibility check (2026-11-15)

Tested live in our player (`player.html`, µCity on the gambatte core, EmulatorJS stable from the CDN) and against the EmulatorJS source code.

| Gap | Verdict | Evidence |
|---|---|---|
| 1. Achievements in the browser | **Feasible (our own system).** Counting toward RA itself is a long way off. | EmulatorJS has no "read game memory" function, but `gameManager.getState()` returns a full snapshot (182 KB for GB) in **about 0.1 ms**, so we can read it every frame. Using a cheat to write test values to GB address `C123` showed it always lands at **snapshot byte 150006**, so GB work RAM starts at byte 149715. The mapping is fixed for each core, so we'd need to work it out once per core (5 cores for our 5 systems). Unlocks can be checked by our own small JS checker; we don't need `rcheevos`. **RA-approved path:** RA requires an emulator to have been public for 6+ months before they'll consider it, plus their hardcore rules. Treat that as a later goal, not the MVP. |
| 2. Hosting homebrew | **Already working.** | µCity is live with its licence recorded. |
| 3. Rewards for game authors | **Feasible.** Easier for us than for RA. | Homebrew authors know their own RAM layout. Games built with RGBDS (like µCity) can output a symbol file that names every variable's address, so an author tool can say "when `money` ≥ 10000" instead of using raw addresses. Paying authors needs Stripe Connect (or Ko-fi/Patreon links to start), which is standard. |
| 4. Mobile / casual | **Feasible.** | At phone size with touch emulated, µCity ran at **60 fps** and EmulatorJS showed its built-in touch gamepad (D-pad, A/B, Select/Start). Real-phone performance isn't tested yet. |
| 5. Playing together live | **Feasible, needs a small server.** | EmulatorJS has netplay built in, up to 4 players. The host's screen is streamed to guests over WebRTC (30 fps) and guests send their button presses back. It needs their Node signalling server (`EmulatorJS-Netplay`, Apache-2.0: express + socket.io), which Supabase can't host. That means a small always-on host, plus a TURN relay for players who can't connect directly, and the relay costs bandwidth. Our `rooms` tables could list rooms, but EmulatorJS's own room system would run the actual session. |
| 6. Making money | **Partly blocked by licences.** | Core licences for our systems: NES `fceumm`/`nestopia` (GPL), GB `gambatte` (GPL), GBA `mgba` (MPL-2.0), SNES `bsnes` (GPL-3) are fine to use commercially. **SNES `snes9x` and every Genesis core in EmulatorJS (`genesis_plus_gx`, `picodrive`) are non-commercial.** If we charge anything, switch SNES to `bsnes` and either drop Genesis or get a lawyer's view on whether a paid supporter tier on a free player counts as "commercial use". |

**Overall:** every gap is technically doable with what we have. The real costs are (a) mapping RAM once per core, (b) a netplay server plus relay bandwidth, and (c) the Genesis licence question before any paid feature.

Note for testing: while the browser pane is hidden, the game runs at about 10 fps because hidden pages are throttled. Measure with the page visible.

## Suggested next steps

1. ~~**Feasibility test:** read the console's RAM in `player.html`~~ Done: it's readable from the snapshot (see Feasibility check). The first real achievement is built: µCity "Nest Egg" (funds ≥ 50,000). The set is in `web/public/achievements/ucity.json` and the checker in `web/public/player.html`. µCity's funds live at `C565` (5 BCD bytes, lowest first), found by searching memory for the on-screen amount. µCity releases ship no symbol file. Unlocks are saved in this browser only for now.
2. **Choose a path:**
   - (a) Our own achievements for our homebrew catalog. We control everything, and achievements can reuse the existing `challenges` post type and profile awards.
   - (b) Apply to RA as an approved emulator, so unlocks count on RA too. This needs their approval and their hardcore rules, such as no save states in hardcore.
3. **Data model sketch (Supabase):** `achievements`, `user_achievements` (with a `hardcore` flag), `leaderboards` and `leaderboard_entries`, plus `awards` on profiles.
