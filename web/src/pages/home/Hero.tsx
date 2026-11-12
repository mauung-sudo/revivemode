import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PixelFrame from '../../components/PixelFrame'

// Asteroid positions from the design (desktop, 1280×720 canvas, in %).
const ASTEROIDS = [
  { left: 82.8, top: 39.4 },
  { left: 18.4, top: 46.7 },
  { left: 31.4, top: 64.6 },
  { left: 10.7, top: 18.3 },
  { left: 62.8, top: 18.3 },
]

export default function Hero() {
  const area = useRef<HTMLDivElement>(null)
  const [ship, setShip] = useState<{ x: number; y: number } | null>(null)
  const [score, setScore] = useState(9676)
  const [dragged, setDragged] = useState(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = { x: e.clientX, y: e.clientY }
    setDragged(true)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!last.current || !area.current) return
    const r = area.current.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - r.left, 30), r.width - 30)
    const y = Math.min(Math.max(e.clientY - r.top, 60), r.height - 40)
    const d = Math.hypot(e.clientX - last.current.x, e.clientY - last.current.y)
    last.current = { x: e.clientX, y: e.clientY }
    setShip({ x, y })
    setScore((s) => s + Math.round(d / 4))
  }
  function onPointerUp() {
    last.current = null
  }

  return (
    <section className="relative h-[720px] overflow-hidden bg-[#001a14] max-md:h-[560px]">
      <img src="/assets/home/hero-bg.png" alt="" className="pixelated absolute inset-0 size-full object-cover" />
      {ASTEROIDS.map((a, i) => (
        <img
          key={i}
          src="/assets/home/asteroid.png"
          alt=""
          className="absolute h-[49px] w-16 object-cover max-md:h-[30px] max-md:w-10"
          style={{ left: `${a.left}%`, top: `${a.top}%` }}
        />
      ))}

      <PixelFrame className="absolute left-1/2 top-[93px] flex w-[622px] max-w-[calc(100%-32px)] -translate-x-1/2 flex-col items-center gap-[33px] px-16 py-12 text-center max-md:top-6 max-md:gap-6 max-md:px-6 max-md:py-8">
        <h1 className="font-display text-[48px] font-bold uppercase leading-none tracking-[2.4px] max-md:text-[28px]">
          The game isn’t over
          <span className="text-revive mt-3 block">Press Revive</span>
        </h1>
        <p className="max-w-[494px] font-copy text-[20px] leading-8 tracking-[0.1px] max-md:text-[16px]">
          Revive mode is a cloud platform to play your favorite retro games right in your browser. no downloads, no setup.
        </p>
        <Link
          to="/library"
          className="flex h-[85px] items-center justify-center bg-secondary-500 px-6 py-4 font-pixel text-[64px] leading-[18px] tracking-[3.2px] text-black shadow-press transition hover:bg-secondary-400 active:translate-y-1 active:shadow-none max-md:h-[50px] max-md:w-full max-md:text-[28px]"
        >
          START PLAYING
        </Link>
        <p className="font-copy text-[13px] leading-8">No signup required to start playing.</p>
      </PixelFrame>

      {/* Draggable mini-game ship from the design ("DRAG ME!"), on the 1280px design canvas. */}
      <div ref={area} className="pointer-events-none absolute inset-y-0 left-1/2 w-[1280px] -translate-x-1/2 max-md:hidden">
      <div
        role="img"
        aria-label="Spaceship you can drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="pointer-events-auto absolute z-10 cursor-grab touch-none select-none active:cursor-grabbing"
        style={ship ? { left: ship.x - 31, top: ship.y - 40 } : { left: 1008, top: 489 }}
      >
        <img src="/assets/home/ship.png" alt="" draggable={false} className="h-[183px] w-[63px] object-cover" />
      </div>
      {!dragged && (
        <>
          <img src="/assets/home/explosion.png" alt="" className="pixelated absolute left-[989px] top-[387px] size-[126px] max-md:hidden" />
          <div className="absolute left-[1071px] top-[561px] flex h-[43px] w-[140px] items-center justify-center max-md:hidden">
            <img src="/assets/home/bubble.png" alt="" className="absolute inset-0 size-full object-cover" />
            <span className="relative font-pixel text-[18px] tracking-[0.9px] text-black">DRAG ME!</span>
          </div>
        </>
      )}
      <p className="absolute left-[975px] top-[672px] flex gap-2.5 px-5 py-2.5 font-pixel text-[18px] tracking-[0.9px] max-md:hidden">
        SCORE <span className="text-secondary-400">{score}</span>
      </p>
      </div>
    </section>
  )
}
