import GameCard from '../components/GameCard'
import RomPicker from '../components/RomPicker'
import { CATALOG } from '../lib/catalog'

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Play retro games in your browser</h1>
        <p className="mt-1 text-muted">Homebrew and public-domain classics, or bring your own.</p>
      </section>
      <RomPicker />
      <section>
        <h2 className="mb-3 text-lg font-semibold">Library</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATALOG.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    </div>
  )
}
