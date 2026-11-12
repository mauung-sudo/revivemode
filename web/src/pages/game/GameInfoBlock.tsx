import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { MockGame } from '../../data/games'
import { gameInfo } from '../../data/gameDetails'
import { library, useLibrary } from '../../lib/libraryStore'
import { systemForPlatform } from './platformCore'

function OutlineButton({ icon, children, onClick, href, download }: { icon: string; children: string; onClick?: () => void; href?: string; download?: string }) {
  const cls =
    'flex items-center gap-2 rounded-full border border-white px-4 py-2 font-pixel text-[20px] leading-none tracking-[1px] hover:bg-white/10'
  const body = (
    <>
      <img src={icon} alt="" className="pixelated size-5 object-contain" />
      {children}
    </>
  )
  return href ? (
    <a href={href} download={download} className={cls}>
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  )
}

export function PlayButton({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-full bg-[radial-gradient(ellipse_at_50%_100%,#fe8462,#e53201)] px-5 py-2 font-pixel text-[22px] leading-none tracking-[1.1px] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4),0_0_8px_black] hover:brightness-110"
    >
      <img src="/assets/game/play.png" alt="" className="size-3.5" />
      PLAY
    </Link>
  )
}

function Like() {
  const [vote, setVote] = useState<0 | 1 | -1>(0)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[16px] font-bold">Like this game?</p>
      <div className="flex gap-2">
        {([1, -1] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={vote === v}
            aria-label={v === 1 ? 'Like' : 'Dislike'}
            onClick={() => setVote(vote === v ? 0 : v)}
            className={`relative size-[51px] rounded-full transition ${vote === v ? 'scale-110 ring-2 ring-white' : vote ? 'opacity-50' : ''}`}
          >
            <img src={v === 1 ? '/assets/game/like.svg' : '/assets/game/dislike.svg'} alt="" width={51} height={51} />
          </button>
        ))}
      </div>
    </div>
  )
}

// Cover + meta + actions + description. Shared by the details and player screens.
export default function GameInfoBlock({ game, showPlay = true }: { game: MockGame; showPlay?: boolean }) {
  const info = gameInfo(game)
  const { myGames } = useLibrary()
  const owned = myGames.includes(game.id)
  const supported = !!systemForPlatform(game.platform)
  const meta: [string, string][] = [
    ['Genre', game.genre],
    ['Platform', game.platform],
    ['Multiplayer', game.players > 1 ? 'Yes' : 'No'],
    ['Publisher', info.publisher],
    ['Release', String(game.year)],
    ...(info.series ? ([['Series', info.series]] as [string, string][]) : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 max-md:flex-col">
        <aside className="flex w-[180px] shrink-0 flex-col gap-4 max-md:w-full max-md:flex-row max-md:flex-wrap">
          <img src={game.cover} alt={`${game.title} cover`} className="h-[251px] w-[180px] object-cover max-md:h-[180px] max-md:w-[130px]" />
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
            {meta.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-neutral-50">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <Like />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {showPlay && <PlayButton to={`/games/${game.id}/play`} />}
            <div className="ml-auto flex flex-wrap gap-3 max-md:ml-0">
              <OutlineButton icon="/assets/game/heart.png" onClick={() => (owned ? library.removeFromLibrary(game.id) : library.addToLibrary(game.id))}>
                {owned ? 'IN YOUR LIBRARY' : 'ADD TO LIBRARY'}
              </OutlineButton>
              {/* Downloads only for redistributable homebrew. Commercial titles use bring-your-own-ROM. */}
              {game.file ? (
                <OutlineButton icon="/assets/game/download.png" href={game.file} download={`${game.id}.nes`}>
                  DOWNLOAD ROM
                </OutlineButton>
              ) : supported ? (
                <Link
                  to={`/games/${game.id}/play?byor=1`}
                  className="flex items-center gap-2 rounded-full border border-white px-4 py-2 font-pixel text-[20px] leading-none tracking-[1px] hover:bg-white/10"
                >
                  <img src="/assets/game/download.png" alt="" className="pixelated size-5 rotate-180 object-contain" />
                  LOAD YOUR ROM
                </Link>
              ) : null}
            </div>
          </div>
          <h1 className="text-[48px] font-bold leading-tight max-md:text-[32px]">
            {game.title} ({game.year})
          </h1>
          {game.license && <p className="text-[14px] text-secondary-400">Free to play · {game.license}</p>}
          <h2 className="text-[25px] font-bold">Plot</h2>
          <p className="text-[18px] leading-[30px]">{info.plot}</p>
          <h2 className="text-[25px] font-bold">Gameplay</h2>
          <p className="text-[18px] leading-[30px]">{info.gameplay}</p>
        </div>
      </div>
      {info.screenshots.length > 0 && (
        <section>
          <h2 className="mb-3 text-[25px] font-bold">Screen shots</h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto">
            {info.screenshots.map((s) => (
              <img key={s} src={s} alt="" className="pixelated h-[130px] shrink-0 rounded object-cover" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
