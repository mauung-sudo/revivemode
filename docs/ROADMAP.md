# ReviveMode — Roadmap

Tracked in **GitHub Projects**. Each checkbox below becomes an issue; `scripts/create-issues.sh` creates them with milestone + labels.

Board columns: **Backlog → Todo → In Progress → In Review → Done**
Labels: `frontend`, `emulation`, `backend`, `infra`, `content`, `design`, `legal`

## Milestone 0 — Prototype (scaffold) ✅
- [x] Vite + React + TS + Tailwind scaffold `frontend`
- [x] EmulatorJS player in isolated iframe `emulation`
- [x] Bring-your-own-ROM loader (local only, never uploaded) `emulation`
- [x] Catalog from `catalog.json` with license field `content`
- [x] COOP/COEP headers for dev + Cloudflare Pages `infra`

## Milestone 1 — Design & MVP
- [ ] Implement Figma design system (tokens, typography, components) `design` `frontend`
- [ ] Home / library page from Figma `frontend`
- [ ] Game detail + player page from Figma `frontend`
- [ ] Search + filter by system `frontend`
- [ ] Mobile layout + touch controls check `frontend` `emulation`
- [ ] Curate first 20 homebrew games with verified licenses `content` `legal`
- [ ] Deploy to Cloudflare Pages from GitHub `infra`
- [ ] Self-host EmulatorJS data (pinned version) `infra` `emulation`

## Milestone 2 — Accounts & Saves
- [ ] Supabase project + Google/Discord auth `backend`
- [ ] Move catalog to Postgres `backend`
- [ ] Favorites + recently played `backend` `frontend`
- [ ] Cloud save-state sync (IndexedDB ↔ storage) `backend` `emulation`
- [ ] Move game files to Cloudflare R2 `infra`
- [ ] PWA (installable, offline library) `frontend`

## Milestone 3 — Growth
- [ ] js-dos integration for MS-DOS homebrew `emulation`
- [ ] Netplay (WebRTC) `emulation` `backend`
- [ ] Leaderboards / challenges `backend`
- [ ] Re-audit core licenses before any monetization `legal`
