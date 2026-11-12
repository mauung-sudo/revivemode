import { useSyncExternalStore } from 'react'

// Player settings from the Profile → Settings screens. Stored locally;
// later synced to the user's profile (docs/BACKEND.md → profiles.settings).
export interface Settings {
  autosave: boolean
  autoload: boolean
  pauseOnBlur: boolean
  frameSkip: 'Auto' | 'Off' | '1' | '2'
  cloudSync: boolean
  console: 'NES' | 'SNES' | 'Sega Genesis' | 'Game Boy'
  preset: string
  controllerSupport: boolean
  vibration: boolean
  scale: '1x' | '2x' | '3x' | '4x'
  aspect: 'Original' | '4:3' | '16:9' | 'Stretch'
  vsync: boolean
  smoothing: boolean
  displayName: string
  email: string
  theme: 'Dark' | 'Darker' | 'High contrast'
  notifyReplies: boolean
  notifyChallenges: boolean
  reduceMotion: boolean
  largeText: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  autosave: true,
  autoload: true,
  pauseOnBlur: true,
  frameSkip: 'Auto',
  cloudSync: true,
  console: 'NES',
  preset: 'Default NES Layout',
  controllerSupport: true,
  vibration: false,
  scale: '2x',
  aspect: 'Original',
  vsync: true,
  smoothing: false,
  displayName: 'BAMx2',
  email: '',
  theme: 'Dark',
  notifyReplies: true,
  notifyChallenges: true,
  reduceMotion: false,
  largeText: false,
}

const KEY = 'revivemode.settings.v1'
let state: Settings = (() => {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
})()
const subs = new Set<() => void>()

export function useSettings() {
  return useSyncExternalStore(
    (l) => {
      subs.add(l)
      return () => subs.delete(l)
    },
    () => state,
  )
}

export function updateSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  subs.forEach((l) => l())
}

export function resetSettings() {
  updateSettings(DEFAULT_SETTINGS)
}
