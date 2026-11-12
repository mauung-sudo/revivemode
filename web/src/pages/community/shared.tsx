import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../../components/Avatar'
import { SECTIONS, type Author, type Reply, type Section } from '../../data/community'

export function AuthorBadge({ author, size = 40 }: { author: Author; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      {author.avatar ? (
        <img src={author.avatar} alt="" className="shrink-0 rounded object-cover" style={{ width: size, height: size }} />
      ) : (
        <Avatar size={size} />
      )}
      <div className="leading-tight">
        <p className="text-[16px] font-bold">{author.name}</p>
        <p className="text-[12px] text-neutral-400">{author.level}</p>
      </div>
    </div>
  )
}

export function RedCta({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex h-[52px] shrink-0 items-center gap-2 rounded-lg bg-[radial-gradient(ellipse_at_50%_100%,#fe8462,#e53201)] px-4 text-[20px] font-bold tracking-[0.25px] shadow-[0_0_8px_black,inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 max-md:h-11 max-md:text-[16px]"
    >
      {children}
      <img src="/assets/library/triple-forward.png" alt="" className="pixelated size-5" />
    </Link>
  )
}

// "Community/ Discussions ▾" title with the section switcher dropdown.
export function SectionHeader({ section, cta }: { section: Section; cta?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const meta = SECTIONS.find((s) => s.id === section)!
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <div className="flex items-center justify-between gap-4 py-2 max-md:flex-col max-md:items-start">
      <div ref={ref} className="relative">
        <h1 className="flex items-center gap-2 text-[40px] font-bold leading-[56px] max-md:text-[28px]">
          Community/
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 text-secondary-500">
            {meta.label}
            <span aria-hidden className={`size-0 border-x-[9px] border-t-[11px] border-x-transparent border-t-secondary-500 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </h1>
        {open && (
          <ul className="absolute left-[200px] top-full z-30 w-[187px] overflow-hidden rounded-lg bg-neutral-700 shadow-glow max-md:left-0">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate(`/community/${s.id}`)
                  }}
                  className={`w-full px-4 py-3.5 text-left text-[18px] font-bold hover:bg-neutral-600 ${s.id === section ? 'text-secondary-500' : ''}`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {cta && <RedCta to={`/community/${section}/new`}>{meta.cta}</RedCta>}
    </div>
  )
}

export function Pagination({ page, pages, go }: { page: number; pages: number; go: (n: number) => void }) {
  if (pages < 2) return null
  const btn = 'flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-[14px] font-bold'
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-2 py-3">
      <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => go(page - 1)} className={`${btn} bg-neutral-700 disabled:opacity-40`}>
        «
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => go(n)} className={`${btn} ${n === page ? 'bg-secondary-400 text-black' : 'hover:bg-neutral-600'}`}>
          {n}
        </button>
      ))}
      <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => go(page + 1)} className={`${btn} bg-neutral-700 disabled:opacity-40`}>
        »
      </button>
    </nav>
  )
}

export function ReplyCard({ r }: { r: Reply }) {
  const [liked, setLiked] = useState(false)
  return (
    <li className="flex gap-3">
      <Avatar size={24} />
      <div className="flex-1 rounded-lg bg-neutral-700 p-3">
        <p className="text-[14px] font-bold">{r.author}</p>
        <p className="mt-1 text-[16px] leading-[26px]">{r.text}</p>
        <div className="mt-2 flex items-center gap-4 text-[12px] text-neutral-50">
          <span>{r.ago}</span>
          <button type="button" className="flex items-center gap-1 hover:text-white">
            <img src="/assets/community/ic-chat.svg" alt="" className="size-3.5" /> {r.replies ? `View ${r.replies} Replies` : 'Reply'}
          </button>
          <button type="button" aria-pressed={liked} onClick={() => setLiked((l) => !l)} className={`ml-auto flex items-center gap-1 ${liked ? 'text-secondary-400' : 'hover:text-white'}`}>
            <img src="/assets/community/ic-thumbs-up.svg" alt="" className="size-3.5" /> {r.likes + (liked ? 1 : 0)}
          </button>
        </div>
      </div>
    </li>
  )
}

export function Tag({ children }: { children: string }) {
  return <span className="text-[12px] text-neutral-50">#{children}</span>
}

export function GreyCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-neutral-700 shadow-[0_4px_8px_rgba(0,0,0,0.4)] ${className}`}>{children}</div>
}
