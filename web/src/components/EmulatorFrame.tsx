// EmulatorJS relies on page globals, so each game runs in its own iframe
// (public/player.html). A new src gives a clean emulator instance.
interface Props {
  core: string
  gameUrl: string
  gameName: string
}

export default function EmulatorFrame({ core, gameUrl, gameName }: Props) {
  const params = new URLSearchParams({ core, url: gameUrl, name: gameName }).toString()
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black">
      <iframe
        key={params}
        src={`/player.html?${params}`}
        title={gameName}
        className="h-full w-full"
        allow="autoplay; fullscreen; gamepad"
        allowFullScreen
      />
    </div>
  )
}
