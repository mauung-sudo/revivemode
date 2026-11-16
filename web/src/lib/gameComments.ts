import { useEffect, useSyncExternalStore } from 'react'
import { SAMPLE_COMMENTS } from '../data/gameDetails'
import { timeAgo } from '../data/community'
import { getAuth, openSignIn } from './auth'
import { supabase } from './supabase'

// Comments, replies, comment hearts and the like/dislike vote on game pages.
// Stored in game_comments, game_comment_likes and game_votes when a backend
// is configured; writing needs an account. Without a backend everything
// stays in memory for this visit. The design's sample comments always show
// after the real ones; hearts on them are kept in memory only.

export interface GameComment {
  id: string
  user: string
  avatar: string | null
  text: string
  ago: string
  likes: number
  likedByMe: boolean
  mine: boolean
  /** Stored in the database (not a sample or an in-memory comment). */
  real: boolean
  replies: GameComment[]
  /** Reply count for sample comments, which have no reply bodies. */
  sampleReplies?: number
}

export interface GameThread {
  loaded: boolean
  comments: GameComment[] // newest first, real ones before samples
  myVote: 0 | 1 | -1
  up: number
  down: number
}

interface Entry {
  loaded: boolean
  real: GameComment[]
  local: GameComment[]
  samples: GameComment[]
  myVote: 0 | 1 | -1
  up: number
  down: number
  view: GameThread
}

const entries = new Map<string, Entry>()
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}


function entry(gameId: string, title = ''): Entry {
  let e = entries.get(gameId)
  if (!e) {
    const samples = SAMPLE_COMMENTS(title).map<GameComment>((c) => ({
      id: `sample-${c.id}`,
      user: c.user,
      avatar: '/assets/game/comments/avatar-sample.png', // design's sample avatar
      text: c.text,
      ago: c.ago,
      likes: c.likes,
      likedByMe: false,
      mine: false,
      real: false,
      replies: [],
      sampleReplies: c.replies,
    }))
    e = { loaded: !supabase, real: [], local: [], samples, myVote: 0, up: 0, down: 0, view: { loaded: false, comments: [], myVote: 0, up: 0, down: 0 } }
    entries.set(gameId, e)
    rebuild(e)
  }
  return e
}

function rebuild(e: Entry) {
  e.view = { loaded: e.loaded, comments: [...e.real, ...e.local, ...e.samples], myVote: e.myVote, up: e.up, down: e.down }
}

function changed(gameId: string, patch: Partial<Entry>) {
  const e = entries.get(gameId)
  if (!e) return
  Object.assign(e, patch)
  rebuild(e)
  listeners.forEach((l) => l())
}

/** Apply `fn` to a comment (or reply) by id, returning a new list. */
const mapComment = (list: GameComment[], id: string, fn: (c: GameComment) => GameComment): GameComment[] =>
  list.map((c) => (c.id === id ? fn(c) : c.replies.length ? { ...c, replies: mapComment(c.replies, id, fn) } : c))

const findComment = (list: GameComment[], id: string): GameComment | undefined => {
  for (const c of list) {
    if (c.id === id) return c
    const r = findComment(c.replies, id)
    if (r) return r
  }
}

// ----------------------------------------------------------------- loading

interface Row {
  id: string
  parent_id: string | null
  body: string
  created_at: string
  user_id: string
  profiles: { display_name: string; avatar_url: string | null } | null
  game_comment_likes: { count: number }[]
}

const SELECT =
  'id, parent_id, body, created_at, user_id,' +
  // game_comments ↔ profiles is linked twice (author, and via likes): name the author link.
  ' profiles!game_comments_user_id_fkey(display_name, avatar_url), game_comment_likes(count)'
const SELECT_NO_LIKES = 'id, parent_id, body, created_at, user_id, profiles!game_comments_user_id_fkey(display_name, avatar_url)'

const inflight = new Map<string, Promise<void>>()

function load(gameId: string): Promise<void> {
  if (!supabase) return Promise.resolve()
  const running = inflight.get(gameId)
  if (running) return running
  const sb = supabase
  const p = (async () => {
    const me = getAuth().session?.user.id ?? null
    const fetchComments = (select: string) =>
      sb.from('game_comments').select(select).eq('game_id', gameId).order('created_at', { ascending: false }).limit(300)
    let [comments, votes] = await Promise.all([fetchComments(SELECT), sb.from('game_votes').select('user_id, value').eq('game_id', gameId)])
    // Before the game_comment_likes migration is applied the like counts can't
    // be embedded; still show the comments (with 0 hearts) instead of nothing.
    if (comments.error) comments = await fetchComments(SELECT_NO_LIKES)
    if (comments.error) console.warn('Could not load comments.', comments.error)
    const rows = (comments.data ?? []) as unknown as Row[]

    let liked = new Set<string>()
    if (me && rows.length) {
      const { data } = await sb.from('game_comment_likes').select('comment_id').eq('user_id', me).in('comment_id', rows.map((r) => r.id))
      liked = new Set((data ?? []).map((d) => d.comment_id as string))
    }

    const toComment = (r: Row): GameComment => ({
      id: r.id,
      user: r.profiles?.display_name ?? 'Player',
      avatar: r.profiles?.avatar_url ?? null,
      text: r.body,
      ago: timeAgo(r.created_at),
      likes: r.game_comment_likes?.[0]?.count ?? 0,
      likedByMe: liked.has(r.id),
      mine: r.user_id === me,
      real: true,
      replies: [],
    })
    const top = rows.filter((r) => !r.parent_id).map(toComment)
    const byId = new Map(top.map((c) => [c.id, c]))
    // Replies oldest first under their comment.
    for (const r of [...rows].reverse()) {
      if (r.parent_id) byId.get(r.parent_id)?.replies.push(toComment(r))
    }

    const v = (votes.data ?? []) as { user_id: string; value: number }[]
    const mine = v.find((x) => x.user_id === me)?.value
    changed(gameId, {
      loaded: true,
      real: top,
      up: v.filter((x) => x.value === 1).length,
      down: v.filter((x) => x.value === -1).length,
      myVote: mine === 1 || mine === -1 ? mine : 0,
    })
  })().finally(() => inflight.delete(gameId))
  inflight.set(gameId, p)
  return p
}

