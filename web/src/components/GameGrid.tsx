import { useSearchParams } from 'react-router-dom'
import type { MockGame } from '../data/games'
import TvCard from './TvCard'

const PAGE = 8

export default function GameGrid({ games, empty = 'No games match these filters.' }: { games: MockGame[]; empty?: string }) {
  const [params, setParams] = useSearchParams()
  const pages = Math.max(1, Math.ceil(games.length / PAGE))
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1))
  const shown = games.slice((page - 1) * PAGE, page * PAGE)

  const go = (n: number) => {
    const p = new URLSearchParams(params)
    if (n === 1) p.delete('page')
    else p.set('page', String(n))
    setParams(p, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!games.length) return <p className="py-16 text-center font-pixel text-[24px] text-neutral-50">{empty}</p>

  return (
    <div className="flex flex-col items-center pb-6">
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-items-center gap-6 py-4 sm:grid-cols-[repeat(auto-fill,238px)] sm:justify-between">
        {shown.map((g) => (
          <TvCard key={g.id} game={g} className="max-sm:w-full" />
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center gap-2 py-4 font-pixel text-[20px]">
          <button type="button" disabled={page === 1} onClick={() => go(page - 1)} className="px-3 py-1 disabled:opacity-40">
            Previous
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => go(n)}
              className={`size-9 rounded ${n === page ? 'bg-secondary-500 text-black' : 'hover:bg-neutral-600'}`}
            >
              {n}
            </button>
          ))}
          <button type="button" disabled={page === pages} onClick={() => go(page + 1)} className="px-3 py-1 disabled:opacity-40">
            Next
          </button>
        </nav>
      )}
    </div>
  )
}
