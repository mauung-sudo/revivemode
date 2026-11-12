import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MockGame } from '../data/games'

export type SortKey = 'newest' | 'oldest' | 'az'
export const SORT_LABEL: Record<SortKey, string> = { newest: 'NEWEST', oldest: 'OLDEST', az: 'A–Z' }
export const DECADES = ['1970s', '1980s', '1990s', '2000s'] as const
export const PLAYER_OPTIONS = ['1P', '2P'] as const

export interface Filters {
  q: string
  platform: string[]
  genre: string[]
  year: string[]
  players: string[]
  sort: SortKey
}

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

// Filters live in the URL so results are shareable and survive reloads.
export function useFilters() {
  const [params, setParams] = useSearchParams()
  const filters: Filters = {
    q: params.get('q') ?? '',
    platform: list(params.get('platform')),
    genre: list(params.get('genre')),
    year: list(params.get('year')),
    players: list(params.get('players')),
    sort: (params.get('sort') as SortKey) || 'newest',
  }
  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch }
    const p = new URLSearchParams()
    if (next.q) p.set('q', next.q)
    for (const k of ['platform', 'genre', 'year', 'players'] as const) if (next[k].length) p.set(k, next[k].join(','))
    if (next.sort !== 'newest') p.set('sort', next.sort)
    if (params.get('page') && !('page' in patch)) p.delete('page')
    setParams(p, { replace: true })
  }
  return { filters, update }
}

export function applyFilters(games: MockGame[], f: Filters): MockGame[] {
  const q = f.q.trim().toLowerCase()
  const words = q.split(/\s+/).filter(Boolean)
  const out = games.filter((g) => {
    if (words.length) {
      const hay = `${g.title} ${g.platform} ${g.genre}`.toLowerCase()
      if (!words.every((w) => hay.includes(w))) return false
    }
    if (f.platform.length && !f.platform.includes(g.platform)) return false
    if (f.genre.length && !f.genre.includes(g.genre)) return false
    if (f.year.length && !f.year.includes(`${Math.floor(g.year / 10) * 10}s`)) return false
    if (f.players.length && !f.players.some((p) => (p === '1P' ? true : g.players >= 2))) return false
    return true
  })
  return out.sort((a, b) =>
    f.sort === 'az' ? a.title.localeCompare(b.title) : f.sort === 'oldest' ? a.year - b.year : b.year - a.year,
  )
}

export function useFilteredGames(games: MockGame[]) {
  const { filters, update } = useFilters()
  const results = useMemo(() => applyFilters(games, filters), [games, JSON.stringify(filters)]) // eslint-disable-line
  return { filters, update, results }
}
