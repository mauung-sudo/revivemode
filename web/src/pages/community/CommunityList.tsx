import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SortButton, Toolbar } from '../../components/FilterBar'
import { refreshPosts, TAGS, usePosts, type Challenge, type Creation, type Discussion, type Section } from '../../data/community'
import type { SortKey } from '../../lib/gameFilter'
import { AuthorBadge, GreyCard, Pagination, PointerRight, SectionHeader } from './shared'

const TABS: Record<Section, string[]> = {
  discussions: ['Featured', 'Personalized', 'Your posts'],
  challenges: ['Featured', 'Completed', 'Your challenges'],
  creations: ['For you', 'Home', 'Your posts'],
}
const SEARCH: Record<Section, string> = { discussions: 'Search discussions', challenges: 'Explore Challenges', creations: 'Explore fan creations' }
const PER_PAGE = 6

function Stat({ icon, n }: { icon: string; n: number }) {
  return (
    <span className="flex items-center gap-1 text-[14px] text-[#bbb]">
      <img src={icon} alt="" width={16} height={16} /> {n}
    </span>
  )
}

// List rows (Figma "list item"): card, a pointer aimed at the author, then the author.
function DiscussionRow({ d }: { d: Discussion }) {
  return (
    <li className="flex items-center py-3 max-md:flex-col max-md:items-stretch max-md:gap-2 max-md:py-0">
      <Link to={`/community/discussions/${d.id}`} className="group flex min-w-0 flex-1 items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-[8px] bg-neutral-800 px-4 py-2 group-hover:bg-neutral-700">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-[20px] font-bold leading-8 tracking-[0.03px]">{d.title}</h3>
            <div className="flex shrink-0 items-center gap-4">
              <Stat icon="/assets/community/list-thumbs-up.svg" n={d.likes} />
              <Stat icon="/assets/community/list-chat.svg" n={d.replies.length} />
              <Stat icon="/assets/community/ic-eye.svg" n={d.views} />
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 text-[14px] text-[#d1d1d1]">
            <div className="flex flex-wrap gap-2">
              {d.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
            <span className="shrink-0">{d.date}</span>
          </div>
        </div>
        <PointerRight />
      </Link>
      <div className="w-[176px] shrink-0 p-2 max-md:w-auto max-md:p-0">
        <AuthorBadge author={d.author} size={40} />
      </div>
    </li>
  )
}

function ChallengeRow({ c }: { c: Challenge }) {
  return (
    <li className="flex items-center py-3 max-md:flex-col max-md:items-stretch max-md:gap-2 max-md:py-0">
      <Link to={`/community/challenges/${c.id}`} className="group flex min-w-0 flex-1 items-center">
        <div className="min-w-0 flex-1 rounded-[8px] bg-neutral-800 px-4 py-2 group-hover:bg-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold leading-8">{c.title}</h3>
            <Difficulty d={c.difficulty} />
          </div>
          <p className="mt-1 text-[14px] font-bold text-neutral-50">{c.game}</p>
          <div className="flex justify-between text-[14px] text-[#d1d1d1]">
            <span>{c.competitors} competitors</span>
            <span>{c.date}</span>
          </div>
          <Reward c={c} />
        </div>
        <PointerRight />
      </Link>
      <div className="w-[176px] shrink-0 p-2 max-md:w-auto max-md:p-0">
        <AuthorBadge author={c.author} size={40} />
      </div>
    </li>
  )
}

export function Difficulty({ d }: { d: Challenge['difficulty'] }) {
  const color = d === 'Hard' || d === 'Extreme' ? 'text-primary-500' : d === 'Medium' ? 'text-[#ffae1b]' : 'text-secondary-400'
  return <span className={`rounded-full bg-neutral-800 px-2 py-0.5 text-[12px] font-bold ${color}`}>{d}</span>
}

export function Reward({ c }: { c: Challenge }) {
  return (
    <p className="mt-3 flex items-center gap-1.5 text-[12px] text-neutral-50">
      Win <img src="/assets/community/trophy.png" alt="" className="pixelated size-4" />
      <span className="text-[18px] font-bold text-secondary-400">{c.points}</span> pts +
      <img src={c.badge.icon} alt="" className="size-4 rounded-sm object-cover" /> {c.badge.name}
    </p>
  )
}

function CreationCard({ c }: { c: Creation }) {
  return (
    <li>
      <Link to={`/community/creations/${c.id}`} className="group block">
        <div className="flex items-baseline justify-between gap-2 pb-2">
          <h3 className="truncate text-[18px] font-bold group-hover:text-secondary-400">{c.title}</h3>
          <span className="shrink-0 text-[12px] text-neutral-50">{c.date}</span>
        </div>
        <div className="relative aspect-[245/145] overflow-hidden">
          <img src={c.images[0]} alt="" className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
            <AuthorBadgeMini c={c} />
            <span className="ml-auto flex items-center gap-1 rounded bg-black/50 px-1.5 text-[12px] font-bold">
              <img src="/assets/community/thumbs-up.png" alt="" className="pixelated size-4" /> {c.likes}
            </span>
            <span className="flex items-center gap-1 rounded bg-black/50 px-1.5 text-[12px] font-bold">
              <img src="/assets/community/chat.webp" alt="" className="pixelated size-4" /> {c.replies.length}
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}

function AuthorBadgeMini({ c }: { c: Creation }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-bold">
      {c.author.avatar && <img src={c.author.avatar} alt="" className="size-5 rounded-sm object-cover" />}
      {c.author.name}
    </span>
  )
}

export default function CommunityList() {
  const { section } = useParams() as { section: Section }
  const posts = usePosts()
  // Pick up other people's new posts each time a section is opened.
  useEffect(() => {
    refreshPosts()
  }, [section])
  const [tab, setTab] = useState(0)
  const [q, setQ] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)

  const list = useMemo(() => {
    let out = posts.filter((p) => p.kind === section)
    if (tab === 2) out = out.filter((p) => p.mine)
    if (section === 'challenges' && tab === 1) out = out.filter((p) => (p as Challenge).completed)
    if (tag) out = out.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    if (q.trim()) out = out.filter((p) => `${p.title} ${p.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()))
    if (sort === 'az') out = [...out].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'oldest') out = [...out].reverse()
    return out
  }, [posts, section, tab, tag, q, sort])

  if (!['discussions', 'challenges', 'creations'].includes(section)) return <Navigate to="/community/discussions" replace />
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const reset = () => setPage(1)

  return (
    <div className="min-h-[70vh] bg-[#262626] bg-[radial-gradient(#353535_1px,transparent_1px)] [background-size:12px_12px]">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-4 px-4 py-8 lg:px-0">
        <SectionHeader section={section} cta />
        {/* Tabs; on Creations the search sits on the same line (Figma 64:4049). */}
        <div className="flex items-center gap-4 pb-2 max-md:flex-col max-md:items-stretch">
          <div role="tablist" className="no-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto">
            {TABS[section].map((t, i) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === i}
                onClick={() => {
                  setTab(i)
                  reset()
                }}
                className={`shrink-0 py-3 text-[25px] font-bold leading-10 max-md:text-[18px] ${i === 0 ? 'pr-6' : 'px-6'} ${
                  tab === i ? 'bg-gradient-to-t from-[#b1f2d7] from-[32.5%] to-white to-[130%] bg-clip-text text-transparent' : 'text-[#d1d1d1] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {section === 'creations' && (
            <label className="flex min-w-[92px] max-w-[300px] flex-1 items-center gap-2.5 rounded-[8px] border border-neutral-400 px-4 py-3 max-md:max-w-none">
              <img src="/assets/ui/search-zoom.png" alt="" className="size-6 object-cover" />
              <input
                value={q}
                onChange={(e) => (setQ(e.target.value), reset())}
                placeholder={SEARCH[section]}
                aria-label={SEARCH[section]}
                className="min-w-0 flex-1 truncate bg-transparent font-pixel text-[20px] leading-[18px] tracking-[1px] placeholder:text-white focus:outline-none"
              />
            </label>
          )}
        </div>

        {section !== 'creations' && (
          <>
            <Toolbar>
              <SortButton sort={sort} onChange={setSort} />
              <span className="h-8 w-px bg-neutral-400 max-md:hidden" aria-hidden />
              <span className="text-[16px] font-bold">Filter by</span>
              <span className="rounded-lg border border-[#989898] px-3 py-2 text-[16px] font-bold">{section === 'discussions' ? 'Tag' : 'Platform'}</span>
              <label className="ml-auto flex w-[206px] items-center gap-2.5 rounded-lg border border-[#989898] px-3 py-2 max-md:ml-0 max-md:w-full">
                <img src="/assets/ui/search.png" alt="" className="size-5" />
                <input value={q} onChange={(e) => (setQ(e.target.value), reset())} placeholder={SEARCH[section]} className="min-w-0 flex-1 bg-transparent text-[14px] font-bold placeholder:text-white focus:outline-none" />
              </label>
            </Toolbar>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {TAGS[section].map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tag === t}
                  onClick={() => (setTag(tag === t ? null : t), reset())}
                  className={`shrink-0 rounded px-2 py-1 text-[12px] ${tag === t ? 'bg-secondary-500 text-black' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                >
                  #{t}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-neutral-50">
              {list.length} result{list.length === 1 ? '' : 's'}
              {tag ? ` in “${tag}”` : ''}
            </p>
          </>
        )}

        {section !== 'creations' && <Pagination page={page} pages={pages} go={setPage} />}

        {section === 'discussions' && (
          <section>
            <div className="mb-3 flex justify-between text-[14px] font-bold">
              <h2 className="text-[20px]">Topic</h2>
              <span className="w-[160px] max-md:hidden">Asked by</span>
            </div>
            <ul className="flex flex-col gap-5">{shown.map((d) => <DiscussionRow key={d.id} d={d as Discussion} />)}</ul>
          </section>
        )}
        {section === 'challenges' && (
          <section>
            <div className="mb-3 flex justify-between text-[14px] font-bold">
              <h2 className="text-[20px]">Challenge</h2>
              <span className="w-[160px] max-md:hidden">Challenger</span>
            </div>
            <ul className="flex flex-col gap-5">{shown.map((c) => <ChallengeRow key={c.id} c={c as Challenge} />)}</ul>
          </section>
        )}
        {section === 'creations' && (
          <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{shown.map((c) => <CreationCard key={c.id} c={c as Creation} />)}</ul>
        )}
        {!list.length && (
          <GreyCard className="p-8 text-center">
            <p className="font-pixel text-[24px]">Nothing here yet.</p>
            <Link to={`/community/${section}/new`} className="mt-2 inline-block text-secondary-400 underline">
              Be the first to post
            </Link>
          </GreyCard>
        )}
        {section === 'creations' && <Pagination page={page} pages={pages} go={setPage} />}
      </div>
    </div>
  )
}
