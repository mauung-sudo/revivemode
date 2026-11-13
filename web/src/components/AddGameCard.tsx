import { useEffect, useRef, useState } from 'react'
import type { MockGame } from '../data/games'
import { useGames } from '../lib/catalog'

// "Search any games to add" card. States from the design: default → typing → selected.
export default function AddGameCard({ exclude, onAdd }: { exclude: string[]; onAdd: (id: string) => void }) {
  const all = useGames()
  const [mode, setMode] = useState<'idle' | 'typing' | 'selected'>('idle')
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<MockGame | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode !== 'idle') input.current?.focus()
  }, [mode])

  const matches = q.trim()
    ? all.filter((g) => !exclude.includes(g.id) && g.title.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6)
    : []

  const reset = () => {
    setMode('idle')
    setQ('')
    setPicked(null)
  }

  return (
    <div className="flex h-[377px] w-[238px] shrink-0 flex-col overflow-hidden rounded-2xl border-[6px] border-[#2f2f2f] bg-[#2f2f2f] shadow-[0_0_8px_rgba(0,0,0,0.5)] max-sm:w-full">
      {mode === 'idle' ? (
        <button
          type="button"
          onClick={() => setMode('typing')}
          className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-400 bg-[#1d1d1d] hover:border-secondary-500"
        >
          <img src="/assets/ui/search.png" alt="" className="pixelated size-12 grayscale" />
          <span className="font-pixel text-[16px] tracking-[0.8px]">Search any games to add</span>
        </button>
      ) : (
        <div className={`flex flex-1 flex-col rounded-xl border bg-neutral-800 ${mode === 'typing' ? 'border-[#47dfa0]' : 'border-neutral-400'}`}>
          <label className="flex items-center gap-2 border-b border-neutral-400 px-3 py-3">
            <img src="/assets/ui/search.png" alt="" className="size-4 grayscale" />
            <input
              ref={input}
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setMode('typing')
                setPicked(null)
              }}
              onKeyDown={(e) => e.key === 'Escape' && reset()}
              placeholder="Game title"
              className="min-w-0 flex-1 bg-transparent text-[16px] focus:outline-none"
            />
            <button type="button" onClick={reset} aria-label="Cancel" className="text-neutral-400 hover:text-white">
              ✕
            </button>
          </label>
          {mode === 'typing' && (
            <ul className="flex-1 overflow-y-auto py-2">
              {matches.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(g)
                      setMode('selected')
                    }}
                    className="w-full px-4 py-1.5 text-left text-[16px] hover:bg-neutral-600"
                  >
                    {g.title}
                  </button>
                </li>
              ))}
              {q.trim() && !matches.length && <li className="px-4 py-2 text-[14px] text-neutral-400">No games found</li>}
            </ul>
          )}
          {mode === 'selected' && picked && (
            <>
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-3">
                <img src={picked.cover} alt="" className="h-[110px] w-20 rounded object-cover" />
                <p className="text-center text-[18px] font-bold">{picked.title}</p>
                <div className="flex gap-1">
                  {[picked.genre, picked.platform].map((t) => (
                    <span key={t} className="rounded-full bg-black px-2 py-1 text-[14px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(picked.id)
                  reset()
                }}
                className="flex h-[90px] items-center justify-center gap-3 border-t border-neutral-400 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] font-pixel text-[56px] leading-none hover:text-secondary-400"
              >
                + Add
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
