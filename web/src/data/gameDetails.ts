import type { MockGame } from './games'

// Long-form game info for the details page. Mock until the backend
// provides it (docs/BACKEND.md → games table).
export interface GameInfo {
  publisher: string
  series?: string
  plot: string
  gameplay: string
  screenshots: string[]
}

const INFO: Record<string, GameInfo> = {
  'super-mario-bros': {
    publisher: 'Nintendo',
    series: 'Super Mario',
    plot: 'Following the events of Mario Bros., the game is set in the fantasy land of the Mushroom Kingdom after Mario had arrived through a clay pipe from New York City.',
    gameplay:
      "In Super Mario Bros., the player controls Mario, the protagonist of the series. Mario's brother, Luigi, is controlled by the second player in the game's multiplayer mode and assumes the same plot role and functionality as Mario. The objective is to race through the Mushroom Kingdom, survive the main antagonist Bowser's forces, and save Princess Toadstool. It is a side-scrolling platform game where the player moves to the right to reach the flagpole at the end of each level.",
    screenshots: ['/assets/game/ss-1.png', '/assets/game/ss-2.png', '/assets/game/ss-3.png', '/assets/game/ss-4.png'],
  },
  'test-pattern': {
    publisher: 'Revive Mode',
    plot: 'A tiny homebrew ROM made for this project. It fills the screen with a single color so we can check the emulator pipeline end to end.',
    gameplay: 'There is nothing to play: if you see a blue screen, the emulator, the ROM loader and the cross-origin isolation headers are all working.',
    screenshots: [],
  },
}

export function gameInfo(g: MockGame): GameInfo {
  return (
    INFO[g.id] ?? {
      publisher: '—',
      plot: `${g.title} is a ${g.year} ${g.genre.toLowerCase()} game for the ${g.platform}.`,
      gameplay: 'Full description coming soon.',
      screenshots: [],
    }
  )
}

export interface Comment {
  id: string
  user: string
  text: string
  ago: string
  replies: number
  likes: number
}

export const SAMPLE_COMMENTS = (title: string): Comment[] => [
  { id: 'c1', user: 'GamePro2000', text: `Just finished playing ${title}! Such a classic game.`, ago: '3min', replies: 2, likes: 50 },
  { id: 'c2', user: 'RetroGamer88', text: `${title} never gets old!`, ago: '3 mon', replies: 10, likes: 83 },
  { id: 'c3', user: 'PlayerOneX', text: `Just beat the final boss in ${title}!`, ago: '2 hrs', replies: 10, likes: 109 },
  { id: 'c4', user: 'EpicGamer23', text: `${title} is the best :>`, ago: '19 min', replies: 10, likes: 78 },
  { id: 'c5', user: 'PixelWarrior', text: `Just discovered a secret in ${title}`, ago: '4 days', replies: 10, likes: 71 },
  { id: 'c6', user: 'CasualGamerGirl', text: `Played ${title} for the first time. Can't believe what I've been missing!`, ago: '1 day', replies: 10, likes: 89 },
]
