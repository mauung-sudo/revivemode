import { Link } from 'react-router-dom'
import SectionTitle, { SeeAll } from '../../components/SectionTitle'
import TvCard from '../../components/TvCard'
import { COMMUNITY_PICKS, GENRES, MOSTLY_PLAYED, NEWLY_ADDED } from '../../data/games'
import { useFeatured, useGamesByIds } from '../../lib/catalog'

// 32px pixel-brick strip that separates the rows in the design.
export function BrickDivider() {
  return (
    <div
      aria-hidden
      className="pixelated h-8 w-full"
      style={{ backgroundImage: 'url(/assets/home/brick-band.png)', backgroundSize: '216px auto', backgroundPosition: 'left top', backgroundRepeat: 'repeat-x' }}
    />
  )
}

function Row({ ids }: { ids: readonly string[] }) {
  const games = useGamesByIds(ids)
  return (
    <div className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-2 lg:justify-center">
      {games.map((g) => (
        <TvCard key={g.id} game={g} />
      ))}
    </div>
  )
}

export default function GameRows() {
  const featured = useFeatured()
  return (
    <section className="bg-neutral-800">
      <BrickDivider />
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <div className="pb-16 pt-8">
          <SectionTitle icon="/assets/home/section-star.png">Featured</SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-[13px] overflow-x-auto px-4">
            {featured.map((g, i) => (
              <TvCard key={g.id} game={g} variant="large" className={`shrink-0 ${i === 1 ? 'w-[467px]' : 'w-[428px]'} max-md:w-[300px]`} />
            ))}
          </div>
        </div>
      </div>
      <BrickDivider />
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <div className="pb-16">
          <SectionTitle action={<SeeAll to="/library?sort=new" />}>Newly added</SectionTitle>
          <Row ids={NEWLY_ADDED} />
        </div>
      </div>
      <BrickDivider />
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <div className="pb-16 pt-8">
          <SectionTitle icon="/assets/home/ic-trending.png" action={<SeeAll to="/library?sort=popular" />}>
            Mostly played
          </SectionTitle>
          <Row ids={MOSTLY_PLAYED} />
        </div>
      </div>
      <BrickDivider />
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <div className="pb-16 pt-8">
          <SectionTitle icon="/assets/home/ic-trophy.png">Community picks</SectionTitle>
          <Row ids={COMMUNITY_PICKS} />
        </div>
      </div>
      <BrickDivider />
      <div className="mx-auto max-w-[1180px] px-4">
        <div className="flex flex-col items-center pb-16 pt-8">
          <SectionTitle>Explore different genres</SectionTitle>
          <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
            {GENRES.map((g) => (
              <Link
                key={g.name}
                to={`/genre/${g.name.toLowerCase()}`}
                className="group relative flex h-[172px] items-end justify-center overflow-hidden rounded-lg max-md:h-[120px]"
                style={{ background: g.bg }}
              >
                {g.crop ? (
                  <span className={`relative overflow-hidden ${g.crop.box}`}>
                    <img src={g.art} alt="" className="pixelated absolute max-w-none" style={{ width: g.crop.w, height: g.crop.h, left: g.crop.left, top: g.crop.top }} />
                  </span>
                ) : (
                  <img src={g.art} alt="" className={`pixelated max-w-full object-contain ${g.artClass}`} />
                )}
                <span className="absolute inset-0 rounded-lg border-[5px] border-black bg-gradient-to-b from-[rgba(45,45,45,0.3)] to-[rgba(23,28,31,0.3)] transition group-hover:from-transparent group-hover:to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center font-display text-[24px] font-bold uppercase tracking-[1.2px] [text-shadow:0_4px_4px_rgba(0,0,0,0.5)]">
                  {g.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BrickDivider />
    </section>
  )
}
