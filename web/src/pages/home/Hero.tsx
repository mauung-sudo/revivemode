import { Link } from 'react-router-dom'
import PixelFrame from '../../components/PixelFrame'
import HeroGame from './HeroGame'

export default function Hero() {
  return (
    <section className="relative h-[720px] overflow-hidden bg-[#001a14] max-md:h-[560px]">
      <img src="/assets/home/hero-bg.png" alt="" className="pixelated absolute inset-0 size-full object-cover" />

      {/* Mini-game ("DRAG ME!") on the 1280px design canvas, behind the card. */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[1280px] -translate-x-1/2 max-md:hidden">
        <HeroGame height={720} />
      </div>

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
    </section>
  )
}
