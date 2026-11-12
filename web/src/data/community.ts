import { useSyncExternalStore } from 'react'

// Community content. Seeded from the Figma design; posts the user creates
// are kept in localStorage until the backend exists (docs/BACKEND.md →
// discussions, challenges, creations, replies).

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
function loadMine(): Post[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Post[]
  } catch {
    return []
  }
}
let mine = loadMine()
let all: Post[] = [...mine, ...SEED]
const subs = new Set<() => void>()

export function usePosts(): Post[] {
  return useSyncExternalStore(
    (l) => {
      subs.add(l)
      return () => subs.delete(l)
    },
    () => all,
  )
}

export function addPost(p: Post) {
  mine = [{ ...p, mine: true }, ...mine]
  all = [...mine, ...SEED]
  try {
    localStorage.setItem(KEY, JSON.stringify(mine))
  } catch {
    /* ignore */
  }
  subs.forEach((l) => l())
}

export function addReply(postId: string, text: string) {
  const r: Reply = { id: String(Date.now()), author: 'You', text, ago: 'now', replies: 0, likes: 0 }
  all = all.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, r] } : p))
  mine = mine.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, r] } : p))
  try {
    localStorage.setItem(KEY, JSON.stringify(mine))
  } catch {
    /* ignore */
  }
  subs.forEach((l) => l())
}
