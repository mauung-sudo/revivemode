import { getAuth } from './auth'
import { supabase } from './supabase'

// Cloud save states. Each game has SLOTS slots per account. The state file
// (gzipped) lives in the private 'saves' bucket at <user_id>/<game_id>/<slot>.state
// and save_states holds one row per slot for listing. Needs an account and a
// backend; the emulator's own menu still has local, in-browser saves.

export const SLOTS = 3

export interface SlotInfo {
  slot: number
  updatedAt: string
}

const pathFor = (uid: string, gameId: string, slot: number) => `${uid}/${gameId}/${slot}.state`

function userId(): string {
  const uid = getAuth().session?.user.id
  if (!supabase || !uid) throw new Error('Sign in to use cloud saves.')
  return uid
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}
const gzip = (b: Uint8Array) => pipe(b, new CompressionStream('gzip'))
const gunzip = (b: Uint8Array) => pipe(b, new DecompressionStream('gzip'))

/** Filled slots for this game, by slot number. */
export async function listSlots(gameId: string): Promise<Map<number, SlotInfo>> {
  const uid = userId()
  const { data, error } = await supabase!.from('save_states').select('slot, updated_at').eq('user_id', uid).eq('game_id', gameId)
  if (error) throw new Error(error.message)
  return new Map((data ?? []).map((r) => [r.slot as number, { slot: r.slot as number, updatedAt: r.updated_at as string }]))
}

export async function saveSlot(gameId: string, slot: number, state: Uint8Array): Promise<SlotInfo> {
  const uid = userId()
  const path = pathFor(uid, gameId, slot)
  const body = await gzip(state)
  const up = await supabase!.storage.from('saves').upload(path, body, { upsert: true, contentType: 'application/gzip' })
  if (up.error) throw new Error(up.error.message)
  const updatedAt = new Date().toISOString()
  const { error } = await supabase!
    .from('save_states')
    .upsert({ user_id: uid, game_id: gameId, slot, storage_path: path, updated_at: updatedAt }, { onConflict: 'user_id,game_id,slot' })
  if (error) throw new Error(error.message)
  return { slot, updatedAt }
}

export async function loadSlot(gameId: string, slot: number): Promise<Uint8Array> {
  const uid = userId()
  const { data, error } = await supabase!.storage.from('saves').download(pathFor(uid, gameId, slot))
  if (error || !data) throw new Error(error?.message ?? 'Save not found.')
  return gunzip(new Uint8Array(await data.arrayBuffer()))
}

export async function deleteSlot(gameId: string, slot: number) {
  const uid = userId()
  const { error } = await supabase!.from('save_states').delete().eq('user_id', uid).eq('game_id', gameId).eq('slot', slot)
  if (error) throw new Error(error.message)
  await supabase!.storage.from('saves').remove([pathFor(uid, gameId, slot)])
}

// ------------------------------------------------- talking to the player iframe

let nextId = 0

/** Ask public/player.html for its state, or hand it one to load. */
function ask<T>(frame: HTMLIFrameElement | null, msg: Record<string, unknown>, transfer: Transferable[] = []): Promise<T> {
  const win = frame?.contentWindow
  if (!win) return Promise.reject(new Error('Start the game first.'))
  const id = ++nextId
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => done(new Error('The emulator did not answer.')), 10000)
    function onMessage(e: MessageEvent) {
      if (e.origin !== location.origin || e.source !== win || e.data?.id !== id) return
      done(e.data.error ? new Error(e.data.error) : null, e.data)
    }
    function done(err: Error | null, data?: T) {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      if (err) reject(err)
      else resolve(data as T)
    }
    window.addEventListener('message', onMessage)
    win.postMessage({ ...msg, id }, location.origin, transfer)
  })
}

export const getFrameState = (frame: HTMLIFrameElement | null) =>
  ask<{ state: Uint8Array }>(frame, { type: 'revivemode:getState' }).then((r) => r.state)

export const loadFrameState = (frame: HTMLIFrameElement | null, state: Uint8Array) =>
  ask<{ ok: true }>(frame, { type: 'revivemode:loadState', state }, [state.buffer as ArrayBuffer]).then(() => undefined)
