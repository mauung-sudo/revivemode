import { useSyncExternalStore } from 'react'
import { getAuth } from '../lib/auth'
import { gameByTitle } from '../lib/catalog'
import { supabase } from '../lib/supabase'

// Community content. Sample posts from the Figma design are always shown
// after the real ones. With a backend, real posts, replies and likes come
// from Supabase (posts, post_replies, post_likes, challenge_entries) and
// posting needs an account. Without one (local prototype), the user's own
// posts are kept in localStorage.

export type Section = 'discussions' | 'challenges' | 'creations'
export const SECTIONS: { id: Section; label: string; cta: string; newTitle: string }[] = [
  { id: 'discussions', label: 'Discussions', cta: 'Start new discussion', newTitle: 'Start a new discussion' },
  { id: 'challenges', label: 'Challenges', cta: 'Start new challenge', newTitle: 'Create a new challenge' },
  { id: 'creations', label: 'Creations', cta: 'Create new post', newTitle: 'Create new post' },
]

export interface Author {
  name: string
  level: string
  avatar?: string
}
export interface Reply {
  id: string
  author: string
  text: string
  ago: string
  replies: number
  likes: number
}
interface Base {
  id: string
  title: string
  author: Author
  date: string
  tags: string[]
  replies: Reply[]
  mine?: boolean
  /** The signed-in user liked it (likes are stored per account). */
  likedByMe?: boolean
  /** Created on this site, not a design sample. */
  real?: boolean
}
export interface Discussion extends Base {
  kind: 'discussions'
  body: string
  image?: string
  likes: number
  views: number
}
export interface Challenge extends Base {
  kind: 'challenges'
  game: string
  platform: string
  difficulty: 'EZ' | 'Medium' | 'Hard' | 'Extreme'
  competitors: number
  points: number
  badge: { name: string; icon: string }
  rules: string[]
  completed?: boolean
}
export interface Creation extends Base {
  kind: 'creations'
  images: string[]
  body: string
  likes: number
}
export type Post = Discussion | Challenge | Creation

const av = (f: string) => `/assets/community/avatars/${f}`
const A = {
  playerOneX: { name: 'PlayerOneX', level: 'lvl.100', avatar: av('playeronex.png') },
  proGod: { name: 'ProGod88', level: 'Epic' },
  ninja: { name: 'Ninja', level: 'lvl.6' },
  lilB2: { name: 'LilB2', level: 'lvl.22', avatar: av('lilb2.png') },
}

const REPLIES: Reply[] = [
  { id: 'r1', author: 'PixelWarrior', text: 'Personally, my favorite has to be from Super Mario Galaxy. The orchestral arrangements and the "Gusty Garden Galaxy" theme still give me chills.', ago: '5 days', replies: 0, likes: 110 },
  { id: 'r2', author: 'NinjaPlayer87', text: "Gotta go with the classic Super Mario Bros theme! It's so simple yet instantly recognizable. Whenever I hear it, I'm transported back to my childhood.", ago: '3 hrs', replies: 5, likes: 42 },
  { id: 'r3', author: 'RetroGamer23', text: "Don't sleep on the music in Paper Mario: The Thousand-Year Door! This game has some seriously catchy tunes.", ago: '10 mon', replies: 10, likes: 12 },
]
const ART_REPLIES: Reply[] = [
  { id: 'a1', author: 'PixelWarrior', text: "The attention to detail is incredible, and it's clear that a lot of love and effort went into creating this masterpiece.", ago: '5 days', replies: 0, likes: 110 },
  { id: 'a2', author: 'NinjaPlayer87', text: 'Takes me right back to the excitement and joy of playing the game. Fantastic job!', ago: '3 hrs', replies: 5, likes: 42 },
  { id: 'a3', author: 'RetroGamer23', text: 'This artwork brings back so many happy memories. Thank you for sharing your talent with us!', ago: '10 mon', replies: 10, likes: 12 },
]

