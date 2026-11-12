import { Link } from 'react-router-dom'

// Cartridge sprite crops from the design (second layer of each slot).
const CARTS = [
  { left: 39, w: 60, pos: ['-3.75%', '-2.2%'] },
  { left: 107.4, w: 59.7, pos: ['-111.09%', '-2.7%'] },
  { left: 175.8, w: 60, pos: ['-3.09%', '-107.08%'] },
  { left: 244.2, w: 60, pos: ['-108.32%', '-106.15%'] },
]

function Cartridges({ dock }: { dock: string }) {
  return (
    <>
      <div className="absolute left-5 top-[163px] h-[113px] w-[303px] rounded-2xl" style={{ background: dock }} />
      {CARTS.map((c) => (
        <div key={c.left} className="absolute top-[180px] h-[78px] overflow-hidden" style={{ left: c.left, width: c.w }}>
          <img
            src="/assets/home/cartridges.png"
            alt=""
            className="absolute h-[210.17%] w-[213.75%] max-w-none"
            style={{ left: c.pos[0], top: c.pos[1] }}
          />
        </div>
      ))}
    </>
  )
}

function PressStart() {
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2.5 bg-[#14191f] px-6 py-3 drop-shadow-[4px_38px_31px_rgba(0,0,0,0.5)]">
      <img src="/assets/home/play.svg" alt="" width={24} height={24} />
      <span className="font-pixel text-[24px] uppercase tracking-[1.2px] group-hover:text-secondary-400">Press start</span>
    </div>
  )
}

function Dots({ left, top, size = 3.667 }: { left: number; top: number; size?: number }) {
  return (
    <span aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="absolute bg-black" style={{ left: left + i * size, top: top + i * size, width: size, height: size }} />
      ))}
    </span>
  )
}

function ConsoleCard({ to, children, label }: { to: string; children: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      aria-label={`Browse ${label} games`}
      className="group relative block h-[336px] w-[343px] shrink-0 overflow-hidden rounded transition hover:-translate-y-1"
    >
      {children}
      <PressStart />
    </Link>
  )
}

export default function BrowseLibrary() {
  return (
    <section className="relative overflow-hidden pb-16 pt-1.5">
      <div className="absolute inset-0 flex flex-col">
        {Array.from({ length: 9 }).map((_, i) => (
          <img
            key={i}
            src="/assets/home/browse-band.png"
            alt=""
            className={`w-full shrink-0 object-cover object-bottom ${i % 2 ? '-scale-y-100' : ''}`}
            style={{ aspectRatio: '1290/74' }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[463px] bg-gradient-to-t from-[#046b72] from-[-3%] to-[rgba(0,50,94,0)] to-[69%]" />

      <div className="relative flex flex-col items-center px-4 text-center">
        <h2 className="font-display text-[48px] font-bold uppercase tracking-[2.4px] max-md:text-[32px]">Browse our library</h2>
        <p className="mt-4 font-copy text-[20px] leading-8">Play your favorite retro games right in your browser.</p>
      </div>

      <div className="relative mt-[90px] flex flex-wrap justify-center gap-[57px] px-4 max-md:mt-10 max-md:gap-6">
        <ConsoleCard to="/platform/nes" label="NES">
          <div className="absolute left-5 top-4 h-[304px] w-[303px] rounded border-[10px] border-neutral-800 bg-[#e9fbf8]" />
          <img src="/assets/home/nes-ell-a.svg" alt="" className="absolute left-1/2 top-[97px] h-[270px] w-[395px] max-w-none -translate-x-1/2" />
          <img src="/assets/home/nes-ell-b.svg" alt="" className="absolute left-1/2 top-[101px] h-[270px] w-[395px] max-w-none -translate-x-1/2" />
          <img src="/assets/home/nes-ell-c.svg" alt="" className="absolute left-1/2 top-[102px] h-[270px] w-[395px] max-w-none -translate-x-1/2" />
          <p className="absolute inset-x-0 top-[39px] text-center font-display text-[24px] font-bold uppercase tracking-[1.2px] text-black">Nintendo NES</p>
          <div className="absolute left-[calc(50%+1.5px)] top-[87px] h-[66px] w-40 -translate-x-1/2 overflow-hidden rounded shadow-[0_0_16px_rgba(0,0,0,0.25)]">
            <img src="/assets/home/nes-logo.png" alt="" className="absolute left-[-29.16%] top-[-75.92%] h-[215.45%] w-[158.56%] max-w-none" />
          </div>
          <Cartridges dock="linear-gradient(to top, #27333f, #1d252f 119%)" />
          <Dots left={290} top={24} />
          <Dots left={301} top={24} />
        </ConsoleCard>

        <ConsoleCard to="/platform/psx" label="PlayStation">
          <div className="absolute left-[19.5px] top-2.5 h-[310px] w-[303px] rounded border-[5px] border-[#dbdbdb] bg-[#d2d2d2]" />
          <div className="absolute left-[calc(50%+104.5px)] top-[5px] h-[315px] w-[113px] -translate-x-1/2 rounded border-l border-[#b9b9b9] bg-[#dbdbdb]" />
          <div className="absolute left-[calc(50%-105.5px)] top-[5px] h-[315px] w-[113px] -translate-x-1/2 rounded border-r border-[#b9b9b9] bg-[#dbdbdb]" />
          <img src="/assets/home/psx-disc.svg" alt="" className="absolute left-[calc(50%+0.5px)] top-[88px] size-[237px] max-w-none -translate-x-1/2" />
          <img src="/assets/home/psx-logo.png" alt="" className="absolute left-[calc(50%+0.5px)] top-[79px] h-[75px] w-[119px] -translate-x-1/2 object-cover" />
          <p className="absolute inset-x-0 top-[39px] text-center font-display text-[24px] font-bold uppercase tracking-[1.2px] text-black">PSX</p>
          <Cartridges dock="linear-gradient(176deg, #dbdbdb 7%, #bcbcbc 96%)" />
          <div className="absolute left-5 top-[163px] h-[113px] w-[303px] rounded border border-[#b9b9b9]" />
          <Dots left={199.5} top={23} size={1.917} />
          <Dots left={205.25} top={23} size={1.917} />
        </ConsoleCard>

        <ConsoleCard to="/platform/genesis" label="Sega Genesis">
          <div className="absolute left-5 top-4 h-[304px] w-[303px] rounded-[48px] border-[10px] border-neutral-800 bg-white" />
          <img src="/assets/home/gen-ell-a.svg" alt="" className="absolute left-1/2 top-[97px] h-[270px] w-[395px] max-w-none -translate-x-1/2" />
          <img src="/assets/home/gen-ell-b.svg" alt="" className="absolute left-1/2 top-[97px] h-[270px] w-[395px] max-w-none -translate-x-1/2" />
          <img src="/assets/home/genesis-logo.png" alt="" className="absolute left-[calc(50%+0.5px)] top-20 h-[66px] w-[125px] -translate-x-1/2 object-cover" />
          <p className="absolute inset-x-0 top-9 text-center font-display text-[24px] font-bold uppercase tracking-[1.2px] text-black">Sega Genesis</p>
          <Cartridges dock="linear-gradient(#4a4b4b, #333)" />
          <Dots left={271} top={28} />
          <Dots left={281} top={28} />
        </ConsoleCard>
      </div>
    </section>
  )
}
