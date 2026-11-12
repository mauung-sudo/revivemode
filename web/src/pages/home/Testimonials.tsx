import { useRef } from 'react'

const QUOTES = [
  { who: 'Alex', text: '“I’ve tried a lot of retro emulator sites, and most of them feel clunky or sketchy. Revive Mode was the first one where I could just click a game and start playing instantly.”', ship: '-110.13% 0.7%' },
  { who: 'Jamie', text: '“What really surprised me was how smooth everything felt in the browser. I connected my controller, loaded up a classic, and it honestly felt like playing on my old console.”', ship: '0% 0%' },
  { who: 'Mina, Casual Gamer', text: '“I only planned to play for a few minutes, but the save feature made it so easy to come back that I kept returning all week. Being able to continue on another device is a huge win.”', ship: '-228.45% -105.34%' },
  { who: 'Chris', text: '“The design hits the perfect balance between retro and modern. It feels nostalgic without looking outdated, and everything is super easy to find. You can tell this was made by people who actually love games.”', ship: '-229.19% -2.79%' },
  { who: 'Sam', text: '“The community features are what sold me. I love checking out what other people are playing, joining challenges, and seeing fan creations. It makes retro gaming feel alive again instead of lonely.”', ship: '-346.25% 0.94%' },
]

function Rating() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3].map((i) => (
        <img key={i} src="/assets/home/star-full.png" alt="" className="size-2 object-contain" />
      ))}
      <img src="/assets/home/star-empty.png" alt="" className="size-2 object-contain opacity-50 mix-blend-luminosity" />
      <span className="sr-only">4 out of 5</span>
    </div>
  )
}

function ArrowButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous' : 'Next'}
      className="relative flex size-[47px] items-center justify-center rounded-full bg-[#0e3550] shadow-[0_6px_0_#062033] transition hover:brightness-125 active:translate-y-1 active:shadow-none"
    >
      <img src="/assets/home/arrow.png" alt="" className={`size-6 ${dir === 'next' ? 'rotate-180' : ''}`} />
    </button>
  )
}

export default function Testimonials() {
  const row = useRef<HTMLDivElement>(null)
  const scroll = (d: number) => row.current?.scrollBy({ left: d * 336, behavior: 'smooth' })

  return (
    <section className="relative overflow-hidden bg-[#1a4f6e] pb-20 pt-[140px] max-md:pt-16">
      <img src="/assets/home/testimonials-bg.png" alt="" className="pixelated absolute inset-x-0 -top-2.5 h-[724px] w-full object-cover object-bottom" />
      <div className="absolute inset-x-0 -top-2.5 h-[84px] bg-gradient-to-b from-[#001f3b] to-[#00325e]" />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <h2 className="font-display text-[48px] font-bold uppercase tracking-[2.4px] max-md:text-[32px]">Loved by gamers</h2>
        <p className="font-copy text-[20px] leading-8">Here’s what people are saying about us</p>
        <div className="mt-6 flex gap-2.5">
          <ArrowButton dir="prev" onClick={() => scroll(-1)} />
          <ArrowButton dir="next" onClick={() => scroll(1)} />
        </div>
      </div>
      <div ref={row} className="no-scrollbar relative mt-10 flex snap-x gap-4 overflow-x-auto px-10 pb-4 max-md:px-4">
        {QUOTES.map((q) => (
          <figure key={q.who} className="relative w-[318px] shrink-0 snap-start pb-[60px]">
            <div className="ml-[38px] flex w-[280px] flex-col gap-2.5 rounded-[1px] border border-[#1071cc] bg-white p-4 text-black">
              <blockquote className="font-pixel text-[12px] tracking-[0.06px]">{q.text}</blockquote>
              <figcaption className="font-pixel text-[12px]">{q.who}</figcaption>
              <Rating />
            </div>
            {/* thought bubble dots + little ship */}
            <span className="absolute bottom-[38px] left-[32px] size-[11px] rounded-[1px] border border-[#1071cc] bg-white" />
            <span className="absolute bottom-[26px] left-[26px] size-2 rounded-[1px] border border-[#1071cc] bg-white" />
            <span className="absolute bottom-0 left-0 h-8 w-[30px] overflow-hidden">
              <img
                src="/assets/home/ships-sprite.png"
                alt=""
                className="pixelated absolute h-[853.33%] w-[1353.52%] max-w-none"
                style={{ left: q.ship.split(' ')[0], top: q.ship.split(' ')[1] }}
              />
            </span>
          </figure>
        ))}
      </div>
    </section>
  )
}
