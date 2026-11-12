import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DECADES, PLAYER_OPTIONS, SORT_LABEL, type Filters, type SortKey } from '../lib/gameFilter'
import { GENRES, PLATFORMS } from '../data/games'

type Key = 'platform' | 'genre' | 'year' | 'players'

const OPTIONS: Record<Key, { label: string; values: readonly string[] }> = {
  platform: { label: 'Platform', values: PLATFORMS.map((p) => p.name) },
  genre: { label: 'Genre', values: GENRES.map((g) => g.name) },
  year: { label: 'Year', values: DECADES },
  players: { label: '1P', values: PLAYER_OPTIONS },
}

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])
  return ref
}

function Dropdown({ k, selected, onChange }: { k: Key; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(open, () => setOpen(false))
  const { label, values } = OPTIONS[k]
  const shown = k === 'players' && selected.length === 1 ? selected[0] : label
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-3 rounded-lg border py-2 pl-3 pr-2 text-[16px] font-bold leading-4 tracking-[0.064px] ${
          selected.length ? 'border-secondary-500 text-secondary-400' : 'border-[#989898]'
        }`}
      >
        {shown}
        {selected.length > 0 && k !== 'players' && <span className="font-pixel text-[16px]">({selected.length})</span>}
        <img src="/assets/ui/caret-down.svg" alt="" width={24} height={24} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-[200px] rounded-lg bg-neutral-700 p-2 shadow-glow">
          {values.map((v) => {
            const on = selected.includes(v)
            return (
              <label key={v} className="flex cursor-pointer items-center gap-3 rounded px-3 py-2.5 text-[16px] hover:bg-neutral-600">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onChange(on ? selected.filter((s) => s !== v) : [...selected, v])}
                  className="size-4 accent-secondary-500"
                />
                {v}
              </label>
            )
          })}
          {selected.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="mt-1 w-full rounded px-3 py-2 text-left font-pixel text-[18px] text-secondary-400 hover:bg-neutral-600">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function SortButton({ sort, onChange }: { sort: SortKey; onChange: (s: SortKey) => void }) {
  const order: SortKey[] = ['newest', 'oldest', 'az']
  return (
    <div className="flex items-center gap-2">
      <span className="text-[16px] font-bold leading-4">Sort by</span>
      <button
        type="button"
        onClick={() => onChange(order[(order.indexOf(sort) + 1) % order.length])}
        className="flex items-center gap-2 rounded bg-neutral-50 px-3 py-2 font-pixel text-[18px] leading-[18px] tracking-[0.9px] text-[#1d1d1d] shadow-[0_0_8px_black,0_0_4px_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_2px_0_rgba(255,255,255,0.4)]"
      >
        {SORT_LABEL[sort]}
        <img src="/assets/ui/chevron-up-down.png" alt="" className="size-4 -rotate-90 object-cover" />
      </button>
    </div>
  )
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex min-w-0 max-w-[300px] flex-1 items-center gap-2.5 rounded-lg border border-[#989898] px-3 py-2">
      <img src="/assets/ui/search.png" alt="" className="size-5 grayscale" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[16px] placeholder:text-white focus:outline-none"
      />
    </label>
  )
}

// The dark toolbar used on Search, Platform, Genre and Library screens.
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-wrap items-center gap-4 rounded-lg bg-[radial-gradient(ellipse_at_50%_0%,#383838,#2e2e2e)] px-6 py-3 shadow-[0_0_8px_black,0_0_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] max-md:px-3">
      {children}
    </div>
  )
}

export default function FilterBar({
  filters,
  update,
  show = ['platform', 'genre', 'year', 'players'],
  search,
  sortFirst = false,
}: {
  filters: Filters
  update: (p: Partial<Filters>) => void
  show?: Key[]
  search?: string
  sortFirst?: boolean
}) {
  const sort = <SortButton sort={filters.sort} onChange={(sort) => update({ sort })} />
  const drops = (
    <div className="flex flex-wrap items-center gap-2">
      {sortFirst && <span className="text-[16px] font-bold leading-4">Filter by</span>}
      {show.map((k) => (
        <Dropdown key={k} k={k} selected={filters[k]} onChange={(v) => update({ [k]: v })} />
      ))}
    </div>
  )
  return (
    <Toolbar>
      {sortFirst ? (
        <>
          {sort}
          <span className="h-8 w-px bg-neutral-400 max-md:hidden" aria-hidden />
          {drops}
        </>
      ) : (
        <>
          {search && <SearchField value={filters.q} onChange={(q) => update({ q })} placeholder={search} />}
          <div className="ml-auto flex flex-wrap items-center gap-4">
            {drops}
            <span className="h-8 w-px bg-neutral-400 max-md:hidden" aria-hidden />
            {sort}
          </div>
        </>
      )}
    </Toolbar>
  )
}
