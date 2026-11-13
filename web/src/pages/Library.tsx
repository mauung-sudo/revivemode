import { useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AddGameCard from '../components/AddGameCard'
import FilterBar from '../components/FilterBar'
import GameGrid from '../components/GameGrid'
import TvCard from '../components/TvCard'
import type { MockGame } from '../data/games'
import { useGame, useGamesByIds } from '../lib/catalog'
import { useFilteredGames } from '../lib/gameFilter'
import { library, useLibrary } from '../lib/libraryStore'

export function ContinuePlaying() {
  const { lastPlayed } = useLibrary()
  const game = useGame(lastPlayed)
  if (!game) return null
  return (
    <Link
      to={`/games/${game.id}/play`}
      className="flex shrink-0 items-center gap-3 rounded-lg bg-neutral-600 p-2 shadow-[0_0_8px_black,0_0_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-neutral-500"
    >
      <img src={game.cover} alt="" className="h-12 w-[34px] object-cover" />
      <span className="flex flex-col gap-1">
        <span className="text-[14px] text-neutral-50">{game.title}</span>
        <span className="text-[16px] font-bold leading-4">Continue playing</span>
      </span>
      <img src="/assets/library/triple-forward.png" alt="" className="pixelated size-6" />
    </Link>
  )
}

function ArrowSquare({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 'prev' ? 'Scroll collections left' : 'Scroll collections right'}
      onClick={onClick}
      className="flex size-[43px] shrink-0 items-center justify-center rounded-lg bg-neutral-600 hover:bg-neutral-500"
    >
      <img src="/assets/home/arrow.png" alt="" className={`size-6 ${dir === 'next' ? 'rotate-180' : ''}`} />
    </button>
  )
}

function MiniResults({ games }: { games: MockGame[] }) {
  return (
    <div className="absolute inset-x-0 top-full z-20 rounded-b-lg bg-[#2e2e2e] px-5 pb-4 pt-2 shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
      <p className="text-[14px] text-neutral-50">
        {games.length} result{games.length === 1 ? '' : 's'} found
      </p>
      <div className="no-scrollbar mt-2 flex gap-4 overflow-x-auto">
        {games.slice(0, 8).map((g) => (
          <Link key={g.id} to={`/games/${g.id}`} className="flex w-[120px] shrink-0 flex-col items-center gap-2 text-center hover:text-secondary-400">
            <img src={g.cover} alt="" className="h-[96px] w-[66px] rounded object-cover" />
            <span className="text-[14px] font-bold">{g.title}</span>
            <span className="flex flex-wrap justify-center gap-1">
              {[g.genre, g.platform].map((t) => (
                <span key={t} className="rounded-full bg-black px-1.5 py-0.5 text-[12px] text-white">
                  {t}
                </span>
              ))}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Library() {
  const lib = useLibrary()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tabs = useRef<HTMLDivElement>(null)
  const active = lib.collections.find((c) => c.id === params.get('c'))
  const ids = active ? active.gameIds : lib.myGames
  const games = useGamesByIds(ids)
  const { filters, update, results } = useFilteredGames(games)

  const selectTab = (id?: string) => navigate(id ? `/library?c=${id}` : '/library', { replace: true })
  const scrollTabs = (d: number) => tabs.current?.scrollBy({ left: d * 200, behavior: 'smooth' })

  const tabClass = (on: boolean) =>
    `shrink-0 px-6 py-3 text-[20px] font-bold leading-8 tracking-[0.03px] max-md:px-3 max-md:text-[16px] ${
      on ? 'bg-gradient-to-t from-[#b1f2d7] from-[32%] to-white to-[130%] bg-clip-text text-transparent' : 'text-[#d1d1d1] hover:text-white'
    }`

  return (
    <div className="bg-[#262626]">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-3 px-4 pt-8 lg:px-0">
        <div className="flex items-center justify-between gap-4 py-2">
          <h1 className="text-[61px] font-bold leading-[80px] tracking-[-0.9px] max-md:text-[40px] max-md:leading-[52px]">Library</h1>
          <ContinuePlaying />
        </div>

        <div className="flex items-center gap-4 max-md:flex-col max-md:items-stretch">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <ArrowSquare dir="prev" onClick={() => scrollTabs(-1)} />
            <div ref={tabs} role="tablist" className="no-scrollbar flex min-w-0 flex-1 overflow-x-auto">
              <button role="tab" aria-selected={!active} onClick={() => selectTab()} className={tabClass(!active)}>
                My games({lib.myGames.length})
              </button>
              {lib.collections.map((c) => (
                <button key={c.id} role="tab" aria-selected={active?.id === c.id} onClick={() => selectTab(c.id)} className={tabClass(active?.id === c.id)}>
                  {c.name}({c.gameIds.length})
                </button>
              ))}
            </div>
            <ArrowSquare dir="next" onClick={() => scrollTabs(1)} />
          </div>
          <Link
            to="/library/new"
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[radial-gradient(ellipse_at_50%_100%,#fe8462,#e53201)] p-3 text-[20px] font-bold leading-5 tracking-[0.25px] shadow-[0_0_8px_black,0_0_4px_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110"
          >
            <img src="/assets/library/add.svg" alt="" width={24} height={24} />
            New Collection
          </Link>
        </div>

        <div className="relative">
          <FilterBar filters={filters} update={update} search="Search your library" />
          {filters.q.trim() && <MiniResults games={results} />}
        </div>

        {active ? (
          <div className="flex flex-col pb-6">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-items-center gap-6 py-4 sm:grid-cols-[repeat(auto-fill,238px)] sm:justify-between">
              <AddGameCard exclude={active.gameIds} onAdd={(id) => library.addToCollection(active.id, id)} />
              {results.map((g) => (
                <div key={g.id} className="group relative max-sm:w-full">
                  <TvCard game={g} className="max-sm:w-full" />
                  <button
                    type="button"
                    onClick={() => library.removeFromCollection(active.id, g.id)}
                    className="absolute right-3 top-3 hidden rounded-full bg-black/80 px-2 py-1 text-[12px] group-hover:block"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <GameGrid games={results} empty={lib.syncing ? 'Loading your library…' : 'Your library is empty. Add games from Home or Search.'} />
        )}
      </div>
    </div>
  )
}
