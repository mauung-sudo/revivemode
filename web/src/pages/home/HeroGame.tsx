import { useEffect, useRef, useState } from 'react'

// Hero mini-game on the 1280px design canvas: drag the ship to fly it. While
// you hold it, it fires and the asteroids drift; let go and time stops. A
// bullet that hits an asteroid blows it up for +100. The score rides under the
// ship. Drawn on a canvas so the page doesn't re-render every frame.

const W = 1280
// Sprites cut from /assets/home/ship.png (220×640 source, drawn at 0.2864×).
const K = 63 / 220
const SHIP_SRC = { x: 7, y: 308, w: 199, h: 322 }
const BULLET_SRC = { x: 125, y: 0, w: 35, h: 108 }
const SHIP = { w: SHIP_SRC.w * K, h: SHIP_SRC.h * K } // ≈57×92
const BULLET = { w: BULLET_SRC.w * K, h: BULLET_SRC.h * K } // ≈10×31
const ROCK = { w: 64, h: 49, r: 26 }
const BOOM = 126
const BOOM_MS = 450
const FIRE_MS = 170
const BULLET_SPEED = 720 // px/s
const POINTS = 100

// Asteroid starting spots from the design (% of the 1280×720 canvas).
const START = [
  { left: 82.8, top: 39.4 },
  { left: 18.4, top: 46.7 },
  { left: 31.4, top: 64.6 },
  { left: 10.7, top: 18.3 },
  { left: 62.8, top: 18.3 },
]

