import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addReply, canPost, toggleLike, usePosts, useCommunityReady, type Challenge, type Creation, type Discussion, type Post } from '../../data/community'
import { openSignIn } from '../../lib/auth'
import ComingSoon from '../ComingSoon'
import { Difficulty, Reward } from './CommunityList'
import { AuthorBadge, GreyCard, ReplyCard, Tag } from './shared'

function BackLink() {
  const navigate = useNavigate()
  const { section } = useParams()
  return (
    <button
      type="button"
      onClick={() => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate(`/community/${section}`))}
      className="flex items-center gap-2 font-pixel text-[28px] tracking-[1.4px] hover:text-secondary-400"
    >
      <img src="/assets/game/back.png" alt="" className="size-5" /> BACK
    </button>
  )
}

function Actions({ post, withReactions = true }: { post?: Post; withReactions?: boolean }) {
  const liked = !!post?.likedByMe
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)
  const chip = 'rounded bg-white px-2 py-1 font-pixel text-[14px] leading-none tracking-[0.7px] text-black hover:bg-neutral-50'
  return (
    <div className="flex items-center gap-2">
      {withReactions && (
        <>
          <button type="button" aria-pressed={liked} aria-label="Like" onClick={() => (post?.real && !canPost() ? openSignIn() : post && toggleLike(post.id))} className={`rounded-lg bg-white p-1.5 ${liked ? 'ring-2 ring-secondary-500' : ''}`}>
            <img src="/assets/community/thumbs-up.png" alt="" className="pixelated size-6" />
          </button>
          <a href="#replies" aria-label="Replies" className="rounded-lg bg-white p-1.5">
            <img src="/assets/community/chat.webp" alt="" className="pixelated size-6" />
          </a>
        </>
      )}
      <span className="flex-1" />
      <button type="button" onClick={() => setSaved((s) => !s)} className={chip}>
        {saved ? 'SAVED' : 'SAVE'}
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(location.href).then(() => setShared(true), () => {})
          setTimeout(() => setShared(false), 1500)
        }}
        className={chip}
      >
        {shared ? 'COPIED' : 'SHARE'}
      </button>
      <img src="/assets/community/more.svg" alt="" className="size-5" />
    </div>
  )
}

function RepliesPanel({ post }: { post: Post }) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <aside id="replies" className="flex min-h-full w-[45%] flex-col bg-[#1d1d1d] max-lg:w-full">
      <h2 className="px-4 pb-4 pt-6 text-[25px] font-bold">Replies({post.replies.length})</h2>
      <ul className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        {post.replies.map((r) => (
          <ReplyCard key={r.id} r={r} />
        ))}
      </ul>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!draft.trim() || sending) return
          if (post.real && !canPost()) return openSignIn()
          setSending(true)
          setError(null)
          try {
            await addReply(post.id, draft.trim())
            setDraft('')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not send your reply.')
          } finally {
            setSending(false)
          }
        }}
        className="sticky bottom-0 flex flex-wrap gap-2 bg-[#1d1d1d] p-4"
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={post.real && !canPost() ? 'Sign in to join the conversation' : 'Join the conversation'} aria-label="Reply" className="min-w-0 flex-1 rounded-lg bg-neutral-700 px-3 py-2.5 text-[14px] font-bold placeholder:text-white focus:outline-none focus:ring-1 focus:ring-secondary-500" />
        <button type="submit" aria-label="Send reply" disabled={sending} className="rounded-lg bg-white p-2 disabled:opacity-50">
          <img src="/assets/community/chat.webp" alt="" className="pixelated size-6" />
        </button>
        {error && (
          <p role="alert" className="w-full text-[13px] font-bold text-primary-500">
            {error}
          </p>
        )}
      </form>
    </aside>
  )
}

