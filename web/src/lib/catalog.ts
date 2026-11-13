import { useMemo, useSyncExternalStore } from 'react'
import { GAMES, type Genre, type MockGame, type Platform } from '../data/games'
import { supabase } from './supabase'

// The games catalog. Starts from the list bundled in data/games.ts so pages
// render instantly (and offline / without a backend), then swaps in the
// `games` table from Supabase once it loads. New games added in the
// database show up without a redeploy.

interface CatalogState {
  games: MockGame[]
  byId: Map<string, MockGame>
  featuredIds: string[]
}

const make = (games: MockGame[], featuredIds: string[]): CatalogState => ({
  games,
  byId: new Map(games.map((g) => [g.id, g])),
  featuredIds,
})

let state = make(GAMES, ['super-mario-world', 'sonic-2', 'pac-man', 'street-fighter-2'])
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

interface GameRow {
  id: string
  title: string
  platform: string
  genre: string
  year: number | null
  players: number
  cover_url: string
  rom_url: string | null
  rom_license: string | null
  publisher: string | null
  source_url: string | null
  featured: boolean
}

if (supabase) {
  supabase
    .from('games')
    .select('id, title, platform, genre, year, players, cover_url, rom_url, rom_license, publisher, source_url, featured')
    .order('created_at')
    .order('id')
    .then(({ data, error }) => {
      if (error || !data?.length) return // keep the bundled list
      const rows = data as GameRow[]
      const games: MockGame[] = rows.map((r) => ({
        id: r.id,
        title: r.title,
        platform: r.platform as Platform,
        genre: r.genre as Genre,
        year: r.year ?? 0,
        players: r.players,
        cover: r.cover_url,
        ...(r.rom_url ? { file: r.rom_url, license: r.rom_license ?? undefined } : {}),
        ...(r.publisher ? { author: r.publisher } : {}),
        ...(r.source_url ? { source: r.source_url } : {}),
      }))
      const featured = rows.filter((r) => r.featured).map((r) => r.id)
      state = make(games, featured.length ? featured : state.featuredIds)
      listeners.forEach((l) => l())
    })
}

const getState = () => state

/** Every game in the catalog. */
export function useGames() {
  return useSyncExternalStore(subscribe, getState).games
}

/** One game by id (undefined if it does not exist). */
export function useGame(id: string | null | undefined) {
  const s = useSyncExternalStore(subscribe, getState)
  return id ? s.byId.get(id) : undefined
}

/** Games for a list of ids, in that order, skipping unknown ids. */
export function useGamesByIds(ids: readonly string[]) {
  const s = useSyncExternalStore(subscribe, getState)
  return useMemo(() => ids.map((id) => s.byId.get(id)).filter((g): g is MockGame => !!g), [ids, s])
}

/** Games flagged `featured` in the database. */
export function useFeatured() {
  const s = useSyncExternalStore(subscribe, getState)
  return useGamesByIds(s.featuredIds)
}

/** Non-hook lookup for event handlers. */
export const gameById = (id: string) => state.byId.get(id)
