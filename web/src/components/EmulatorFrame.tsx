// EmulatorJS relies on page globals, so each game runs in its own iframe
// (public/player.html). A new src gives a clean emulator instance.
interface Props {
  core: string
  gameUrl: string
  gameName: string
  /** Catalog id; turns on the game's achievement set (public/achievements/<id>.json) if it has one. */
  gameId?: string
  /** Fill the parent instead of drawing the default framed 4:3 box. */
  bare?: boolean
  /** The player iframe, for cloud saves (lib/cloudSaves.ts). */
  frameRef?: React.Ref<HTMLIFrameElement>
  /** Send the emulator's own Save/Load State buttons to the cloud slot. */
  cloud?: boolean
}

export default function EmulatorFrame({ core, gameUrl, gameName, gameId, bare = false, frameRef, cloud = false }: Props) {
  const params = new URLSearchParams({ core, url: gameUrl, name: gameName, ...(gameId ? { game: gameId } : {}), ...(cloud ? { cloud: '1' } : {}) }).toString()
  const frame = (
    <iframe
      key={params}
      ref={frameRef}
      src={`/player.html?${params}`}
      title={gameName}
      className={bare ? 'absolute inset-0 size-full' : 'h-full w-full'}
      allow="autoplay; fullscreen; gamepad"
      allowFullScreen
    />
  )
  if (bare) return frame
  return <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-600 bg-black">{frame}</div>
}
