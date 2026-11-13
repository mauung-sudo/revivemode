// Bundled catalog: the fallback when there is no backend, and the source for
// supabase/seed.sql. The live list comes from the `games` table (lib/catalog.ts).
// These are the titles shown in the Figma design. They are commercial games,
// so they have no playable file here: "Play" asks the user to load their own copy.
// Playable homebrew sets `file` + `license` (e.g. test-pattern).

export type Platform = 'NES' | 'SNES' | 'Sega Genesis' | 'PSX' | 'Neo Geo' | 'Game Boy' | 'Arcade' | 'Atari'
export type Genre = 'Action' | 'Adventure' | 'Fighting' | 'Platformer' | 'Shooter' | 'Puzzle' | 'Racing' | 'RPG' | 'Simulation'

export interface MockGame {
  id: string
  title: string
  platform: Platform
  genre: Genre
  year: number
  cover: string
  players: number
  /** Redistributable ROM bundled with the site (homebrew only). */
  file?: string
  /** License of the bundled file. Required when `file` is set. */
  license?: string
  /** Who made it, shown as the credit line (required by CC BY / GPL). */
  author?: string
  /** Where the source code lives (required by the GPL). */
  source?: string
}

const c = (f: string) => `/assets/covers/${f}`

export const GAMES: MockGame[] = [
  { id: 'super-mario-world', title: 'Super Mario World', platform: 'SNES', genre: 'Platformer', year: 1990, cover: c('super-mario-world.webp'), players: 2 },
  { id: 'sonic-2', title: 'Sonic the Hedgehog 2', platform: 'Sega Genesis', genre: 'Platformer', year: 1992, cover: c('sonic-2.webp'), players: 2 },
  { id: 'pac-man', title: 'Pac Man', platform: 'NES', genre: 'Platformer', year: 1984, cover: c('pac-man.webp'), players: 2 },
  { id: 'street-fighter-2', title: 'Street Fighter II', platform: 'SNES', genre: 'Fighting', year: 1992, cover: c('street-fighter-2.webp'), players: 2 },
  { id: 'mega-man-x', title: 'Mega Man X', platform: 'SNES', genre: 'Action', year: 1993, cover: c('mega-man-x.webp'), players: 1 },
  { id: 'castlevania-sotn', title: 'Castlevania: Symphony of the Night', platform: 'PSX', genre: 'Adventure', year: 1997, cover: c('castlevania-sotn.webp'), players: 1 },
  { id: 'metal-slug', title: 'Metal Slug', platform: 'Neo Geo', genre: 'Shooter', year: 1996, cover: c('metal-slug.webp'), players: 2 },
  { id: 'crash-bandicoot', title: 'Crash Bandicoot', platform: 'PSX', genre: 'Platformer', year: 1996, cover: c('crash-bandicoot.webp'), players: 1 },
  { id: 'tetris', title: 'Tetris', platform: 'NES', genre: 'Puzzle', year: 1989, cover: c('tetris.webp'), players: 2 },
  { id: 'sf-alpha', title: 'Street Fighter Alpha', platform: 'Arcade', genre: 'Fighting', year: 1995, cover: c('sf-alpha.webp'), players: 2 },
  { id: 'sonic', title: 'Sonic the Hedgehog', platform: 'Sega Genesis', genre: 'Platformer', year: 1991, cover: c('sonic.webp'), players: 1 },
  { id: 'space-invaders', title: 'Space Invaders', platform: 'Atari', genre: 'Shooter', year: 1980, cover: c('space-invaders.webp'), players: 2 },
  { id: 'mortal-kombat', title: 'Mortal Kombat', platform: 'Sega Genesis', genre: 'Fighting', year: 1993, cover: c('mortal-kombat.webp'), players: 2 },
  { id: 'chrono-trigger', title: 'Chrono Trigger', platform: 'SNES', genre: 'RPG', year: 1995, cover: c('chrono-trigger.webp'), players: 1 },
  { id: 'metroid', title: 'Metroid', platform: 'NES', genre: 'Adventure', year: 1986, cover: c('metroid.webp'), players: 1 },
  { id: 'ff7', title: 'Final Fantasy VII', platform: 'PSX', genre: 'RPG', year: 1997, cover: c('ff7.webp'), players: 1 },
  // NES platform page
  { id: 'super-mario-bros', title: 'Super Mario Bros', platform: 'NES', genre: 'Platformer', year: 1985, cover: c('super-mario-bros.webp'), players: 2 },
  { id: 'zelda', title: 'The Legend of Zelda', platform: 'NES', genre: 'Adventure', year: 1986, cover: c('zelda.webp'), players: 1 },
  { id: 'mega-man-2', title: 'Mega Man 2', platform: 'NES', genre: 'Platformer', year: 1988, cover: c('mega-man-2.webp'), players: 1 },
  { id: 'contra', title: 'Contra', platform: 'NES', genre: 'Shooter', year: 1988, cover: c('contra.webp'), players: 2 },
  { id: 'castlevania', title: 'Castlevania', platform: 'NES', genre: 'Action', year: 1986, cover: c('castlevania.webp'), players: 1 },
  { id: 'kirbys-adventure', title: 'Kirby’s Adventure', platform: 'NES', genre: 'Platformer', year: 1993, cover: c('kirbys-adventure.webp'), players: 1 },
  { id: 'punch-out', title: 'Punch-Out!!', platform: 'NES', genre: 'Fighting', year: 1987, cover: c('punch-out.webp'), players: 1 },
  // Fighting genre page
  { id: 'sf2-world-warrior', title: 'Street Fighter II', platform: 'SNES', genre: 'Fighting', year: 1991, cover: c('sf2-world-warrior.webp'), players: 2 },
  { id: 'mortal-kombat-2', title: 'Mortal Kombat II', platform: 'SNES', genre: 'Fighting', year: 1994, cover: c('mortal-kombat-2.webp'), players: 2 },
  { id: 'tekken-3', title: 'Tekken 3', platform: 'PSX', genre: 'Fighting', year: 1998, cover: c('tekken-3.webp'), players: 2 },
  { id: 'kof-98', title: 'King of Fighters ’98', platform: 'Neo Geo', genre: 'Fighting', year: 1998, cover: c('kof-98.webp'), players: 2 },
  { id: 'marvel-vs-capcom', title: 'Marvel vs. Capcom', platform: 'Arcade', genre: 'Fighting', year: 1998, cover: c('marvel-vs-capcom.webp'), players: 2 },
  { id: 'soulcalibur', title: 'Soulcalibur', platform: 'Arcade', genre: 'Fighting', year: 1998, cover: c('soulcalibur.webp'), players: 2 },
  { id: 'samurai-shodown', title: 'Samurai Shodown II', platform: 'Neo Geo', genre: 'Fighting', year: 1994, cover: c('samurai-shodown.webp'), players: 2 },
  { id: 'test-pattern', title: 'Test Pattern', platform: 'NES', genre: 'Puzzle', year: 2026, cover: c('test-pattern.webp'), players: 1, file: '/games/test-pattern.nes', license: 'CC0-1.0' },
  { id: 'ucity', title: 'µCity', platform: 'Game Boy', genre: 'Simulation', year: 2017, cover: c('ucity.webp'), players: 1, file: '/games/ucity.gbc', license: 'GPL-3.0-or-later; art and music CC BY-SA 4.0', author: 'Antonio Niño Díaz (AntonioND)', source: 'https://codeberg.org/SkyLyrac/ucity' },
  { id: 'darkstalkers', title: 'Darkstalkers', platform: 'Arcade', genre: 'Fighting', year: 1994, cover: c('darkstalkers.webp'), players: 2 },
]

