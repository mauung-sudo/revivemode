import { useState } from 'react'
import Avatar from '../../components/Avatar'

// Multiplayer rooms (design: Public/Private room flows). UI only: rooms and
// players are mocked until netplay signaling exists (docs/BACKEND.md → rooms).
type View =
  | { name: 'list'; tab: 'public' | 'private' }
  | { name: 'create'; visibility: 'public' | 'private' }
  | { name: 'room'; host: boolean; code: string; roomName: string }

const PUBLIC_ROOMS = [
  { name: 'Mario speedrun', players: 3, max: 4 },
  { name: 'Chill co-op', players: 1, max: 4 },
  { name: 'Newbies welcome', players: 2, max: 4 },
  { name: 'Pros only', players: 4, max: 4 },
]
const PLAYERS = ['Casper32', 'Min89ga', 'Doc_0respect']
const randomCode = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('')

function Pixel({ children }: { children: string }) {
  return <h2 className="text-center font-pixel text-[28px] tracking-[2px]">{children}</h2>
}
function RedButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className="w-full rounded bg-primary-500 py-2 font-pixel text-[20px] tracking-[2px] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 disabled:opacity-50">
      {children}
    </button>
  )
}
function Tabs({ tab, set }: { tab: 'public' | 'private'; set: (t: 'public' | 'private') => void }) {
  return (
    <div className="grid grid-cols-2 rounded bg-neutral-800 p-1 text-[14px] font-bold">
      {(['private', 'public'] as const).map((t) => (
        <button key={t} type="button" onClick={() => set(t)} className={`rounded py-1 capitalize ${tab === t ? 'bg-neutral-50 text-black' : ''}`}>
          {t}
        </button>
      ))}
    </div>
  )
}

function MaxPlayers({ value, set }: { value: number; set: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[14px] font-bold">
        Max Players
        <span className="flex items-center gap-2">
          <button type="button" aria-label="More players" onClick={() => set(Math.min(4, value + 1))} className="rounded bg-neutral-800 px-1.5">▲</button>
          {value}
          <button type="button" aria-label="Fewer players" onClick={() => set(Math.max(2, value - 1))} className="rounded bg-neutral-800 px-1.5">▼</button>
        </span>
      </div>
      <p className="flex items-center gap-1 text-[12px] text-neutral-50">
        <span className="inline-block size-3 rounded-full bg-primary-500" /> The game allows up to 4 players
      </p>
    </div>
  )
}

export default function RoomPanel({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>({ name: 'list', tab: 'public' })
  const [code, setCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [max, setMax] = useState(3)
  const [privateCode] = useState(randomCode)
  const [players, setPlayers] = useState(PLAYERS)

  const back = (
    <button type="button" onClick={() => setView({ name: 'list', tab: view.name === 'create' ? view.visibility : 'public' })} className="flex items-center gap-2 font-pixel text-[26px] tracking-[2px]">
      <img src="/assets/game/back.png" alt="" className="size-5" /> Create room
    </button>
  )

  return (
    <div role="dialog" aria-label="Rooms" className="relative w-[300px] max-w-[calc(100vw-32px)] rounded-lg bg-neutral-700 p-4 shadow-[0_0_16px_black]">
      <button type="button" onClick={onClose} aria-label="Close rooms" className="absolute -right-3 -top-3 size-7 rounded-full bg-[#2a2a2a] p-1.5">
        <img src="/assets/game/close-x.png" alt="" className="pixelated size-full" />
      </button>

      {view.name === 'list' && (
        <div className="flex flex-col gap-3">
          <Pixel>Rooms</Pixel>
          <Tabs tab={view.tab} set={(tab) => setView({ name: 'list', tab })} />
          <button type="button" onClick={() => setView({ name: 'create', visibility: view.tab })} className="rounded border border-neutral-50 py-1.5 font-pixel text-[20px] tracking-[2px] hover:bg-white/10">
            CREATE ROOM
          </button>
          <p className="text-center font-pixel text-[18px]">OR</p>
          {view.tab === 'public' ? (
            <table className="w-full overflow-hidden rounded bg-neutral-800 text-[12px]">
              <thead>
                <tr className="text-secondary-500">
                  <th className="p-2.5 text-left">Name</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {PUBLIC_ROOMS.map((r) => (
                  <tr key={r.name} className="border-t border-neutral-700">
                    <td className="p-2.5">{r.name}</td>
                    <td className="p-2.5 text-right">
                      {r.players >= r.max ? (
                        'Full'
                      ) : (
                        <>
                          {r.players}/{r.max}{' '}
                          <button type="button" onClick={() => setView({ name: 'room', host: false, code: randomCode(), roomName: r.name })} className="ml-1 underline hover:text-secondary-400">
                            Join
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (code.length === 6) setView({ name: 'room', host: false, code, roomName: 'Private room' })
              }}
              className="flex flex-col gap-3"
            >
              <label htmlFor="room-code" className="text-center text-[12px]">
                Join with code
              </label>
              <div className="relative">
                <input
                  id="room-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  className="absolute inset-0 opacity-0"
                  autoComplete="off"
                />
                <div className="pointer-events-none grid grid-cols-6 gap-1">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i} className="flex h-9 items-center justify-center rounded bg-neutral-600 font-pixel text-[30px]">
                      {code[i] ?? ''}
                    </span>
                  ))}
                </div>
              </div>
              <RedButton type="submit" disabled={code.length !== 6}>
                JOIN
              </RedButton>
            </form>
          )}
        </div>
      )}

      {view.name === 'create' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setView({ name: 'room', host: true, code: privateCode, roomName: roomName || 'My room' })
          }}
          className="flex flex-col gap-4"
        >
          {back}
          {view.visibility === 'public' ? (
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              aria-label="Room name"
              className="rounded bg-neutral-600 px-3 py-2 text-center text-[12px] placeholder:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            />
          ) : (
            <CodeDisplay code={privateCode} />
          )}
          <MaxPlayers value={max} set={setMax} />
          <RedButton type="submit">CREATE</RedButton>
        </form>
      )}

      {view.name === 'room' && (
        <div className="flex flex-col gap-3">
          <Pixel>Current Room</Pixel>
          <CodeDisplay code={view.code} />
          <button type="button" onClick={() => setView({ name: 'list', tab: 'public' })} className="rounded border border-neutral-50 py-1.5 text-[14px] font-bold hover:bg-white/10">
            {view.host ? 'Delete this room' : 'Exit this room'}
          </button>
          <p className="flex items-center gap-2 text-[16px] font-bold">
            <img src="/assets/game/players.png" alt="" className="pixelated size-4" /> Players
          </p>
          <ul className="overflow-hidden rounded bg-neutral-800">
            {players.map((p) => (
              <li key={p} className="flex items-center gap-3 border-t border-neutral-700 px-3 py-2.5 text-[14px] font-bold first:border-t-0">
                <Avatar size={24} />
                <span className="flex-1">{p}</span>
                {view.host && (
                  <button type="button" onClick={() => setPlayers((ps) => ps.filter((x) => x !== p))} className="text-[12px] font-normal underline hover:text-primary-500">
                    Kick
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {})
        setTimeout(() => setCopied(false), 1500)
      }}
      className="flex flex-col items-center gap-1"
    >
      <img src="/assets/game/copy.svg" alt="" width={24} height={24} />
      <span className="text-[12px]">{copied ? 'Copied!' : 'Copy code'}</span>
      <span className="font-pixel text-[36px] leading-none tracking-[4px]">{code}</span>
    </button>
  )
}
