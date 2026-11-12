import { Link } from 'react-router-dom'
import type { MockGame } from '../data/games'

// "Retro TV" game card from the design system. Two variants:
// - "large": image fills the card, title and tags overlay the bottom (Featured row)
// - "card": fixed 270px screen with title and a tag row underneath
function Screen({ src, className = '' }: { src: string; className?: string }) {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-neutral-600 p-2 shadow-[0_0_8px_rgba(21,21,21,0.25)]">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-700 p-2">
        <div className={`relative w-full overflow-hidden rounded-2xl border-4 border-black ${className}`}>
          <img src={src} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
          <div className="absolute inset-0 shadow-card-game" />
        </div>
      </div>
    </div>
  )
}

function Tag({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <span
      className={`flex items-baseline justify-center px-1 py-2 text-[16px] font-bold leading-4 tracking-[0.064px] text-secondary-100 ${
        dark ? 'rounded-lg bg-gradient-to-t from-[#1d1d1d] to-transparent' : 'flex-1 bg-neutral-800 p-2'
      }`}
    >
      {children}
    </span>
  )
}

export default function TvCard({
  game,
  variant = 'card',
  className = '',
}: {
  game: MockGame
  variant?: 'card' | 'large'
  className?: string
}) {
  if (variant === 'large') {
    return (
      <Link
        to={`/games/${game.id}`}
        className={`group flex h-[278px] flex-col items-center overflow-hidden rounded-2xl border border-neutral-400 transition hover:border-secondary-500 ${className}`}
      >
        <div className="-mb-6 flex min-h-0 w-full flex-1">
          <div className="flex w-full">
            <Screen src={game.cover} className="flex-1" />
          </div>
        </div>
        <div className="relative flex w-full items-baseline justify-between gap-2 bg-gradient-to-t from-ink to-transparent px-4">
          <p className="min-w-0 flex-1 truncate text-[20px] font-bold leading-8 tracking-[0.03px] group-hover:text-secondary-400">
            {game.title}
          </p>
          <div className="flex items-baseline gap-0.5">
            <Tag dark>{game.genre}</Tag>
            <span className="py-2 text-[16px] font-bold leading-4 text-neutral-50">|</span>
            <Tag dark>{game.platform}</Tag>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/games/${game.id}`}
      className={`group flex w-[238px] shrink-0 flex-col items-center gap-2 overflow-hidden rounded-2xl border border-neutral-400 transition hover:border-secondary-500 ${className}`}
    >
      <Screen src={game.cover} className="h-[270px]" />
      <p className="w-full truncate px-4 text-[20px] font-bold leading-8 tracking-[0.03px] group-hover:text-secondary-400">
        {game.title}
      </p>
      <div className="flex w-full items-baseline gap-0.5">
        <Tag>{game.genre}</Tag>
        <Tag>{game.platform}</Tag>
      </div>
    </Link>
  )
}
