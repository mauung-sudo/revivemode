import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Optional backend. With no keys in web/.env.local the app runs fully on
// localStorage (prototype mode); with keys, features switch to Supabase one
// by one (see docs/BACKEND.md → "Wiring order").
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
export const hasBackend = supabase !== null
