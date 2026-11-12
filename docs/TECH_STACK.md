# ReviveMode — Tech Stack Plan

> Browser-based retro game platform. Free-tier stack for the prototype, built so scaling later means upgrading plans, not rewriting.

_Last updated: 2026-11-12_

## Core principle

**Emulation runs in the player's browser** (WebAssembly), not on our servers. Our infrastructure only serves static files and stores small save files, so cost stays near zero as traffic grows. Server-side cloud streaming (the Antstream model) is explicitly out of scope — it costs money per minute played.

## Stack

| Layer | Choice | Free tier notes | Why |
|---|---|---|---|
| Console emulation | [EmulatorJS](https://emulatorjs.org) (libretro cores → WASM) | Open source (GPL-3) | NES, SNES, GB/GBA, Genesis, N64, PS1, arcade. Touch controls + gamepad built in. Alt: Nostalgist.js. |
| DOS emulation | [js-dos](https://js-dos.com) | Open source | DOSBox → WASM. Phase 2. |
| Frontend | Vite + React + TypeScript + Tailwind CSS v4 | — | Static output, fast builds. PWA via `vite-plugin-pwa` later. |
| Routing | react-router | — | |
| Hosting | Cloudflare Pages | Unlimited bandwidth | Game files are large; bandwidth caps elsewhere are the first thing to break. |
| Game file storage | Cloudflare R2 | ~10 GB storage, **$0 egress** | Egress is the main cost risk for a game site. |
| Auth + database | Supabase (Postgres + Auth) | ~50k MAU, 500 MB DB; **pauses after ~7 days idle** | OAuth (Google/Discord), row-level security. |
| Save states | IndexedDB (local) → R2/Supabase Storage sync when logged in | — | EmulatorJS saves locally by default. |
| Search | Postgres full-text search | — | No Algolia/Elastic until catalog is large. |
| Analytics | Cloudflare Web Analytics | Free, cookieless | No consent banner needed. |
| Project tracking | GitHub Projects + Issues | Free | See [ROADMAP.md](ROADMAP.md). |
| Design | Figma | — | Frontend design source of truth. |

_Free-tier limits change — verify current numbers before relying on them._

## Content & legal model

We do **not** host commercial ROMs.

1. **Curated catalog** — homebrew / public-domain / author-permitted games only (sources: PDRoms, itch.io, direct permission). Every entry records its license in `catalog.json`.
2. **Bring-Your-Own-ROM (BYOR)** — user picks a file from their device; it loads via the File API into the emulator **in memory only**. It is never uploaded to our servers.

## Technical constraints

- **Cross-origin isolation:** multi-threaded cores (N64, PS1, some arcade) need `SharedArrayBuffer`, which requires `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy`. We set these in `web/public/_headers` (Cloudflare Pages) and in `vite.config.ts` (dev). We use `credentialless` COEP so CDN assets still load; Safari doesn't support it yet, so threaded cores are Chromium/Firefox-only for now.
- **Core licenses:** some cores (e.g. Snes9x, Genesis Plus GX) are **non-commercial only**. Fine for a free product; must be re-audited before any monetization.
- **BIOS files:** PS1 (and some arcade/GBA) need BIOS we can't ship. MVP systems: NES, SNES, Game Boy/Color, GBA, Genesis.
- **EmulatorJS assets** load from the official CDN during the prototype; self-host on R2 before launch for reliability and version pinning.
- **Player isolation:** EmulatorJS uses page globals, so it runs inside `public/player.html` in an iframe. This also makes switching games a clean reload.

## Scaling path

| Stage | Changes |
|---|---|
| **Prototype (now)** | Static site, catalog as JSON, local saves, BYOR. |
| **Beta** | Supabase: accounts, favorites, play history, catalog in Postgres. Cloud save sync. Game files on R2. PWA. |
| **Growth** | R2 paid (~$0.015/GB-month, egress still free), Supabase Pro ($25/mo) when free tier is outgrown. Same architecture. |
| **Later** | Netplay (EmulatorJS WebRTC). STUN is free; a TURN relay is the first real recurring cost. js-dos library. Leaderboards. |

## Repository layout

```
revivemode/
├── docs/            # plans, roadmap
└── web/             # Vite + React frontend (Cloudflare Pages root)
    ├── public/
    │   ├── _headers         # COOP/COEP for Cloudflare Pages
    │   ├── player.html      # EmulatorJS host page (iframe)
    │   └── games/           # bundled homebrew (prototype only; moves to R2)
    └── src/
        ├── data/catalog.json
        ├── lib/systems.ts   # file extension → emulator core
        └── pages/
```
