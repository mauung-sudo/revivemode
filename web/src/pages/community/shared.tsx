import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../../components/Avatar'
import { deleteReply, SECTIONS, toggleReplyLike, type Author, type Reply, type Section } from '../../data/community'

export function AuthorBadge({ author, size = 40 }: { author: Author; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      {author.avatar ? (
        <img src={author.avatar} alt="" className="shrink-0 rounded-[4px] object-cover" style={{ width: size, height: size }} />
      ) : (
        <Avatar size={size} />
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-bold leading-4 tracking-[0.064px]">{author.name}</p>
        <p className="text-[14px] text-[#666]">{author.level}</p>
      </div>
    </div>
  )
}

// Post page author (Figma "avatar" + "polygon up"): big avatar, name and level,
// with a pointer under the avatar aimed at the post card below.
export function PostAuthor({ author }: { author: Author }) {
  return (
    <div className="flex flex-col items-start gap-4 px-2">
      <div className="flex items-start gap-2">
        {author.avatar ? (
          <img src={author.avatar} alt="" className="size-14 shrink-0 rounded-[4px] object-cover" />
        ) : (
          <Avatar size={56} />
        )}
        <div className="flex flex-col gap-1 font-bold">
          <p className="text-[20px] leading-8 tracking-[0.03px]">{author.name}</p>
          <p className="text-[16px] leading-4 tracking-[0.064px] text-[#666]">{author.level}</p>
        </div>
      </div>
      <div className="flex px-4" aria-hidden>
        <img src="/assets/community/pointer-up.svg" alt="" width={13.6262} height={20.5} className="-my-[3.4px] -rotate-90" />
      </div>
    </div>
  )
}

// List row pointer (Figma "Polygon 1"): from the card towards the author.
export function PointerRight() {
  return <img src="/assets/community/pointer-right.svg" alt="" aria-hidden width={13.6262} height={20.5} className="shrink-0 max-md:hidden" />
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

export function ReplyCard({ r, postId }: { r: Reply; postId: string }) {
  return (
    <li className="flex gap-3">
      {r.avatar ? <img src={r.avatar} alt="" referrerPolicy="no-referrer" className="size-6 shrink-0 rounded-[4px] object-cover" /> : <Avatar size={24} />}
      <div className="flex-1 rounded-lg bg-neutral-700 p-3">
        <p className="text-[14px] font-bold">{r.author}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-[16px] leading-[26px]">{r.text}</p>
        <div className="mt-2 flex items-center gap-4 text-[12px] text-neutral-50">
          <span>{r.ago}</span>
          {r.replies > 0 && (
            <span className="flex items-center gap-1">
              <img src="/assets/community/ic-chat.svg" alt="" className="size-3.5" /> View {r.replies} Replies
            </span>
          )}
          {r.mine && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this reply?')) deleteReply(postId, r.id).catch((e) => alert(e.message))
              }}
              className="hover:text-red-400"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            aria-pressed={!!r.likedByMe}
            aria-label={r.likedByMe ? 'Remove like' : 'Like reply'}
            onClick={() => toggleReplyLike(postId, r.id)}
            className={`ml-auto flex items-center gap-1 ${r.likedByMe ? 'font-bold text-secondary-400' : 'hover:text-white'}`}
          >
            <img src="/assets/community/ic-thumbs-up.svg" alt="" className="size-3.5" /> {r.likes}
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
