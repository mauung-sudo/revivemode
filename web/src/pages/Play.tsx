import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmulatorFrame from '../components/EmulatorFrame'
import { gameById } from '../lib/catalog'
import { getLocalRom } from '../lib/localRom'
import { systemById } from '../lib/systems'

export default function Play() {
  const { id = '' } = useParams()

  if (id === 'local') {
    const rom = getLocalRom()
    if (!rom) return <NotFound message="No file loaded. Pick one on the home page." />
    return (
      <Player title={rom.name} subtitle={`${rom.system.name} · your file (not uploaded)`}>
        <EmulatorFrame core={rom.system.core} gameUrl={rom.url} gameName={rom.name} />
      </Player>
    )
  }

  const game = gameById(id)
  const system = game && systemById(game.system)
  if (!game || !system) return <NotFound message="Game not found." />

  return (
    <Player
      title={game.title}
      subtitle={[system.name, game.year, game.author, game.license].filter(Boolean).join(' · ')}
    >
      <EmulatorFrame core={system.core} gameUrl={game.file} gameName={game.title} />
      {game.description && <p className="mt-4 text-muted">{game.description}</p>}
    </Player>
  )
}

function Player({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/" className="text-sm text-muted hover:text-text">
        ← Library
      </Link>
      <h1 className="mt-2 text-xl font-bold">{title}</h1>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>
      {children}
    </div>
  )
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-muted">{message}</p>
      <Link to="/" className="mt-4 inline-block text-accent">
        Back to library
      </Link>
    </div>
  )
}