const SEED: Post[] = [
  { kind: 'discussions', id: 'favorite-mario-soundtrack', title: 'Favorite Mario sound track', author: A.playerOneX, date: '12th June, 2023', tags: ['MarioMusic', 'Soundtracks', 'Nostalgia'], likes: 67, views: 110, replies: REPLIES, body: 'Mario games have always been known for their catchy and memorable music. Which Mario game has the best soundtrack in your opinion? Is there a specific track that stands out for you?', image: '/assets/community/mario-music.webp' },
  { kind: 'discussions', id: 'easter-eggs-mgs1', title: 'Easter eggs in Metal gear solid 1', author: A.proGod, date: '12th June, 2023', tags: ['eastereggs', 'tips'], likes: 67, views: 110, replies: REPLIES.slice(0, 2), body: 'Share your favorite hidden secrets and easter eggs from the original Metal Gear Solid.' },
  { kind: 'discussions', id: 'recommendations-for-beginners', title: 'Game recommendations for beginners', author: A.ninja, date: '12th June, 2023', tags: ['retrogamegems', 'gamereviews', 'recommended'], likes: 67, views: 110, replies: REPLIES.slice(1), body: 'New to retro games? Post the titles you would hand to someone picking up a controller for the first time.' },
  { kind: 'challenges', id: 'shotgun-only', title: 'Shotgun only campaign', author: A.playerOneX, date: '12th June, 2023', tags: ['weeklychallenge'], game: 'Call of duty 2', platform: 'PC', difficulty: 'Hard', competitors: 110, points: 330, badge: { name: 'Gun master', icon: '/assets/community/badge-gun.webp' }, replies: [], rules: ['Shotgun Only: Players are only allowed to use shotguns as their primary weapon throughout the entire campaign.', 'No Secondary Weapons: Secondary weapons, such as pistols or grenades, are not permitted for use.', 'No Pickups: Players cannot pick up or use any other weapons found in the game, including those dropped by enemies.', 'Record your run: Submit a video link or screenshots of the final screen as proof.'] },
  { kind: 'challenges', id: 'stealth-no-goggles', title: 'Stealth no googles', author: A.proGod, date: '12th June, 2020', tags: ['topplayers'], game: 'Metal Gear Solid: the Twin Snakes', platform: 'GameCube', difficulty: 'Hard', competitors: 54, points: 650, badge: { name: 'Certified Assassin', icon: '/assets/community/badge-assassin.png' }, replies: [], rules: ['No thermal or night-vision goggles at any point.', 'No alerts: restart the area if you are spotted.', 'Submit a screenshot of the final rank screen.'] },
  { kind: 'challenges', id: 'pong-leaderboard', title: 'Pong first to 21', author: A.ninja, date: '3rd May, 2023', tags: ['pongleaderboard'], game: 'Pong', platform: 'Atari', difficulty: 'EZ', competitors: 230, points: 50, badge: { name: 'Paddle pro', icon: '/assets/community/trophy.png' }, replies: [], rules: ['Beat the CPU 21 points to anything.', 'Default paddle size only.'], completed: true },
  { kind: 'creations', id: 'smw-map', title: 'Super Mario World Map', author: A.lilB2, date: '12th June, 2023', tags: ['Map', 'cartography', 'environment', 'pixelArt'], likes: 67, replies: ART_REPLIES, images: ['/assets/community/smw-map.webp', '/assets/community/zelda-maps.webp', '/assets/community/pixel-mario.webp', '/assets/community/megaman-bosses.webp'], body: 'Redrew the Super Mario World overworld as a map of our planet. Every continent has a level node.' },
  { kind: 'creations', id: 'pixel-mario', title: 'Pixel Mario', author: { name: 'pixelkai', level: 'lvl.12', avatar: av('pixelkai.png') }, date: '12th Mar, 2022', tags: ['pixelArt'], likes: 96, replies: ART_REPLIES.slice(0, 2), images: ['/assets/community/pixel-mario.webp'], body: 'Two Marios, two palettes.' },
  { kind: 'creations', id: 'zelda-dungeon-maps', title: 'Zelda Dungeon Maps', author: { name: 'archivist', level: 'lvl.40', avatar: av('archivist.png') }, date: '8th Mar, 2022', tags: ['Map', 'zelda'], likes: 142, replies: ART_REPLIES, images: ['/assets/community/zelda-maps.webp'], body: 'Hand-drawn maps of every dungeon in the first quest.' },
  { kind: 'creations', id: 'gameboy-ui', title: 'Gameboy UI', author: { name: 'retroflux', level: 'lvl.8', avatar: av('retroflux.png') }, date: '5th June, 2023', tags: ['UI', 'gameboy'], likes: 210, replies: ART_REPLIES.slice(1), images: ['/assets/community/gameboy-ui.webp'], body: 'A Game Boy styled interface mockup.' },
  { kind: 'creations', id: 'megaman-bosses', title: 'Megaman bosses', author: { name: '8bitforge', level: 'lvl.15', avatar: av('8bitforge.png') }, date: '6th Apr, 2024', tags: ['pixelArt', 'megaman'], likes: 87, replies: ART_REPLIES.slice(0, 1), images: ['/assets/community/megaman-bosses.webp'], body: 'Robot Masters, cross-stitch style.' },
  { kind: 'creations', id: 'castlevania-skin', title: 'Castlevania switch skin', author: { name: 'nightmode', level: 'lvl.31', avatar: av('nightmode.png') }, date: '6th Apr, 2025', tags: ['hardware', 'castlevania'], likes: 173, replies: ART_REPLIES, images: ['/assets/community/castlevania-skin.webp'], body: 'Custom skin for my handheld.' },
]

