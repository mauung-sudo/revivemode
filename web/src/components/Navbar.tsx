import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import { hasBackend } from '../lib/supabase'
import { openSignIn, useAuth } from '../lib/auth'

const NAV = [
  { to: '/', label: 'Home', icon: '/assets/ui/ic-controller.svg', end: true },
  { to: '/library', label: 'Library', icon: '/assets/ui/ic-library.svg', end: false },
  { to: '/community', label: 'Community', icon: '/assets/ui/ic-community.svg', end: false },
]

function SearchButton({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/search')}
      className={`flex min-w-[92px] flex-1 items-center gap-2.5 rounded-lg bg-neutral-800 text-left hover:bg-neutral-600 ${
        compact ? 'max-w-[218px] px-3 py-2' : 'max-w-[300px] px-4 py-3'
      }`}
    >
      <img src="/assets/ui/search.png" alt="" className={compact ? 'size-4' : 'size-6'} />
      <span
        className={`truncate font-pixel leading-[18px] ${
          compact ? 'text-[14px] tracking-[0.7px] text-neutral-50' : 'text-[20px] tracking-[1px] text-white'
        }`}
      >
        Games, topics, discussions
      </span>
    </button>
  )
}

// Profile avatar when signed in (or in local-only prototype mode);
// a Sign in button when accounts are set up but nobody is signed in.
function AccountButton({ size }: { size: number }) {
  const { ready, session, profile } = useAuth()
  if (hasBackend && ready && !session)
    return (
      <button
        type="button"
        onClick={openSignIn}
        className={`whitespace-nowrap rounded-lg border-2 border-black bg-secondary-500 font-pixel leading-none text-black hover:bg-secondary-400 ${
          size > 24 ? 'px-3 py-1.5 text-[20px] tracking-[1px]' : 'px-2 py-1 text-[16px]'
        }`}
      >
        Sign in
      </button>
    )
  return (
    <Link to="/profile" aria-label="Your profile" className="rounded-full bg-neutral-500 p-0.5">
      <Avatar size={size} src={profile?.avatar_url} />
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-neutral-700 shadow-[0_0_8px_black,0_0_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]">
      {/* Desktop */}
      <div className="mx-auto hidden max-w-[1280px] items-center gap-6 px-8 py-2 md:flex lg:px-32">
        <div className="flex flex-1 items-center gap-6">
          <Link to="/" aria-label="Revive Mode home">
            <img src="/assets/ui/logo.png" alt="Revive Mode" className="h-8 w-[94.5px] object-cover" />
          </Link>
          <SearchButton />
        </div>
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-3 p-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg border px-3 py-1 font-pixel text-[18px] leading-[18px] tracking-[0.9px] ${
                    isActive ? 'border-neutral-400' : 'border-transparent hover:border-neutral-500'
                  }`
                }
              >
                <img src={item.icon} alt="" className="size-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="mx-1 h-12 w-px bg-neutral-400" aria-hidden />
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Notifications" className="rounded-lg p-2.5 hover:bg-neutral-600">
              <img src="/assets/ui/notice.png" alt="" className="size-6" />
            </button>
            <AccountButton size={32} />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-4 px-4 py-1 md:hidden">
        <div className="flex flex-1 items-center gap-3">
          <Link to="/" aria-label="Revive Mode home">
            <img src="/assets/ui/logo.png" alt="Revive Mode" className="h-6 w-[71px] object-cover" />
          </Link>
          <SearchButton compact />
        </div>
        <div className="flex items-center gap-3">
          <AccountButton size={24} />
          <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="size-6">
            <img src="/assets/ui/menu.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-neutral-600 bg-neutral-700 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 font-pixel text-[20px] ${isActive ? 'bg-neutral-800' : ''}`
              }
            >
              <img src={item.icon} alt="" className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