function DiscussionBody({ d }: { d: Discussion }) {
  return (
    <>
      <GreyCard className="p-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-bold">{d.title}</h1>
          <span className="shrink-0 text-[14px] font-bold text-secondary-400">
            {d.views} views&nbsp;&nbsp;{d.likes} likes
          </span>
        </div>
        <div className="mt-2 flex justify-between gap-3">
          <div className="flex flex-wrap gap-2">{d.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
          <span className="shrink-0 text-[12px] text-neutral-50">{d.date}</span>
        </div>
      </GreyCard>
      <Actions post={d} />
      <p className="mt-4 text-[18px] leading-[30px]">{d.body}</p>
      {d.image && <img src={d.image} alt="" className="w-[260px] max-w-full rounded" />}
    </>
  )
}

function CreationBody({ c }: { c: Creation }) {
  const [i, setI] = useState(0)
  return (
    <>
      <GreyCard className="p-3">
        <h1 className="text-[28px] font-bold">{c.title}</h1>
        <div className="mt-1 flex flex-wrap gap-2">{c.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <div className="mt-1 flex justify-between text-[12px] text-neutral-50">
          <span>
            {c.likes} likes&nbsp;&nbsp;{c.replies.length} replies
          </span>
          <span>{c.date}</span>
        </div>
      </GreyCard>
      <Actions post={c} />
      <div className="relative mt-4">
        <img src={c.images[i]} alt={`${c.title}, image ${i + 1}`} className="aspect-[328/190] w-full rounded object-cover" />
        {c.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-2 py-0.5 text-[12px]">
            <button type="button" aria-label="Previous image" onClick={() => setI((i - 1 + c.images.length) % c.images.length)}>
              «
            </button>
            {i + 1}/{c.images.length}
            <button type="button" aria-label="Next image" onClick={() => setI((i + 1) % c.images.length)}>
              »
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-[16px] leading-[26px]">{c.body}</p>
    </>
  )
}

function ChallengeBody({ c }: { c: Challenge }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <>
      <GreyCard className="p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-bold">{c.title}</h1>
          <Difficulty d={c.difficulty} />
        </div>
        <p className="mt-1 text-[14px] font-bold text-neutral-50">{c.game}</p>
        <div className="flex justify-between text-[12px] text-neutral-50">
          <span>{c.competitors} competitors</span>
          <span>{c.date}</span>
        </div>
        <Reward c={c} />
      </GreyCard>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="rounded bg-secondary-500 px-3.5 py-2 font-pixel text-[16px] tracking-[0.8px] text-black hover:bg-secondary-400"
        >
          {submitted ? 'RESULTS SUBMITTED ✓' : 'SUBMIT RESULTS'}
        </button>
        <div className="flex-1">
          <Actions withReactions={false} />
        </div>
      </div>
      <h2 className="mt-8 text-[18px] font-bold">Top 5 competitors</h2>
      <div className="flex flex-wrap gap-2">
        {['PlayerOneX', 'ProGod88', 'Min89ga', 'Casper32', 'PixelWarrior'].map((n, i) => (
          <span key={n} className="rounded bg-neutral-600 px-2.5 py-1.5 text-[14px] font-bold">
            #{i + 1} {n}
          </span>
        ))}
        <span className="flex items-center gap-1 rounded border border-white px-2.5 py-1.5 text-[14px] font-bold">
          Open leaderboard <img src="/assets/library/triple-forward.png" alt="" className="pixelated size-4" />
        </span>
      </div>
      <h2 className="mt-8 text-[32px] font-bold">Rules</h2>
      <ol className="ml-6 list-decimal space-y-1 text-[18px] leading-[30px]">
        {c.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
    </>
  )
}

export default function PostDetail() {
  const { section, id } = useParams()
  const post = usePosts().find((p) => p.kind === section && p.id === id)
  const ready = useCommunityReady()
  if (!post && !ready) return <p className="px-4 py-16 text-center font-pixel text-[24px]">Loading…</p>
  if (!post) return <ComingSoon />
  const twoCol = post.kind !== 'challenges'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262626] bg-[radial-gradient(#353535_1px,transparent_1px)] [background-size:12px_12px]">
      <div className={`mx-auto flex max-w-[1280px] max-lg:flex-col ${twoCol ? '' : 'justify-center'}`}>
        <article className={`flex flex-col gap-4 px-4 py-6 lg:pl-32 lg:pr-10 ${twoCol ? 'flex-1' : 'w-full max-w-[1024px] lg:px-0'}`}>
          <BackLink />
          <AuthorBadge author={post.author} size={48} />
          {post.kind === 'discussions' && <DiscussionBody d={post} />}
          {post.kind === 'creations' && <CreationBody c={post} />}
          {post.kind === 'challenges' && <ChallengeBody c={post} />}
        </article>
        {twoCol && <RepliesPanel post={post} />}
      </div>
    </div>
  )
}
