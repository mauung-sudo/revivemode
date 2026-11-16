import { useState } from 'react'
import TvCard from '../../components/TvCard'
import Avatar from '../../components/Avatar'
import type { MockGame } from '../../data/games'
import { useGames } from '../../lib/catalog'
import { useAuth } from '../../lib/auth'
import { addComment, deleteComment, toggleCommentLike, useGameThread, type GameComment } from '../../lib/gameComments'

// Game page comments (Figma 49:3237 "side/comments"): speech-bubble cards
// pointing at a square avatar, thumbs-up count, and a comment bar with a
// green send button. Saved through lib/gameComments; posting needs an account.

function CommentAvatar({ src, size = 32 }: { src: string | null; size?: number }) {
  if (!src) return <Avatar size={size} />
  return <img src={src} alt="" referrerPolicy="no-referrer" className="shrink-0 rounded-[4px] object-cover" style={{ width: size, height: size }} />
}

function CommentBox({ onPost, placeholder, autoFocus, compact }: { onPost: (text: string) => Promise<boolean>; placeholder: string; autoFocus?: boolean; compact?: boolean }) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!draft.trim() || busy) return
        setBusy(true)
        setError('')
        try {
          if (await onPost(draft)) setDraft('')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not post.')
        } finally {
          setBusy(false)
        }
      }}
      className="flex w-full flex-col gap-1"
    >
      <div className="flex w-full items-stretch">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={2000}
          autoFocus={autoFocus}
          className={`min-w-0 flex-1 rounded-l-[8px] bg-neutral-800 px-4 font-bold tracking-[0.064px] text-white placeholder:text-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-secondary-500 ${compact ? 'py-2.5 text-[14px]' : 'py-5 text-[16px] leading-4'}`}
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          aria-label="Post comment"
          className="flex shrink-0 items-center justify-center rounded-r-[8px] bg-gradient-to-t from-[#b1f2d7] from-[32.5%] to-white to-[130%] p-3 transition hover:brightness-105 disabled:cursor-default"
        >
          <img src="/assets/game/comments/send.png" alt="" className="size-6 object-cover" />
        </button>
      </div>
      {error && <p className="text-[14px] text-red-400">{error}</p>}
    </form>
  )
}

function CommentRow({ c, gameId, isReply = false }: { c: GameComment; gameId: string; isReply?: boolean }) {
  const [open, setOpen] = useState(false)
  const [replying, setReplying] = useState(false)
  const replyCount = c.real ? c.replies.length : (c.sampleReplies ?? c.replies.length)
  // Sample comments have a count but no reply bodies, so there is nothing to expand.
  const canExpand = c.replies.length > 0
  const meta = 'text-[14px] text-[#d1d1d1]'

  return (
    <li className="flex w-full flex-col">
      <div className="flex w-full items-start">
        {/* avatar + bubble pointer */}
        <div className="flex shrink-0 items-center gap-2 py-3">
          <CommentAvatar src={c.avatar} />
          <img src="/assets/game/comments/pointer.svg" alt="" width={11} height={16} className="rotate-180" />
        </div>
        <div className={`flex min-w-0 flex-1 flex-col justify-center rounded-[8px] px-3 py-2 ${isReply ? 'bg-neutral-700' : 'bg-neutral-800'}`}>
          <p className="text-[14px] text-white">{c.user}</p>
          <p className="whitespace-pre-wrap break-words text-[20px] leading-8 tracking-[0.1px] text-white max-md:text-[17px] max-md:leading-7">{c.text}</p>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[14px] text-[#bbb]">{c.ago}</span>
              {!isReply && replyCount > 0 && (
                <button type="button" disabled={!canExpand} onClick={() => setOpen((o) => !o)} className={`flex items-center gap-1 ${meta} enabled:hover:text-white disabled:cursor-default`}>
                  <img src="/assets/game/comments/chat.svg" alt="" width={16} height={16} />
                  {open ? 'Hide replies' : `View ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`}
                </button>
              )}
              {!isReply && (
                <button type="button" onClick={() => setReplying((r) => !r)} className={`${meta} hover:text-white`}>
                  Reply
                </button>
              )}
              {c.mine && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this comment?')) deleteComment(gameId, c.id).catch((e) => alert(e.message))
                  }}
                  className={`${meta} hover:text-red-400`}
                >
                  Delete
                </button>
              )}
            </div>
            <button
              type="button"
              aria-pressed={c.likedByMe}
              aria-label={c.likedByMe ? 'Remove like' : 'Like comment'}
              onClick={() => toggleCommentLike(gameId, c.id)}
              className={`flex shrink-0 items-center gap-1 rounded px-1 text-[14px] transition ${c.likedByMe ? 'font-bold text-secondary-400' : 'text-[#d1d1d1] hover:text-white'}`}
            >
              <img src="/assets/game/comments/thumbs-up.svg" alt="" width={16} height={16} className={c.likedByMe ? 'scale-110' : 'opacity-90'} />
              {c.likes}
            </button>
          </div>
        </div>
      </div>
      {(replying || (open && c.replies.length > 0)) && (
        <div className="ml-[51px] mt-2 flex flex-col gap-2">
          {replying && (
            <CommentBox
              compact
              autoFocus
              placeholder={`Reply to ${c.user}`}
              onPost={async (text) => {
                const ok = await addComment(gameId, text, c.id)
                if (ok) {
                  setReplying(false)
                  setOpen(true)
                }
                return ok
              }}
            />
          )}
          {open && c.replies.length > 0 && (
            <ul className="flex flex-col gap-2">
              {c.replies.map((r) => (
                <CommentRow key={r.id} c={r} gameId={gameId} isReply />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default function Discussion({ game }: { game: MockGame }) {
  const thread = useGameThread(game.id, game.title)
  useAuth() // re-render on sign-in so "mine" flags refresh
  const related = useGames().filter((g) => g.id !== game.id && (g.genre === game.genre || g.platform === game.platform)).slice(0, 3)

  return (
    <section className="flex gap-12 py-10 max-lg:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <h2 className="px-6 text-[31.25px] font-bold leading-[48px] tracking-[0.0781px] max-md:px-0 max-md:text-[25px]">Comments({thread.comments.length})</h2>
        <div className="px-6 py-4 max-md:px-0">
          <CommentBox placeholder="Add your comment" onPost={(text) => addComment(game.id, text)} />
        </div>
        {!thread.loaded && <p className="pl-6 text-[14px] text-neutral-400">Loading comments…</p>}
        <ul className="flex flex-col gap-6 pl-6 max-md:pl-0">
          {thread.comments.map((c) => (
            <CommentRow key={c.id} c={c} gameId={game.id} />
          ))}
        </ul>
      </div>
      <aside className="w-[296px] shrink-0 max-lg:w-full">
        <h2 className="mb-6 text-[25px] font-bold">Related games</h2>
        <div className="flex flex-col items-center gap-6 max-lg:flex-row max-lg:overflow-x-auto">
          {related.map((g) => (
            <TvCard key={g.id} game={g} />
          ))}
        </div>
      </aside>
    </section>
  )
}
