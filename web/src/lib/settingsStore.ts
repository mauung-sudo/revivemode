import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'

// Player settings from the Profile → Settings screens, plus the keyboard map
// from the game page. Always kept in this browser; when signed in they are
// also saved to the account (profiles.settings) and follow the player to
// other devices. The account copy wins on sign-in; an account with no saved
// settings gets this browser's settings.
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
  /** Keyboard map: emulator button → key label (game page Controls table). */
  controls: Record<string, string>
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
  controls: { up: 'up', down: 'down', left: 'left', right: 'right', A: 'X', B: 'Z', SELECT: 'SHIFT', START: 'ENTER' },
}

const KEY = 'revivemode.settings.v1'
const OLD_CONTROLS_KEY = 'revivemode.controls.v1' // before controls joined settings

let state: Settings = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<Settings>
    const oldControls = JSON.parse(localStorage.getItem(OLD_CONTROLS_KEY) || '{}') as Record<string, string>
    return { ...DEFAULT_SETTINGS, ...saved, controls: { ...DEFAULT_SETTINGS.controls, ...oldControls, ...saved.controls } }
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

function apply(next: Settings) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  subs.forEach((l) => l())
}

export function updateSettings(patch: Partial<Settings>) {
  apply({ ...state, ...patch })
  scheduleSave()
}

// ------------------------------------------------------------ account sync

// Prototype-only fields: the account has its own name and email.
type Synced = Omit<Settings, 'displayName' | 'email'>
const toSynced = ({ displayName: _n, email: _e, ...rest }: Settings): Synced => rest

let userId: string | null = null
let timer: ReturnType<typeof setTimeout> | undefined

function scheduleSave() {
  if (!supabase || !userId) return
  const sb = supabase
  const uid = userId
  clearTimeout(timer)
  // Batch quick changes (typing, several toggles) into one write.
  timer = setTimeout(async () => {
    if (userId !== uid) return
    const { error } = await sb.from('profiles').update({ settings: toSynced(state) }).eq('id', uid)
    if (error) console.warn('Could not save settings to your account.', error)
  }, 700)
}

async function loadAccount(uid: string) {
  if (!supabase) return
  const { data, error } = await supabase.from('profiles').select('settings').eq('id', uid).maybeSingle()
  if (error || userId !== uid) return
  const remote = (data?.settings ?? {}) as Partial<Synced>
  if (Object.keys(remote).length === 0) return scheduleSave() // new account: keep this browser's settings
  apply({
    ...DEFAULT_SETTINGS,
    ...remote,
    displayName: state.displayName,
    email: state.email,
    controls: { ...DEFAULT_SETTINGS.controls, ...remote.controls },
  })
}

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user.id ?? null
    if (uid === userId) return
    userId = uid
    clearTimeout(timer)
    // Deferred: Supabase warns against awaiting inside this callback.
    if (uid) setTimeout(() => loadAccount(uid), 0)
  })
}

export function resetSettings() {
  updateSettings(DEFAULT_SETTINGS)
}