export const TAGS: Record<Section, string[]> = {
  discussions: ['gamingmemories', 'collecting', 'gameplaytips', 'pacmaneastereggs', 'mario64strategies', 'mustplays', 'hiddenGems', 'recommended', 'accessibility'],
  challenges: ['weeklychallenge', 'pongleaderboard', 'finalfantasyleaderboard', 'mario64speedruns', 'mario64strategies', 'topplayers', 'donkeykongachievements'],
  creations: ['pixelArt', 'Map', 'UI', 'hardware', 'fanfic'],
}

// ---- store ----
const KEY = 'revivemode.community.v1'
function loadLocal(): Post[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Post[]
  } catch {
    return []
  }
}
// Without a backend: the user's own posts, kept in this browser.
let local: Post[] = supabase ? [] : loadLocal()
// With a backend: posts from the database, newest first.
let remote: Post[] = []
let all: Post[] = [...local, ...SEED]
const subs = new Set<() => void>()

function emit() {
  all = [...remote, ...local, ...SEED]
  subs.forEach((l) => l())
}
function saveLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(local))
  } catch {
    /* ignore */
  }
}

const subscribe = (l: () => void) => {
  subs.add(l)
  return () => subs.delete(l)
}

export function usePosts(): Post[] {
  return useSyncExternalStore(subscribe, () => all)
}

// False until the first load from the database has finished.
let ready = !supabase
export const useCommunityReady = () => useSyncExternalStore(subscribe, () => ready)

// ------------------------------------------------------------ from the database

interface ProfileRef {
  display_name: string
  avatar_url: string | null
  level: number
}
interface ReplyRow {
  id: string
  body: string
  created_at: string
  profiles: ProfileRef | null
}
interface PostRow {
  id: string
  kind: Section
  user_id: string
  title: string
  body: string
  tags: string[]
  images: string[]
  views: number
  game_title: string | null
  difficulty: Challenge['difficulty'] | null
  points: number | null
  badge_name: string | null
  rules: string[]
  created_at: string
  profiles: ProfileRef | null
  post_replies: ReplyRow[]
  post_likes: { count: number }[]
  challenge_entries: { count: number }[]
}

const POST_SELECT =
  'id, kind, user_id, title, body, tags, images, views, game_title, difficulty, points, badge_name, rules, created_at,' +
  // posts ↔ profiles is linked twice (author, and via post_likes): name the author link.
  ' profiles!posts_user_id_fkey(display_name, avatar_url, level),' +
  ' post_replies(id, body, created_at, profiles(display_name, avatar_url, level)),' +
  ' post_likes(count), challenge_entries(count)'

