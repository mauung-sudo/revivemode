import { useEffect, useState } from 'react'

const BUTTONS = ['up', 'down', 'left', 'right', 'A', 'B', 'SELECT', 'START'] as const
type Btn = (typeof BUTTONS)[number]
const DEFAULT: Record<Btn, string> = { up: 'up', down: 'down', left: 'left', right: 'right', A: 'X', B: 'Z', SELECT: 'SHIFT', START: 'ENTER' }
const KEY = 'revivemode.controls.v1'

function load(): Record<Btn, string> {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return DEFAULT
  }
}

const keyLabel = (e: KeyboardEvent) =>
  e.key.startsWith('Arrow') ? e.key.slice(5).toLowerCase() : e.key === ' ' ? 'SPACE' : e.key.length === 1 ? e.key.toUpperCase() : e.key.toUpperCase()

// Keyboard map shown beside the player. P2 is assigned when a second player joins a room.
// Saved locally; the emulator's own "Control Settings" menu applies in-game remaps.
export default function ControlTable({ controller }: { controller?: string }) {
  const [map, setMap] = useState(load)
  const [editing, setEditing] = useState(false)
  const [listening, setListening] = useState<Btn | null>(null)

  useEffect(() => {
    if (!listening) return
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key !== 'Escape') {
        const next = { ...map, [listening]: keyLabel(e) }
        setMap(next)
        try {
          localStorage.setItem(KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
      }
      setListening(null)
    }
    window.addEventListener('keydown', onKey, { once: true })
    return () => window.removeEventListener('keydown', onKey)
  }, [listening, map])

  return (
    <div className="flex w-[303px] shrink-0 flex-col items-center gap-3 px-4 pb-4 max-lg:w-full max-lg:px-0">
      {controller && (
        <div className="relative h-[146px] w-[270px] overflow-hidden">
          <img src={controller} alt="Controller" className="absolute left-0 top-[-55.67%] h-[212.77%] w-full max-w-none" />
        </div>
      )}
      <table className="w-[271px] overflow-hidden rounded-lg bg-neutral-700 text-center text-[16px] font-bold max-lg:w-full">
        <thead>
          <tr className="text-secondary-500">
            <th className="p-4 text-left">Control</th>
            <th className="p-4">P1</th>
            <th className="p-4">P2</th>
          </tr>
        </thead>
        <tbody>
          {BUTTONS.map((b) => (
            <tr key={b} className="border-t-2 border-neutral-700 bg-neutral-800">
              <td className="px-4 py-3">{b}</td>
              <td className="px-2 py-1.5">
                {editing ? (
                  <button
                    type="button"
                    onClick={() => setListening(b)}
                    className={`w-full rounded px-2 py-1.5 ${listening === b ? 'animate-pulse bg-secondary-500 text-black' : 'bg-neutral-600 hover:bg-neutral-500'}`}
                  >
                    {listening === b ? 'press…' : map[b]}
                  </button>
                ) : (
                  map[b]
                )}
              </td>
              <td className="px-4 py-3 text-neutral-400">Control</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => {
          setEditing((e) => !e)
          setListening(null)
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[radial-gradient(ellipse_at_50%_0%,#383838,#2e2e2e)] px-3 py-2 font-pixel text-[20px] leading-[18px] tracking-[1px] shadow-[0_0_8px_black,0_0_4px_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:text-secondary-400"
      >
        <img src="/assets/game/edit.png" alt="" className="size-5" />
        {editing ? 'DONE' : 'EDIT CONTROLS'}
      </button>
      {editing && <p className="text-center text-[12px] text-neutral-50">Click a P1 key, then press the new key. Esc cancels.</p>}
    </div>
  )
}
