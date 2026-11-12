import { Link } from 'react-router-dom'
import type { Game } from '../lib/catalog'
import { systemById } from '../lib/systems'

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link
      to={`/play/${game.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-black/40 text-4xl">
        {game.cover ? <img src={game.cover} alt="" className="h-full w-full object-cover" /> : '🎮'}
      </div>
      <div className="p-3">
        <p className="font-semibold group-hover:text-accent">{game.title}</p>
        <p className="text-xs text-muted">
          {systemById(game.system)?.name}
          {game.year ? ` · ${game.year}` : ''}
        </p>
      </div>
    </Link>
  )
}
