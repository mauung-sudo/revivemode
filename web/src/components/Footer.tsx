import { Link } from 'react-router-dom'

const LINKS = ['How to play', 'FAQs', 'About', 'Contact', 'Support']
const SOCIALS = [
  { name: 'Facebook', icon: '/assets/ui/facebook.png' },
  { name: 'Twitter', icon: '/assets/ui/twitter.png' },
  { name: 'Instagram', icon: '/assets/ui/instagram.png' },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-800">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-5 px-4 py-4 md:flex-row md:px-8 lg:px-32">
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <Link to="/">
              <img src="/assets/ui/logo.png" alt="Revive Mode" className="h-[30px] w-[88.6px] object-cover" />
            </Link>
            <ul className="flex flex-wrap items-center justify-center gap-3 text-[14px]">
              {LINKS.map((l, i) => (
                <li key={l} className="flex items-center gap-3">
                  {i > 0 && <span className="size-0.5 rounded-full bg-neutral-500" aria-hidden />}
                  <a href="#" className="hover:text-secondary-400">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[14px] text-neutral-50">© 2020-2026 Revive mode Company</p>
        </div>
        <div className="flex flex-1 flex-col items-center gap-5 md:items-end">
          <div className="flex gap-6 rounded p-2">
            {SOCIALS.map((s) => (
              <a key={s.name} href="#" aria-label={s.name}>
                <img src={s.icon} alt="" className="size-6 object-cover" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p
              className="bg-cover bg-center bg-clip-text font-pixel text-[20px] leading-[18px] tracking-[1px] text-transparent"
              style={{ backgroundImage: 'url(/assets/ui/made-with-love.png)' }}
            >
              This project is made with love
            </p>
            <img src="/assets/ui/life.png" alt="" className="size-6 object-cover" />
          </div>
        </div>
      </div>
    </footer>
  )
}