const authorOf = (p: ProfileRef | null): Author => ({
  name: p?.display_name ?? 'Player',
  level: `lvl.${p?.level ?? 1}`,
  ...(p?.avatar_url ? { avatar: p.avatar_url } : {}),
})

const dateLabel = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function timeAgo(iso: string) {
  let n = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const steps: [number, string][] = [[60, 's'], [60, 'min'], [24, 'hrs'], [30, 'days'], [12, 'mon']]
  for (const [size, unit] of steps) {
    if (n < size) return unit === 's' ? 'now' : `${Math.floor(n)} ${unit}`
    n /= size
  }
  return `${Math.floor(n)} yrs`
}

function toPost(r: PostRow, me: string | null, liked: Set<string>): Post {
  const base = {
    id: r.id,
    title: r.title,
    author: authorOf(r.profiles),
    date: dateLabel(r.created_at),
    tags: r.tags,
    replies: [...r.post_replies]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((x) => ({ id: x.id, author: x.profiles?.display_name ?? 'Player', text: x.body, ago: timeAgo(x.created_at), replies: 0, likes: 0 })),
    mine: r.user_id === me,
    likedByMe: liked.has(r.id),
    real: true,
  }
  const likes = r.post_likes[0]?.count ?? 0
  if (r.kind === 'discussions') return { ...base, kind: 'discussions', body: r.body, likes, views: r.views, ...(r.images[0] ? { image: r.images[0] } : {}) }
  if (r.kind === 'creations') return { ...base, kind: 'creations', body: r.body, likes, images: r.images }
  return {
    ...base,
    kind: 'challenges',
    game: r.game_title ?? '',
    platform: gameByTitle(r.game_title ?? '')?.platform ?? '',
    difficulty: r.difficulty ?? 'EZ',
    competitors: r.challenge_entries[0]?.count ?? 0,
    points: r.points ?? 100,
    badge: { name: r.badge_name ?? 'Pioneer', icon: '/assets/community/trophy.png' },
    rules: r.rules,
  }
}

let loading: Promise<void> | null = null

/** Reload real posts from the database (others' new posts, fresh counts). */
export function refreshPosts(): Promise<void> {
  if (!supabase) return Promise.resolve()
  if (loading) return loading
  const sb = supabase
  loading = (async () => {
    const me = getAuth().session?.user.id ?? null
    const [posts, likes] = await Promise.all([
      sb.from('posts').select(POST_SELECT).order('created_at', { ascending: false }).limit(200),
      me ? sb.from('post_likes').select('post_id').eq('user_id', me) : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
    ])
    ready = true
    if (posts.error) {
      console.warn('Could not load community posts.', posts.error)
      return emit()
    }
    const liked = new Set((likes.data ?? []).map((l) => l.post_id as string))
    remote = (posts.data as unknown as PostRow[]).map((r) => toPost(r, me, liked))
    emit()
  })().finally(() => {
    loading = null
  })
  return loading
}

if (supabase) {
  // "mine" and "liked" depend on who is signed in, so reload on changes.
  let lastUser: string | null | undefined
  supabase.auth.onAuthStateChange((_e, session) => {
    const uid = session?.user.id ?? null
    if (uid === lastUser) return
    lastUser = uid
    setTimeout(() => refreshPosts(), 0)
  })
}

// ------------------------------------------------------------------ actions

/** Posting needs an account once the backend is configured. */
export const canPost = () => !supabase || !!getAuth().session

export type NewPostInput =
  | { kind: 'discussions'; title: string; body: string; tags: string[] }
  | { kind: 'creations'; title: string; body: string; tags: string[]; images: File[] }
  | { kind: 'challenges'; title: string; tags: string[]; game: string; difficulty: Challenge['difficulty']; rules: string[] }

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