export const PLATFORMS: { slug: string; name: Platform; banner?: string }[] = [
  { slug: 'nes', name: 'NES', banner: '/assets/home/banner-nes.png' },
  { slug: 'snes', name: 'SNES' },
  { slug: 'genesis', name: 'Sega Genesis' },
  { slug: 'psx', name: 'PSX' },
  { slug: 'neo-geo', name: 'Neo Geo' },
  { slug: 'arcade', name: 'Arcade' },
  { slug: 'atari', name: 'Atari' },
]
export const platformBySlug = (slug: string) => PLATFORMS.find((p) => p.slug === slug)

// Curated Home rows (game ids). Featured comes from games.featured in the
// database; see lib/catalog.ts for lookups.
export const NEWLY_ADDED = ['mega-man-x', 'castlevania-sotn', 'metal-slug', 'crash-bandicoot']
export const MOSTLY_PLAYED = ['tetris', 'sf-alpha', 'sonic', 'space-invaders']
export const COMMUNITY_PICKS = ['mortal-kombat', 'chrono-trigger', 'metroid', 'ff7']

export const genreBySlug = (slug: string) => GENRES.find((g) => g.name.toLowerCase() === slug.toLowerCase())

export interface Crop { box: string; w: string; h: string; left: string; top: string }
export const GENRES: { name: Genre; art: string; bg: string; artClass: string; crop?: Crop }[] = [
  { name: 'Action', art: '/assets/genres/action.png', bg: 'linear-gradient(#1890cc,#0c4866)', artClass: 'h-[94%] rounded-lg' },
  { name: 'Adventure', art: '/assets/genres/adventure.png', bg: 'linear-gradient(#47980d,#0c510c)', artClass: 'h-[91%]' },
  { name: 'Fighting', art: '/assets/genres/fighting.png', bg: '#fff', artClass: '', crop: { box: 'h-[82%] aspect-[238/141] mb-[9%]', w: '100%', h: '125.1%', left: '0', top: '-11.01%' } },
  { name: 'Platformer', art: '/assets/genres/platformer.png', bg: '#fc9e9d', artClass: '', crop: { box: 'h-[91%] aspect-square mb-[4%]', w: '259.93%', h: '213.72%', left: '-29.24%', top: '-113.72%' } },
  { name: 'Shooter', art: '/assets/genres/shooter.png', bg: '#f8f8f8', artClass: 'h-[86%] self-end' },
  { name: 'Puzzle', art: '/assets/genres/puzzle.png', bg: '#fff', artClass: 'h-full w-full object-cover' },
  { name: 'Racing', art: '/assets/genres/racing.png', bg: '#fff', artClass: '', crop: { box: 'h-[98%] w-[99%]', w: '119.6%', h: '187.48%', left: '-5.2%', top: '-42.49%' } },
  { name: 'RPG', art: '/assets/genres/rpg.png', bg: '#377792', artClass: 'h-[94%]' },
]
