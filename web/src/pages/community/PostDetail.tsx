import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addReply,
  canPost,
  countView,
  deletePost,
  loadEntries,
  submitEntry,
  toggleLike,
  updatePost,
  usePosts,
  useCommunityReady,
  type Challenge,
  type Creation,
  type Discussion,
  type Entry,
  type Post,
} from '../../data/community'
import { openSignIn } from '../../lib/auth'
import ComingSoon from '../ComingSoon'
import { Difficulty, Reward } from './CommunityList'
import { GreyCard, PostAuthor, ReplyCard, Tag } from './shared'

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

// ⋮ menu on your own posts: edit or delete.
function OwnerMenu({ post, onEdit }: { post?: Post; onEdit?: () => void }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  if (!post?.mine) return <img src="/assets/community/more.svg" alt="" className="size-5" />
  const item = 'block w-full px-4 py-2.5 text-left text-[14px] font-bold hover:bg-neutral-600'
  return (
    <div className="relative">
      <button type="button" aria-label="Post options" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded p-0.5 hover:bg-neutral-700">
        <img src="/assets/community/more.svg" alt="" className="size-5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-[140px] overflow-hidden rounded-lg bg-neutral-700 shadow-glow">
          <button type="button" role="menuitem" className={item} onClick={() => (setOpen(false), onEdit?.())}>
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${item} text-primary-500`}
            onClick={async () => {
              setOpen(false)
              if (!confirm('Delete this post? This cannot be undone.')) return
              try {
                await deletePost(post.id)
                navigate(`/community/${post.kind}`, { replace: true })
              } catch (e) {
                alert(e instanceof Error ? e.message : 'Could not delete the post.')
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function EditPost({ post, onDone }: { post: Post; onDone: () => void }) {
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.kind === 'challenges' ? '' : post.body)
  const [tags, setTags] = useState(post.tags.join(', '))
  const [rules, setRules] = useState(post.kind === 'challenges' ? post.rules.join('\n') : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const field = 'w-full rounded-lg bg-neutral-700 px-3 py-2.5 text-[16px] focus:outline-none focus:ring-1 focus:ring-secondary-500'
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          await updatePost(post.id, {
            title,
            tags: tags.split(/[,\s]+/).map((t) => t.replace(/^#/, '').trim()).filter(Boolean).slice(0, 8),
            ...(post.kind === 'challenges' ? { rules: rules.split('\n').map((r) => r.trim()).filter(Boolean) } : { body }),
          })
          onDone()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not save.')
        } finally {
          setBusy(false)
        }
      }}
      className="flex flex-col gap-3 rounded-lg bg-neutral-800 p-4"
    >
      <label className="flex flex-col gap-1 text-[14px] font-bold">
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={`${field} text-[20px] font-bold`} />
      </label>
      {post.kind === 'challenges' ? (
        <label className="flex flex-col gap-1 text-[14px] font-bold">
          Rules (one per line)
          <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={5} className={field} />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-[14px] font-bold">
          Text
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className={field} />
        </label>
      )}
      <label className="flex flex-col gap-1 text-[14px] font-bold">
        Tags (comma separated)
        <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
      </label>
      {error && <p className="text-[13px] font-bold text-primary-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded px-3 py-1.5 font-pixel text-[18px] hover:bg-neutral-700">
          CANCEL
        </button>
        <button type="submit" disabled={busy} className="rounded bg-secondary-500 px-3 py-1.5 font-pixel text-[18px] text-black hover:bg-secondary-400 disabled:opacity-50">
          {busy ? 'SAVING…' : 'SAVE CHANGES'}
        </button>
      </div>
    </form>
  )
}

function Actions({ post, withReactions = true, onEdit }: { post?: Post; withReactions?: boolean; onEdit?: () => void }) {
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
      <OwnerMenu post={post} onEdit={onEdit} />
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
          <ReplyCard key={r.id} r={r} postId={post.id} />
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

function DiscussionBody({ d, onEdit }: { d: Discussion; onEdit: () => void }) {
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
      <Actions post={d} onEdit={onEdit} />
      <p className="mt-4 whitespace-pre-wrap text-[18px] leading-[30px]">{d.body}</p>
      {d.image && <img src={d.image} alt="" className="w-[260px] max-w-full rounded" />}
    </>
  )
}

function CreationBody({ c, onEdit }: { c: Creation; onEdit: () => void }) {
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
      <Actions post={c} onEdit={onEdit} />
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

// Submit results: score and an optional proof link. One entry per player;
// real challenges store it in challenge_entries as "pending".
function SubmitResults({ c, onSubmitted }: { c: Challenge; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState('')
  const [proof, setProof] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const btn = 'rounded bg-secondary-500 px-3.5 py-2 font-pixel text-[16px] tracking-[0.8px] text-black hover:bg-secondary-400 disabled:opacity-50'
  if (c.completed) return <span className={`${btn} pointer-events-none`}>RESULTS SUBMITTED ✓</span>
  if (!open)
    return (
      <button type="button" onClick={() => (c.real && !canPost() ? openSignIn() : setOpen(true))} className={btn}>
        SUBMIT RESULTS
      </button>
    )
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          await submitEntry(c.id, score.trim() ? Number(score) : null, proof)
          setOpen(false)
          onSubmitted()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not submit.')
        } finally {
          setBusy(false)
        }
      }}
      className="flex w-full flex-wrap items-center gap-2 rounded-lg bg-neutral-800 p-3"
    >
      <input type="number" min={0} inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Score" aria-label="Score" className="w-[110px] rounded bg-neutral-700 px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-secondary-500" />
      <input type="url" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Proof link (video or screenshot)" aria-label="Proof link" className="min-w-[180px] flex-1 rounded bg-neutral-700 px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-secondary-500" />
      <button type="submit" disabled={busy} className={btn}>
        {busy ? 'SENDING…' : 'SEND'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="px-2 font-pixel text-[16px] text-neutral-50 hover:text-white">
        CANCEL
      </button>
      {error && <p className="w-full text-[13px] font-bold text-primary-500">{error}</p>}
    </form>
  )
}

const SAMPLE_TOP = ['PlayerOneX', 'ProGod88', 'Min89ga', 'Casper32', 'PixelWarrior']

function ChallengeBody({ c, onEdit }: { c: Challenge; onEdit: () => void }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    if (!c.real) return
    let live = true
    loadEntries(c.id)
      .then((e) => live && setEntries(e))
      .catch(() => live && setEntries([]))
    return () => {
      live = false
    }
  }, [c.id, c.real, reload])
  const top = c.real ? (entries ?? []).filter((e) => e.status !== 'rejected').slice(0, 5) : null
  const mine = entries?.find((e) => e.mine)
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
      <div className="flex flex-wrap items-center gap-2">
        <SubmitResults c={c} onSubmitted={() => setReload((n) => n + 1)} />
        <div className="flex-1">
          <Actions post={c} withReactions={false} onEdit={onEdit} />
        </div>
      </div>
      {mine && (
        <p className="text-[13px] text-neutral-50">
          Your entry{mine.score !== null ? `: ${mine.score}` : ''} · {mine.status === 'pending' ? 'waiting for review' : mine.status}
        </p>
      )}
      <h2 className="mt-8 text-[18px] font-bold">Top 5 competitors</h2>
      <div className="flex flex-wrap gap-2">
        {top && !top.length && <span className="text-[14px] text-neutral-50">No entries yet. Be the first!</span>}
        {(top ?? SAMPLE_TOP.map((n) => ({ id: n, user: n, score: null as number | null }))).map((e, i) => (
          <span key={e.id} className="rounded bg-neutral-600 px-2.5 py-1.5 text-[14px] font-bold">
            #{i + 1} {e.user}
            {e.score !== null && <span className="ml-1.5 text-secondary-400">{e.score}</span>}
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
  const [editing, setEditing] = useState(false)
  const found = !!post
  useEffect(() => {
    if (found && id) countView(id)
  }, [found, id])
  if (!post && !ready) return <p className="px-4 py-16 text-center font-pixel text-[24px]">Loading…</p>
  if (!post) return <ComingSoon />
  const twoCol = post.kind !== 'challenges'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262626] bg-[radial-gradient(#353535_1px,transparent_1px)] [background-size:12px_12px]">
      <div className={`mx-auto flex max-w-[1280px] max-lg:flex-col ${twoCol ? '' : 'justify-center'}`}>
        <article className={`flex flex-col gap-4 px-4 py-6 lg:pl-32 lg:pr-10 ${twoCol ? 'flex-1' : 'w-full max-w-[1024px] lg:px-0'}`}>
          <BackLink />
          {/* Author with a pointer down onto the post card (Figma 44:2259). */}
          <div className="flex flex-col">
            <PostAuthor author={post.author} />
            <div className="flex flex-col gap-4">
              {editing ? (
                <EditPost post={post} onDone={() => setEditing(false)} />
              ) : (
                <>
                  {post.kind === 'discussions' && <DiscussionBody d={post} onEdit={() => setEditing(true)} />}
                  {post.kind === 'creations' && <CreationBody c={post} onEdit={() => setEditing(true)} />}
                  {post.kind === 'challenges' && <ChallengeBody c={post} onEdit={() => setEditing(true)} />}
                </>
              )}
            </div>
          </div>
        </article>
        {twoCol && <RepliesPanel post={post} />}
      </div>
    </div>
  )
}
