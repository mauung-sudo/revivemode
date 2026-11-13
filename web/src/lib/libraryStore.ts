import { useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { gameById } from './catalog'
import { supabase } from './supabase'

// The player's library, collections and "continue playing" game.
//
// Signed out (or no backend): stored in this browser's localStorage.
// Signed in: stored in the account (library_items, collections,
// collection_games, play_sessions). Changes show instantly and are written
// to Supabase in the background; if a write fails the store reloads from
// the server. The first time an account with an empty library signs in on
// a browser that has a local library, that library is copied into it.

export interface Collection {
  id: string
  name: string
  gameIds: string[]
}
export interface LibraryState {
  myGames: string[]
  collections: Collection[]
  lastPlayed: string | null
  /** True while the account library is loading. */
  syncing?: boolean
}

const KEY = 'revivemode.library.v1'
const MIGRATED_KEY = (uid: string) => `revivemode.library.migrated.${uid}`

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
const EMPTY: LibraryState = { myGames: [], collections: [], lastPlayed: null }

const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore quota / private mode */
    }
  },
}

function loadLocal(): LibraryState {
  const raw = storage.get(KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as LibraryState
    } catch {
      /* corrupted: fall back to seed */
    }
  }
  return SEED
}

let local = loadLocal()
let userId: string | null = null
let remote: LibraryState | null = null
let state: LibraryState = local
const listeners = new Set<() => void>()

function emit() {
  state = userId ? (remote ?? { ...EMPTY, syncing: true }) : local
  listeners.forEach((l) => l())
}

function setLocal(next: LibraryState) {
  local = next
  storage.set(KEY, JSON.stringify(next))
  emit()
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

// ------------------------------------------------------------ account sync

// Only games that exist in the catalog can be referenced (foreign key).
const known = (ids: string[]) => ids.filter((id) => gameById(id))

/** Make a collection name unique among `taken` ("Mario" → "Mario 2"). */
function uniqueName(name: string, taken: string[]) {
  const base = name.trim().slice(0, 40) || 'Collection'
  let n = base
  for (let i = 2; taken.includes(n); i++) n = `${base.slice(0, 36)} ${i}`
  return n
}

async function fetchRemote(sb: SupabaseClient): Promise<LibraryState> {
  const [items, cols, last] = await Promise.all([
    sb.from('library_items').select('game_id').order('added_at', { ascending: false }),
    sb.from('collections').select('id, name, collection_games(game_id, position)').order('created_at'),
    sb.from('play_sessions').select('game_id').order('started_at', { ascending: false }).limit(1),
  ])
  const err = items.error ?? cols.error ?? last.error
  if (err) throw err
  type ColRow = { id: string; name: string; collection_games: { game_id: string; position: number }[] }
  return {
    myGames: (items.data ?? []).map((r) => r.game_id as string),
    collections: ((cols.data ?? []) as ColRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      gameIds: [...c.collection_games].sort((a, b) => a.position - b.position).map((g) => g.game_id),
    })),
    lastPlayed: (last.data?.[0]?.game_id as string | undefined) ?? null,
  }
}

/** Copy the browser's library into an empty account (once per account). */
async function migrateLocal(sb: SupabaseClient, uid: string): Promise<boolean> {
  if (storage.get(MIGRATED_KEY(uid)) || !storage.get(KEY)) return false // nothing the user made here
  const src = local
  const myGames = known(src.myGames)
  if (myGames.length) {
    const { error } = await sb.from('library_items').upsert(myGames.map((game_id) => ({ user_id: uid, game_id })), { ignoreDuplicates: true })
    if (error) throw error
  }
  const taken: string[] = []
  for (const c of src.collections) {
    const id = crypto.randomUUID()
    const name = uniqueName(c.name, taken)
    taken.push(name)
    const { error } = await sb.from('collections').insert({ id, user_id: uid, name })
    if (error) throw error
    const games = known(c.gameIds)
    if (games.length) {
      const { error: e2 } = await sb.from('collection_games').insert(games.map((game_id, position) => ({ collection_id: id, game_id, position })))
      if (e2) throw e2
    }
  }
  if (src.lastPlayed && gameById(src.lastPlayed)) await sb.from('play_sessions').insert({ user_id: uid, game_id: src.lastPlayed })
  storage.set(MIGRATED_KEY(uid), new Date().toISOString())
  return true
}

let loadToken = 0
async function loadAccount(uid: string) {
  if (!supabase) return
  const token = ++loadToken
  try {
    let lib = await fetchRemote(supabase)
    if (!lib.myGames.length && !lib.collections.length && (await migrateLocal(supabase, uid))) lib = await fetchRemote(supabase)
    else storage.set(MIGRATED_KEY(uid), storage.get(MIGRATED_KEY(uid)) ?? 'skipped')
    if (token !== loadToken || userId !== uid) return // signed out / switched meanwhile
    remote = lib
  } catch (e) {
    console.warn('Could not load your library from the server.', e)
    if (token !== loadToken || userId !== uid) return
    remote = remote ?? EMPTY
  }
  emit()
}

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user.id ?? null
    if (uid === userId) return
    userId = uid
    remote = null
    emit()
    // Deferred: Supabase warns against awaiting inside this callback.
    if (uid) setTimeout(() => loadAccount(uid), 0)
  })
}