async function uploadImages(uid: string, files: File[]) {
  if (!supabase) return []
  const urls: string[] = []
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue
    if (f.size > MAX_IMAGE_BYTES) throw new Error(`${f.name} is larger than 5 MB.`)
    const ext = (f.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${uid}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('creations').upload(path, f, { contentType: f.type })
    if (error) throw new Error(`Could not upload ${f.name}: ${error.message}`)
    urls.push(supabase.storage.from('creations').getPublicUrl(path).data.publicUrl)
  }
  return urls
}

/** Publish a post. Resolves to its id, or throws with a readable message. */
export async function addPost(p: NewPostInput): Promise<string> {
  // Local prototype: keep it in this browser.
  if (!supabase) {
    const base = {
      id: `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      title: p.title,
      author: { name: 'You', level: 'lvl.1' },
      date: dateLabel(new Date().toISOString()),
      tags: p.tags,
      replies: [],
      mine: true,
    }
    const post: Post =
      p.kind === 'discussions'
        ? { ...base, kind: 'discussions', body: p.body, likes: 0, views: 0 }
        : p.kind === 'creations'
          ? { ...base, kind: 'creations', body: p.body, likes: 0, images: p.images.map((f) => URL.createObjectURL(f)) }
          : { ...base, kind: 'challenges', game: p.game, platform: gameByTitle(p.game)?.platform ?? '', difficulty: p.difficulty, competitors: 0, points: 100, badge: { name: 'Pioneer', icon: '/assets/community/trophy.png' }, rules: p.rules }
    local = [post, ...local]
    saveLocal()
    emit()
    return post.id
  }

  const uid = getAuth().session?.user.id
  if (!uid) throw new Error('Sign in to post.')
  const images = p.kind === 'creations' ? await uploadImages(uid, p.images) : []
  const row = {
    kind: p.kind,
    user_id: uid,
    title: p.title.slice(0, 80),
    tags: p.tags,
    images,
    body: p.kind === 'challenges' ? '' : p.body,
    ...(p.kind === 'challenges' ? { game_title: p.game, difficulty: p.difficulty, points: 100, badge_name: 'Pioneer', rules: p.rules } : {}),
  }
  const { data, error } = await supabase.from('posts').insert(row).select('id').single()
  if (error) throw new Error(error.message)
  await refreshPosts()
  return data.id as string
}

/** Reply to a post. Throws with a readable message on failure. */
export async function addReply(postId: string, text: string) {
  const post = all.find((p) => p.id === postId)
  const reply = (author: string, id: string): Reply => ({ id, author, text, ago: 'now', replies: 0, likes: 0 })
  const appendTo = (list: Post[], r: Reply) => list.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, r] } : p))

  // Design samples and local-prototype posts: replies stay in this browser.
  if (!supabase || !post?.real) {
    const r = reply('You', String(Date.now()))
    if (local.some((p) => p.id === postId)) {
      local = appendTo(local, r)
      saveLocal()
    }
    all = appendTo(all, r)
    subs.forEach((l) => l())
    return
  }

  const { session, profile } = getAuth()
  if (!session) throw new Error('Sign in to reply.')
  const { data, error } = await supabase
    .from('post_replies')
    .insert({ post_id: postId, user_id: session.user.id, body: text.slice(0, 4000) })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  remote = appendTo(remote, reply(profile?.display_name ?? 'You', data.id as string))
  emit()
}

/** Like or unlike a post. Likes on design samples are not stored. */
export async function toggleLike(postId: string) {
  const post = all.find((p) => p.id === postId)
  if (!post || post.kind === 'challenges') return
  const on = !post.likedByMe
  const flip = (p: Post): Post => (p.id === postId && p.kind !== 'challenges' ? { ...p, likedByMe: on, likes: p.likes + (on ? 1 : -1) } : p)
  const uid = getAuth().session?.user.id
  if (!supabase || !post.real || !uid) {
    all = all.map(flip)
    subs.forEach((l) => l())
    return
  }
  remote = remote.map(flip)
  emit()
  const { error } = on
    ? await supabase.from('post_likes').upsert({ post_id: postId, user_id: uid }, { ignoreDuplicates: true })
    : await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', uid)
  if (error) {
    console.warn('Could not save your like.', error)
    refreshPosts()
  }
}
