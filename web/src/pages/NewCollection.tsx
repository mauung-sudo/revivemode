import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddGameCard from '../components/AddGameCard'
import TvCard from '../components/TvCard'
import { useGamesByIds } from '../lib/catalog'
import { library } from '../lib/libraryStore'

export function BackButton({ onClick, label = 'BACK' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 font-pixel text-[24px] leading-none tracking-[1.2px] hover:text-secondary-400">
      <img src="/assets/home/arrow.png" alt="" className="size-5" />
      {label}
    </button>
  )
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-[radial-gradient(ellipse_at_50%_100%,#fe8462,#e53201)] px-5 py-2 text-[16px] font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4),0_0_8px_black] hover:brightness-110 disabled:opacity-50 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export default function NewCollection() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [ids, setIds] = useState<string[]>([])
  const games = useGamesByIds(ids)

  const create = () => {
    const id = library.createCollection(name, ids)
    navigate(`/library?c=${id}`)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262626]">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) create()
        }}
        className="mx-auto flex max-w-[1024px] flex-col gap-6 px-4 py-10 lg:px-0"
      >
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <h1 className="flex-1 text-[20px] font-bold">Create a new collection</h1>
          <PrimaryButton type="submit" disabled={!name.trim()}>
            Create
          </PrimaryButton>
        </div>
        <label className="sr-only" htmlFor="collection-name">
          Collection name
        </label>
        <input
          id="collection-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          maxLength={40}
          className="bg-transparent text-[32px] font-bold text-neutral-50 placeholder:text-neutral-500 focus:outline-none"
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-items-center gap-6 sm:grid-cols-[repeat(auto-fill,238px)] sm:justify-start">
          <AddGameCard exclude={ids} onAdd={(id) => setIds((s) => [...s, id])} />
          {games.map((g) => (
            <div key={g.id} className="group relative max-sm:w-full">
              <TvCard game={g} className="max-sm:w-full" />
              <button
                type="button"
                onClick={() => setIds((s) => s.filter((x) => x !== g.id))}
                className="absolute right-3 top-3 hidden rounded-full bg-black/80 px-2 py-1 text-[12px] group-hover:block"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}