/** Apply a change to the account library now; write it in the background. */
function setRemote(next: LibraryState, write: (sb: SupabaseClient, uid: string) => Promise<unknown>) {
  const uid = userId
  if (!supabase || !uid) return
  remote = next
  emit()
  write(supabase, uid).catch((e) => {
    console.warn('Could not save your library change; reloading.', e)
    loadAccount(uid)
  })
}

// Supabase query builders resolve to { error } instead of throwing.
const check = async (q: PromiseLike<{ error: unknown }>) => {
  const { error } = await q
  if (error) throw error
}

// ------------------------------------------------------------------ actions

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'collection'

let lastSession = { id: '', at: 0 }

export const library = {
  get: () => state,
  addToLibrary(id: string) {
    if (state.myGames.includes(id)) return
    const next = { ...state, myGames: [id, ...state.myGames] }
    if (!userId) return setLocal(next)
    setRemote(next, (sb, uid) => check(sb.from('library_items').upsert({ user_id: uid, game_id: id }, { ignoreDuplicates: true })))
  },
  removeFromLibrary(id: string) {
    const next = {
      ...state,
      myGames: state.myGames.filter((g) => g !== id),
      collections: state.collections.map((c) => ({ ...c, gameIds: c.gameIds.filter((g) => g !== id) })),
    }
    if (!userId) return setLocal(next)
    const colIds = state.collections.filter((c) => c.gameIds.includes(id)).map((c) => c.id)
    setRemote(next, async (sb) => {
      await check(sb.from('library_items').delete().eq('game_id', id))
      if (colIds.length) await check(sb.from('collection_games').delete().eq('game_id', id).in('collection_id', colIds))
    })
  },
  createCollection(name: string, gameIds: string[]): string {
    const myGames = [...new Set([...gameIds, ...state.myGames])]
    if (!userId) {
      let id = slug(name)
      while (state.collections.some((c) => c.id === id)) id += '-2'
      setLocal({ ...state, myGames, collections: [...state.collections, { id, name: name.trim(), gameIds }] })
      return id
    }
    const id = crypto.randomUUID()
    const finalName = uniqueName(name, state.collections.map((c) => c.name))
    const newOwned = gameIds.filter((g) => !state.myGames.includes(g))
    setRemote({ ...state, myGames, collections: [...state.collections, { id, name: finalName, gameIds }] }, async (sb, uid) => {
      await check(sb.from('collections').insert({ id, user_id: uid, name: finalName }))
      const games = known(gameIds)
      if (games.length) await check(sb.from('collection_games').insert(games.map((game_id, position) => ({ collection_id: id, game_id, position }))))
      const owned = known(newOwned)
      if (owned.length) await check(sb.from('library_items').upsert(owned.map((game_id) => ({ user_id: uid, game_id })), { ignoreDuplicates: true }))
    })
    return id
  },
  addToCollection(collectionId: string, gameId: string) {
    const col = state.collections.find((c) => c.id === collectionId)
    if (!col || col.gameIds.includes(gameId)) return
    const owned = state.myGames.includes(gameId)
    const next = {
      ...state,
      myGames: owned ? state.myGames : [gameId, ...state.myGames],
      collections: state.collections.map((c) => (c.id === collectionId ? { ...c, gameIds: [...c.gameIds, gameId] } : c)),
    }
    if (!userId) return setLocal(next)
    const position = col.gameIds.length
    setRemote(next, async (sb, uid) => {
      if (!owned) await check(sb.from('library_items').upsert({ user_id: uid, game_id: gameId }, { ignoreDuplicates: true }))
      await check(sb.from('collection_games').insert({ collection_id: collectionId, game_id: gameId, position }))
    })
  },
  removeFromCollection(collectionId: string, gameId: string) {
    const next = {
      ...state,
      collections: state.collections.map((c) => (c.id === collectionId ? { ...c, gameIds: c.gameIds.filter((g) => g !== gameId) } : c)),
    }
    if (!userId) return setLocal(next)
    setRemote(next, (sb) => check(sb.from('collection_games').delete().eq('collection_id', collectionId).eq('game_id', gameId)))
  },
  deleteCollection(collectionId: string) {
    const next = { ...state, collections: state.collections.filter((c) => c.id !== collectionId) }
    if (!userId) return setLocal(next)
    setRemote(next, (sb) => check(sb.from('collections').delete().eq('id', collectionId)))
  },
  /** Called when a game starts; records a play session when signed in. */
  setLastPlayed(id: string) {
    const next = { ...state, lastPlayed: id }
    if (!userId) return setLocal(next)
    // One session per start; ignore repeat calls for the same start.
    const now = Date.now()
    const repeat = lastSession.id === id && now - lastSession.at < 10_000
    lastSession = { id, at: now }
    if (repeat || !gameById(id)) {
      remote = next
      return emit()
    }
    setRemote(next, (sb, uid) => check(sb.from('play_sessions').insert({ user_id: uid, game_id: id })))
  },
}