interface Rock {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  hiddenFor: number // ms until it reappears after exploding
}
interface Boom {
  x: number
  y: number
  age: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const newDrift = () => ({ vx: rand(-25, 25), vy: rand(45, 95), spin: rand(-1.2, 1.2) })

function loadImage(src: string) {
  const img = new Image()
  img.src = src
  return img
}

export default function HeroGame({ height }: { height: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  // All game state lives in a ref; React only renders the static layers.
  const game = useRef({
    ship: { x: 1038, y: 623 }, // centre of the ship body, as placed in the design
    score: 0,
    dragging: false,
    grab: { dx: 0, dy: 0 },
    sinceShot: FIRE_MS,
    // The two shots already in flight in the design's resting scene.
    bullets: [
      { x: 1008 + 142 * K, y: 489 + 53.5 * K },
      { x: 1008 + 104.5 * K, y: 489 + 221.5 * K },
    ] as { x: number; y: number }[],
    rocks: START.map<Rock>((s) => ({ x: (s.left / 100) * W + ROCK.w / 2, y: (s.top / 100) * 720 + ROCK.h / 2, rot: 0, hiddenFor: 0, ...newDrift() })),
    booms: [] as Boom[],
    raf: 0,
    last: 0,
    h: height,
  })
  const sprites = useRef<{ ship: HTMLImageElement; rock: HTMLImageElement; boom: HTMLImageElement } | null>(null)
  useEffect(() => {
    game.current.h = height
    draw()
    // draw only depends on refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height])

  useEffect(() => {
    const s = { ship: loadImage('/assets/home/ship.png'), rock: loadImage('/assets/home/asteroid.png'), boom: loadImage('/assets/home/explosion.png') }
    sprites.current = s
    Promise.all(Object.values(s).map((i) => i.decode().catch(() => {}))).then(() => document.fonts?.ready.then(draw) ?? draw())
    const g = game.current
    return () => cancelAnimationFrame(g.raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placeHandle() {
    const el = handle.current
    if (!el) return
    const { x, y } = game.current.ship
    el.style.transform = `translate(${x - SHIP.w / 2 - 8}px, ${y - SHIP.h / 2 - 8}px)`
  }

  function draw() {
    const c = canvas.current
    const s = sprites.current
    if (!c || !s) return
    const g = game.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (c.width !== W * dpr || c.height !== g.h * dpr) {
      c.width = W * dpr
      c.height = g.h * dpr
    }
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, W, g.h)

    for (const r of g.rocks) {
      if (r.hiddenFor > 0) continue
      ctx.save()
      ctx.translate(r.x, r.y)
      ctx.rotate(r.rot)
      ctx.drawImage(s.rock, -ROCK.w / 2, -ROCK.h / 2, ROCK.w, ROCK.h)
      ctx.restore()
    }
    for (const b of g.bullets) ctx.drawImage(s.ship, BULLET_SRC.x, BULLET_SRC.y, BULLET_SRC.w, BULLET_SRC.h, b.x - BULLET.w / 2, b.y - BULLET.h / 2, BULLET.w, BULLET.h)
    for (const e of g.booms) {
      const t = e.age / BOOM_MS
      const size = BOOM * (0.55 + 0.6 * t)
      ctx.globalAlpha = Math.max(0, 1 - t * t)
      ctx.drawImage(s.boom, e.x - size / 2, e.y - size / 2, size, size)
      ctx.globalAlpha = 1
    }
    const { x, y } = g.ship
    ctx.drawImage(s.ship, SHIP_SRC.x, SHIP_SRC.y, SHIP_SRC.w, SHIP_SRC.h, x - SHIP.w / 2, y - SHIP.h / 2, SHIP.w, SHIP.h)

    // Score rides under the ship.
    ctx.font = '18px VT323, ui-monospace, monospace'
    ctx.textBaseline = 'middle'
    const label = 'SCORE '
    const num = String(g.score)
    const total = ctx.measureText(label + num).width
    const tx = x - total / 2
    const ty = y + SHIP.h / 2 + 22
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, tx, ty)
    ctx.fillStyle = '#97edc9'
    ctx.fillText(num, tx + ctx.measureText(label).width, ty)
    placeHandle()
  }

  function step(now: number) {
    const g = game.current
    const dt = Math.min(50, now - (g.last || now))
    g.last = now
    const sec = dt / 1000

    if (g.dragging) {
      // Fire from the nose.
      g.sinceShot += dt
      while (g.sinceShot >= FIRE_MS) {
        g.sinceShot -= FIRE_MS
        g.bullets.push({ x: g.ship.x + 1, y: g.ship.y - SHIP.h / 2 - BULLET.h / 2 + 6 })
      }
      for (const b of g.bullets) b.y -= BULLET_SPEED * sec
      g.bullets = g.bullets.filter((b) => b.y > -BULLET.h)

      for (const r of g.rocks) {
        if (r.hiddenFor > 0) {
          r.hiddenFor -= dt
          if (r.hiddenFor <= 0) Object.assign(r, { x: rand(ROCK.w, W - ROCK.w), y: -ROCK.h, rot: 0, ...newDrift() })
          continue
        }
        r.x += r.vx * sec
        r.y += r.vy * sec
        r.rot += r.spin * sec
        if (r.x < -ROCK.w) r.x = W + ROCK.w / 2
        if (r.x > W + ROCK.w) r.x = -ROCK.w / 2
        if (r.y > g.h + ROCK.h) Object.assign(r, { x: rand(ROCK.w, W - ROCK.w), y: -ROCK.h, ...newDrift() })
      }

      // Hits.
      for (const r of g.rocks) {
        if (r.hiddenFor > 0) continue
        const hit = g.bullets.findIndex((b) => Math.abs(b.x - r.x) < ROCK.r + BULLET.w / 2 && Math.abs(b.y - r.y) < ROCK.r + BULLET.h / 2 - 6)
        if (hit < 0) continue
        g.bullets.splice(hit, 1)
        g.booms.push({ x: r.x, y: r.y, age: 0 })
        r.hiddenFor = rand(700, 1500)
        g.score += POINTS
      }
    }

    // Explosions finish even after you let go.
    for (const e of g.booms) e.age += dt
    g.booms = g.booms.filter((e) => e.age < BOOM_MS)

    draw()
    if (g.dragging || g.booms.length) g.raf = requestAnimationFrame(step)
    else g.raf = 0
  }

  function run() {
    const g = game.current
    if (g.raf) return
    g.last = 0
    g.raf = requestAnimationFrame(step)
  }

  function toCanvas(e: React.PointerEvent) {
    const r = canvas.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * game.current.h }
  }

  return (
    <>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" style={{ width: W, height }} />
      <div
        ref={handle}
        role="img"
        aria-label={`Spaceship mini-game: drag to fly and shoot asteroids. Score ${game.current.score}`}
        className="pointer-events-auto absolute left-0 top-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ width: SHIP.w + 16, height: SHIP.h + 16 }}
        onPointerDown={(e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            /* pointer already gone */
          }
          const p = toCanvas(e)
          const g = game.current
          g.grab = { dx: g.ship.x - p.x, dy: g.ship.y - p.y }
          g.dragging = true
          g.sinceShot = FIRE_MS // first shot straight away
          setStarted(true)
          run()
        }}
        onPointerMove={(e) => {
          const g = game.current
          if (!g.dragging) return
          const p = toCanvas(e)
          g.ship.x = Math.min(Math.max(p.x + g.grab.dx, SHIP.w / 2), W - SHIP.w / 2)
          g.ship.y = Math.min(Math.max(p.y + g.grab.dy, SHIP.h / 2 + 40), g.h - SHIP.h / 2 - 34)
        }}
        onPointerUp={() => {
          game.current.dragging = false
        }}
        onPointerCancel={() => {
          game.current.dragging = false
        }}
      />
      {!started && (
        <>
          {/* Resting scene from the design: two shots on their way and a hit. */}
          <img src="/assets/home/explosion.png" alt="" className="pixelated absolute left-[989px] top-[387px] size-[126px]" />
          <div className="absolute left-[1071px] top-[561px] flex h-[43px] w-[140px] items-center justify-center">
            <img src="/assets/home/bubble.png" alt="" className="absolute inset-0 size-full object-cover" />
            <span className="relative font-pixel text-[18px] tracking-[0.9px] text-black">DRAG ME!</span>
          </div>
        </>
      )}
    </>
  )
}
