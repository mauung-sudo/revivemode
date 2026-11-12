import PixelFrame from '../../components/PixelFrame'

function SaveArt() {
  return <img src="/assets/home/feat-save.png" alt="" className="h-[142px] w-[155px] -rotate-[9.68deg] object-cover object-top" />
}

function CommunityArt() {
  // Two pixel speech bubbles: "Revive mode?" / "PERFECT ♥"
  return (
    <div className="relative h-[139px] w-[183px] shrink-0">
      <div className="absolute left-0 top-0 h-[75.7px] w-[121.9px] overflow-hidden">
        <img src="/assets/home/pixel-frame.png" alt="" className="absolute left-[-100%] top-[-98.17%] h-[312.2%] w-[303.03%] max-w-none" />
      </div>
      <div className="absolute left-[61px] top-[63px] h-[75.7px] w-[121.9px] rotate-180 -scale-y-100 overflow-hidden">
        <img src="/assets/home/pixel-frame.png" alt="" className="absolute left-[-100%] top-[-98.17%] h-[312.2%] w-[303.03%] max-w-none" />
      </div>
      <p className="absolute left-[25.7px] top-6 font-pixel text-[16px] text-secondary-900">Revive mode?</p>
      <p className="absolute left-[90.7px] top-[88px] flex items-center gap-1 font-pixel text-[16px] text-primary-500">
        PERFECT <img src="/assets/home/heart-small.png" alt="" className="size-2.5" />
      </p>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Play instantly',
    body: 'Load and play your favorite retro games in seconds. All you need is your browser.',
    art: <img src="/assets/home/feat-instant.png" alt="" className="pixelated size-[149px] rotate-[9.86deg]" />,
  },
  {
    title: 'Save & continue',
    body: 'You can pick up where you left off. Your progress is safely stored in the cloud or locally.',
    art: <SaveArt />,
  },
  {
    title: 'Custom Controls',
    body: 'Personalize your controller layout for every console whether it is NES, SNES, Game Boy, or more.',
    art: (
      <div className="relative h-[85.6px] w-[165.6px] rotate-[14.99deg] overflow-hidden">
        <img src="/assets/home/feat-controls.png" alt="" className="absolute left-[-7.69%] top-[-64.26%] h-[228.51%] w-[118.14%] max-w-none" />
      </div>
    ),
  },
  { title: 'Join the Community', body: 'Take part in challenges, join discussions, and share your creations with other retro gamers.', art: <CommunityArt /> },
]

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-[#002f43] py-[100px] max-md:py-12">
      <div className="absolute inset-0 overflow-hidden opacity-50 mix-blend-color-dodge">
        <img src="/assets/home/features-bg.png" alt="" className="absolute left-0 top-[-57.6%] h-[168%] w-full max-w-none object-cover" />
      </div>
      <div className="relative mx-auto grid max-w-[1149px] gap-1 px-4 md:grid-cols-2">
        {FEATURES.map((f) => (
          <PixelFrame
            key={f.title}
            className="flex min-h-[265px] items-center justify-between gap-4 px-10 py-8 max-md:flex-col max-md:text-center"
          >
            <div className="flex size-[172px] shrink-0 items-center justify-center">{f.art}</div>
            <div className="flex flex-col gap-[33px] max-md:items-center max-md:gap-4">
              <h3 className="font-display text-[32px] font-bold uppercase tracking-[1.6px]">{f.title}</h3>
              <p className="max-w-[275px] font-copy text-[16px] leading-8 tracking-[0.08px]">{f.body}</p>
            </div>
          </PixelFrame>
        ))}
      </div>
    </section>
  )
}
