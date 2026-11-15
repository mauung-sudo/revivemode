import { useSyncExternalStore } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Sign-in state for the whole app. Without a backend (no keys in
// .env.local) everything stays signed out and the app keeps working on
// localStorage.

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  level: number
  created_at: string
}

export type Provider = 'google' | 'discord'

interface AuthState {
  ready: boolean // first session check finished
  session: Session | null
  profile: Profile | null
  providers: Provider[] // OAuth providers switched on in Supabase
  modalOpen: boolean
}

let state: AuthState = { ready: !supabase, session: null, profile: null, providers: [], modalOpen: false }
const listeners = new Set<() => void>()
const set = (patch: Partial<AuthState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

async function loadProfile(userId: string) {
  if (!supabase) return
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, level, created_at')
    .eq('id', userId)
    .maybeSingle()
  // Ignore a late answer for a user who has since signed out.
  if (state.session?.user.id === userId) set({ profile: (data as Profile | null) ?? null })
}

if (supabase) {
  const sb = supabase
  sb.auth.onAuthStateChange((event, session) => {
    const changedUser = session?.user.id !== state.session?.user.id
    set({ session, ready: true, ...(session ? {} : { profile: null }), ...(session && event === 'SIGNED_IN' ? { modalOpen: false } : {}) })
    // Defer the query: Supabase warns against awaiting inside this callback.
    if (session && changedUser) setTimeout(() => loadProfile(session.user.id), 0)
  })

  // Show only the providers that are actually enabled in the dashboard.
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    .then((r) => r.json())
    .then((s: { external?: Record<string, boolean> }) =>
      set({ providers: (['google', 'discord'] as const).filter((p) => s.external?.[p]) }),
    )
    .catch(() => {})
}

export const useAuth = () => useSyncExternalStore(subscribe, () => state)
/** Current sign-in state outside React (event handlers, stores). */
export const getAuth = () => state

export const openSignIn = () => set({ modalOpen: true })
export const closeSignIn = () => set({ modalOpen: false })

// Return to the page the user signed in from.
const redirectTo = () => window.location.origin + window.location.pathname

export async function signInWithEmail(email: string) {
  if (!supabase) return 'Accounts are not set up yet.'
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } })
  if (!error) return null
  if (error.status === 429) return 'Too many sign-in emails. Please wait a while and try again.'
  return error.message
}

export async function signInWithProvider(provider: Provider) {
  if (!supabase) return
  await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } })
}

export async function signOut() {
  await supabase?.auth.signOut()
}

export async function updateDisplayName(displayName: string) {
  const id = state.session?.user.id
  if (!supabase || !id) return 'Not signed in.'
  const name = displayName.trim()
  if (!name) return 'Display name cannot be empty.'
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: name.slice(0, 40) })
    .eq('id', id)
    .select('id, username, display_name, avatar_url, level, created_at')
    .single()
  if (error) return error.message
  set({ profile: data as Profile })
  return null
}
