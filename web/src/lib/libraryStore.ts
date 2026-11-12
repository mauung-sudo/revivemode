import { useSyncExternalStore } from 'react'

// The player's library and collections. Stored in localStorage until the
// backend exists (docs/BACKEND.md → library_items, collections, collection_games).
export interface Collection {
  id: string
  name: string
  gameIds: string[]
}
export interface LibraryState {
  myGames: string[]
  collections: Collection[]
  lastPlayed: string | null
}

const KEY = 'revivemode.library.v1'

const SEED: LibraryState = {
  myGames: [
    'super-mario-bros', 'castlevania-sotn', 'metal-slug', 'crash-bandicoot', 'mega-man-x', 'sonic',
    'super-mario-world', 'zelda', 'tetris', 'street-fighter-2', 'chrono-trigger', 'metroid',
  ],
  collections: [
    { id: 'the80s', name: 'The80s', gameIds: ['sonic', 'crash-bandicoot', 'super-mario-world'] },
    { id: 'mario', name: 'Mario', gameIds: ['super-mario-bros', 'super-mario-world'] },
    { id: 'gameboii', name: 'Gameboii', gameIds: ['tetris', 'kirbys-adventure', 'metroid'] },
    { id: 'zelda', name: 'Zelda', gameIds: ['zelda'] },
  ],
  lastPlayed: 'super-mario-bros',
}

function load(): LibraryState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LibraryState
  } catch {
    /* storage unavailable: fall back to seed */
  }
  return SEED
}

let state = load()
const listeners = new Set<() => void>()

function set(next: LibraryState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l())
}

export function useLibrary() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'collection'

export const library = {
  get: () => state,
  addToLibrary(id: string) {
    if (!state.myGames.includes(id)) set({ ...state, myGames: [id, ...state.myGames] })
  },
  removeFromLibrary(id: string) {
    set({
      ...state,
      myGames: state.myGames.filter((g) => g !== id),
      collections: state.collections.map((c) => ({ ...c, gameIds: c.gameIds.filter((g) => g !== id) })),
    })
  },
  createCollection(name: string, gameIds: string[]): string {
    let id = slug(name)
    while (state.collections.some((c) => c.id === id)) id += '-2'
    const myGames = [...new Set([...gameIds, ...state.myGames])]
    set({ ...state, myGames, collections: [...state.collections, { id, name: name.trim(), gameIds }] })
    return id
  },
  addToCollection(collectionId: string, gameId: string) {
    set({
      ...state,
      myGames: state.myGames.includes(gameId) ? state.myGames : [gameId, ...state.myGames],
      collections: state.collections.map((c) =>
        c.id === collectionId && !c.gameIds.includes(gameId) ? { ...c, gameIds: [...c.gameIds, gameId] } : c,
      ),
    })
  },
  removeFromCollection(collectionId: string, gameId: string) {
    set({
      ...state,
      collections: state.collections.map((c) => (c.id === collectionId ? { ...c, gameIds: c.gameIds.filter((g) => g !== gameId) } : c)),
    })
  },
  deleteCollection(collectionId: string) {
    set({ ...state, collections: state.collections.filter((c) => c.id !== collectionId) })
  },
  setLastPlayed(id: string) {
    set({ ...state, lastPlayed: id })
  },
}
