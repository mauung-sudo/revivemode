# ReviveMode

Play retro and homebrew games in the browser. Emulation runs client-side (WebAssembly via EmulatorJS); we host only legally distributable games, and users can load their own ROMs locally without uploading them.

- Tech stack & architecture: [docs/TECH_STACK.md](docs/TECH_STACK.md)
- Roadmap (mirrors GitHub Projects): [docs/ROADMAP.md](docs/ROADMAP.md)

## Develop

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs web/dist
```

## Add a game to the catalog

1. Confirm the license allows redistribution (homebrew / public domain / written permission).
2. Put the file in `web/public/games/` (prototype; moves to R2 later).
3. Add an entry to `web/src/data/catalog.json` — the `license` field is required.

## Deploy (Cloudflare Pages)

- Root directory: `web`
- Build command: `npm run build`
- Output directory: `dist`
- `web/public/_headers` sets the cross-origin isolation headers.
