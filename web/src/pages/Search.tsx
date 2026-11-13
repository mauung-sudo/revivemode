import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import GameGrid from '../components/GameGrid'
import { useGames } from '../lib/catalog'
import { useFilteredGames } from '../lib/gameFilter'

const TABS = ['Games', 'Discussions', 'Challenges', 'Fan creations'] as const

// Universal search overlay: empty → typing → found.
// Discussions/Challenges/Fan creations counts come from the community flow later.
export default function Search() {
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const { filters, update, results } = useFilteredGames(useGames())
  const [tab, setTab] = useState<(typeof TABS)[number]>('Games')
  const q = filters.q.trim()
  const close = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/'))

  useEffect(() => {
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const counts: Record<(typeof TABS)[number], number> = { Games: results.length, Discussions: 0, Challenges: 0, 'Fan creations': 0 }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(38,38,38,0.8)] backdrop-blur-[12.5px]" role="dialog" aria-label="Search">
      <div className="mx-auto flex max-w-[1024px] flex-col items-center px-4 py-8 lg:px-0">
        <div className="flex h-[68px] w-full items-center justify-end py-2">
          <button type="button" onClick={close} className="flex items-center gap-2 px-1">
            <span className="rounded-full bg-white p-2">
              <img src="/assets/ui/close.png" alt="" className="size-4" />
            </span>
            <span className="font-pixel text-[32px] leading-[18px] tracking-[1.6px]">CLOSE</span>
          </button>
        </div>
        <label
          className={`flex w-[568px] max-w-full items-center gap-2.5 rounded-lg border bg-neutral-800 px-4 py-3 ${
            q ? 'border-[#47dfa0]' : 'border-neutral-400'
          }`}
        >
          <img src="/assets/ui/search.png" alt="" className="size-6" />
          <input
            ref={input}
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Games, topics, discussions"
            className="min-w-0 flex-1 bg-transparent text-[25px] font-bold leading-10 placeholder:text-white focus:outline-none max-md:text-[18px]"
          />
        </label>

        {q && (
          <>
            <p className="px-6 pt-4 text-center text-[14px] leading-[35px]">
              {results.length} result{results.length === 1 ? '' : 's'} found in “{q}”
            </p>
            <div role="tablist" className="no-scrollbar flex w-full justify-center gap-4 overflow-x-auto max-md:justify-start">
              {TABS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 px-6 py-3 text-[25px] font-bold leading-10 max-md:px-3 max-md:text-[18px] ${
                    tab === t ? 'text-secondary-400' : 'text-[#d1d1d1] hover:text-white'
                  }`}
                >
                  {t}({counts[t]})
                </button>
              ))}
            </div>
            <div className="w-full">
              {tab === 'Games' ? (
                <>
                  <FilterBar filters={filters} update={update} sortFirst />
                  <GameGrid games={results} empty="No games found. Try another title or platform." />
                </>
              ) : (
                <p className="py-16 text-center font-pixel text-[24px] text-neutral-50">Community search arrives with the Community flow.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
