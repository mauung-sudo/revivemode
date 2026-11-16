import { useEffect, useState } from 'react'
import { timeAgo } from '../../data/community'
import { openSignIn, useAuth } from '../../lib/auth'
import { listSlots, SLOTS, type SlotInfo } from '../../lib/cloudSaves'
import { hasBackend } from '../../lib/supabase'

// What "Start game" opens: start fresh, continue from a cloud save, or (for
// games we can't host) load your own copy. The emulator's own Save State /
// Load State buttons then use the chosen cloud slot.
interface Props {
  gameId: string
  /** We host the file (free homebrew); otherwise the player brings a ROM. */
  hosted: boolean
  /** Name of a matching ROM already picked this visit, if any. */
  localRom: string | null
  /** File advice for this system (e.g. which PlayStation image format). */
  hint?: string
  onNew: (slot: number) => void
  onContinue: (slot: number) => void
  onLoadCopy: (slot: number, continueFrom: boolean) => void
  onClose: () => void
}

export default function StartChooser({ gameId, hosted, localRom, hint, onNew, onContinue, onLoadCopy, onClose }: Props) {
  const { session } = useAuth()
  const uid = session?.user.id
  const [slots, setSlots] = useState<Map<number, SlotInfo> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid || !hasBackend) return
    let live = true
    listSlots(gameId)
      .then((s) => live && setSlots(s))
      .catch((e) => live && setError(e.message))
    return () => {
      live = false
    }
  }, [gameId, uid])

  const cloud = hasBackend && !!uid
  // A new game saves into the first empty slot (slot 1 when all are full).
  const freeSlot = slots ? (Array.from({ length: SLOTS }, (_, i) => i).find((i) => !slots.has(i)) ?? 0) : 0
  const saved = slots ? [...slots.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : []
  const canPlay = hosted || !!localRom

  const big = 'w-full rounded bg-secondary-500 px-5 py-2 font-pixel text-[24px] tracking-[1.2px] text-black hover:bg-secondary-400 max-md:text-[20px]'
  const ghost = 'w-full rounded border border-white px-5 py-2 font-pixel text-[22px] tracking-[1.1px] hover:bg-white/10 max-md:text-[18px]'

  const startFresh = () => (canPlay && !hosted && localRom ? onNew(freeSlot) : hosted ? onNew(freeSlot) : onLoadCopy(freeSlot, false))
  const continueFrom = (slot: number) => (canPlay ? onContinue(slot) : onLoadCopy(slot, true))

  return (
    <div role="dialog" aria-label="Start game" className="relative flex w-[380px] max-w-[calc(100%-32px)] flex-col items-center gap-3 rounded-xl bg-black/85 p-6 text-center">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute -right-3 -top-3 size-7 rounded-full bg-[#2a2a2a] p-1.5">
        <img src="/assets/game/close-x.png" alt="" className="pixelated size-full" />
      </button>
      <p className="font-pixel text-[30px] tracking-[1.5px]">START GAME</p>

      {hosted || localRom ? (
        <button type="button" onClick={startFresh} className={big}>
          NEW GAME
        </button>
      ) : null}
      {!hosted && (
        <button type="button" onClick={() => onLoadCopy(freeSlot, false)} className={hosted || localRom ? ghost : big}>
          {localRom ? 'LOAD A DIFFERENT COPY' : 'LOAD YOUR COPY'}
        </button>
      )}
      {!hosted && !localRom && <p className="text-[13px] text-neutral-50">This game isn’t free to share, so pick a ROM you own. It stays on your device and is never uploaded.</p>}
      {!hosted && hint && <p className="text-[12px] text-neutral-400">{hint}</p>}

      <div className="mt-1 w-full border-t border-neutral-600 pt-3">
        <p className="mb-2 font-pixel text-[22px] tracking-[1.1px]">CLOUD SAVE</p>
        {!hasBackend ? (
          <p className="text-[13px] text-neutral-50">Cloud saves need the online backend. The emulator menu still saves in this browser.</p>
        ) : !cloud ? (
          <p className="text-[13px] text-neutral-50">
            <button type="button" onClick={openSignIn} className="font-bold text-secondary-400 underline">
              Sign in
            </button>{' '}
            to continue from your saves on any device.
          </p>
        ) : slots === null && !error ? (
          <p className="text-[13px] text-neutral-50">Looking for your saves…</p>
        ) : saved.length ? (
          <ul className="flex flex-col gap-2">
            {saved.map((s) => (
              <li key={s.slot}>
                <button type="button" onClick={() => continueFrom(s.slot)} className="flex w-full items-center justify-between rounded bg-neutral-700 px-3 py-2 text-left hover:bg-neutral-600">
                  <span className="font-pixel text-[20px] tracking-[1px]">CONTINUE · SLOT {s.slot + 1}</span>
                  <span className="text-[12px] text-neutral-50">{timeAgo(s.updatedAt)} ago</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-neutral-50">No cloud saves for this game yet.</p>
        )}
        {cloud && <p className="mt-2 text-[12px] text-neutral-400">A new game saves to slot {freeSlot + 1} when you use Save State in the emulator menu.</p>}
        {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      </div>
    </div>
  )
}