if (supabase) {
  let lastUser: string | null | undefined
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user.id ?? null
    if (uid === lastUser) return
    lastUser = uid
    // Deferred: Supabase warns against awaiting inside this callback.
    setTimeout(() => entries.forEach((_e, id) => load(id)), 0)
  })
}

/** Comments and votes for one game; loads them on first use. */
export function useGameThread(gameId: string, title: string): GameThread {
  useEffect(() => {
    load(gameId)
  }, [gameId])
  // entry() only creates the cache slot once, so it is safe in the snapshot.
  return useSyncExternalStore(subscribe, () => entry(gameId, title).view)
}

// ----------------------------------------------------------------- writing

/** True when writes are allowed; otherwise opens the sign-in box. */
function needAccount(): string | null {
  if (!supabase) return null
  const uid = getAuth().session?.user.id ?? null
  if (!uid) openSignIn()
  return uid
}

export async function addComment(gameId: string, text: string, parentId?: string): Promise<boolean> {
  const body = text.trim().slice(0, 2000)
  if (!body) return false
  const e = entry(gameId)
  if (!supabase) {
    const c: GameComment = { id: crypto.randomUUID(), user: 'You', avatar: null, text: body, ago: 'now', likes: 0, likedByMe: false, mine: true, real: false, replies: [] }
    if (parentId) changed(gameId, { local: mapComment(e.local, parentId, (p) => ({ ...p, replies: [...p.replies, c] })) })
    else changed(gameId, { local: [c, ...e.local] })
    return true
  }
  const uid = needAccount()
  if (!uid) return false
  const { error } = await supabase.from('game_comments').insert({ game_id: gameId, user_id: uid, body, parent_id: parentId ?? null })
  if (error) throw new Error(error.message)
  await load(gameId)
  return true
}

export async function deleteComment(gameId: string, id: string) {
  const e = entry(gameId)
  if (!supabase) {
    const drop = (list: GameComment[]): GameComment[] => list.filter((c) => c.id !== id).map((c) => ({ ...c, replies: drop(c.replies) }))
    return changed(gameId, { local: drop(e.local) })
  }
  if (!needAccount()) return
  const { error } = await supabase.from('game_comments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await load(gameId)
}

export async function toggleCommentLike(gameId: string, id: string) {
  const e = entry(gameId)
  const flip = (c: GameComment) => ({ ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) })
  const target = findComment(e.real, id)
  if (!target) {
    // Sample or in-memory comment: keep it on this page only.
    return changed(gameId, { local: mapComment(e.local, id, flip), samples: mapComment(e.samples, id, flip) })
  }
  const uid = needAccount()
  if (!uid || !supabase) return
  changed(gameId, { real: mapComment(e.real, id, flip) })
  const { error } = target.likedByMe
    ? await supabase.from('game_comment_likes').delete().eq('comment_id', id).eq('user_id', uid)
    : await supabase.from('game_comment_likes').upsert({ comment_id: id, user_id: uid })
  if (error) {
    console.warn('Could not save the like.', error)
    load(gameId)
  }
}

/** Like (1), dislike (-1) or clear (0) the game. */
export async function setVote(gameId: string, value: 0 | 1 | -1) {
  const e = entry(gameId)
  const prev = e.myVote
  const count = (v: number) => (prev === v ? -1 : 0) + (value === v ? 1 : 0)
  const optimistic = { myVote: value, up: e.up + count(1), down: e.down + count(-1) }
  if (!supabase) return changed(gameId, optimistic)
  const uid = needAccount()
  if (!uid) return
  changed(gameId, optimistic)
  const { error } =
    value === 0
      ? await supabase.from('game_votes').delete().eq('game_id', gameId).eq('user_id', uid)
      : await supabase.from('game_votes').upsert({ game_id: gameId, user_id: uid, value })
  if (error) {
    console.warn('Could not save your vote.', error)
    load(gameId)
  }
}
