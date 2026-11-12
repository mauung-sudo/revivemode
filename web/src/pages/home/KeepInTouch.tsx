import { useState } from 'react'

// Newsletter signup. Frontend only for now: the submit handler is the hook
// for the backend (docs/BACKEND.md → newsletter_subscribers).
export default function KeepInTouch() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="relative h-[445px] overflow-hidden bg-gradient-to-b from-[#145055] to-neutral-800">
      <div
        className="absolute inset-x-0 top-0 h-[574px] mix-blend-multiply"
        style={{ backgroundImage: 'url(/assets/home/cta-tile.png)', backgroundSize: '391px 287px' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[163px] bg-gradient-to-b from-[rgba(57,57,57,0)] to-neutral-800" />
      <div className="absolute inset-x-0 -top-[11px] h-[163px] bg-gradient-to-t from-[rgba(8,42,43,0)] to-[#082a2b]" />

      <div className="absolute left-1/2 top-9 w-[369px] max-w-[calc(100%-32px)] -translate-x-1/2">
        <div className="relative mx-auto h-[167px] w-[214px]">
          <img src="/assets/home/cta-heart.png" alt="" className="absolute left-0 top-[92.6px] h-[74.8px] w-[71.9px] object-cover object-bottom" />
          <img src="/assets/home/cta-bubble.png" alt="" className="absolute left-5 top-0 h-[111px] w-[194px] rotate-180 -scale-y-100 object-cover mix-blend-color-dodge" />
          <p className="absolute left-[107px] top-[25px] font-pixel text-[16px] leading-[18px] tracking-[0.8px] text-black">
            {sent ? 'See you soon!' : 'Thank you for scrolling'}
            <br />
            {sent ? '♥' : 'this far.'}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (email) setSent(true)
          }}
          className="border-4 border-black bg-white text-black"
        >
          <h2 className="border-b-4 border-black py-3 text-center font-display text-[24px] font-bold uppercase tracking-[1.2px]">
            Lets keep in touch
          </h2>
          <div className="flex flex-col items-center gap-0 px-[21px] pb-5 pt-4">
            <label htmlFor="newsletter-email" className="sr-only">
              Your email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL"
              disabled={sent}
              className="h-[42px] w-full border-4 border-black px-3 text-center font-display text-[16px] font-medium uppercase tracking-[0.8px] placeholder:text-[#868686] focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
            <button
              type="submit"
              disabled={sent}
              className="-mt-1 flex w-full items-center justify-center border-4 border-black bg-secondary-500 px-6 py-4 font-pixel text-[64px] leading-[18px] tracking-[3.2px] hover:bg-secondary-400 disabled:opacity-70 max-md:text-[40px]"
            >
              {sent ? 'DONE' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
