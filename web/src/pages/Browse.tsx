import { useParams } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import GameGrid from '../components/GameGrid'
import { genreBySlug, platformBySlug } from '../data/games'
import { useGames } from '../lib/catalog'
import { useFilteredGames } from '../lib/gameFilter'
import ComingSoon from './ComingSoon'

function PlatformBanner({ name, banner }: { name: string; banner?: string }) {
  if (banner) return <img src={banner} alt={name} className="h-[104px] w-full rounded-lg object-cover object-left max-md:h-auto" />
  return (
    <div className="flex h-[104px] items-center rounded-lg border-b-[21px] border-neutral-400 bg-neutral-50 px-6">
      <h1 className="font-display text-[40px] font-bold uppercase tracking-[2px] text-black">{name}</h1>
    </div>
  )
}

function GenreBanner({ name, art, bg }: { name: string; art: string; bg: string }) {
  return (
    <div className="relative flex h-[172px] items-center justify-center overflow-hidden rounded-lg max-md:h-[120px]" style={{ background: bg }}>
      <img src={art} alt="" className="pixelated absolute left-[9%] top-[18px] h-[130px] max-md:hidden" />
      <img src={art} alt="" className="pixelated absolute right-[9%] top-[18px] h-[130px] -scale-x-100 max-md:hidden" />
      <span className="absolute inset-0 rounded-lg border-[5px] border-black bg-gradient-to-b from-[rgba(45,45,45,0.3)] to-[rgba(23,28,31,0.3)]" />
      <h1 className="relative text-[61px] font-bold uppercase leading-[80px] tracking-[-0.9px] [text-shadow:0_4px_4px_rgba(0,0,0,0.5)] max-md:text-[40px]">
        {name}
      </h1>
    </div>
  )
}

// Home → platform card (e.g. /platform/nes) and Home → genre tile (e.g. /genre/fighting).
export default function Browse({ kind }: { kind: 'platform' | 'genre' }) {
  const { slug = '' } = useParams()
  const platform = kind === 'platform' ? platformBySlug(slug) : undefined
  const genre = kind === 'genre' ? genreBySlug(slug) : undefined
  const all = useGames()
  const base = all.filter((g) => (platform ? g.platform === platform.name : genre ? g.genre === genre.name : false))
  const { filters, update, results } = useFilteredGames(base)

  if (!platform && !genre) return <ComingSoon />
  const label = platform?.name ?? genre!.name

  return (
    <div className="bg-[#2b2b2b] bg-[radial-gradient(#353535_1px,transparent_1px)] [background-size:12px_12px]">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-3 px-4 pt-8 lg:px-0">
        {platform ? <PlatformBanner name={platform.name} banner={platform.banner} /> : <GenreBanner {...genre!} />}
        <FilterBar
          filters={filters}
          update={update}
          search={`Search ${label === 'NES' ? 'NES' : label.toLowerCase()} games`}
          show={platform ? ['genre', 'year', 'players'] : ['platform', 'year', 'players']}
        />
        <GameGrid games={results} />
      </div>
    </div>
  )
}
