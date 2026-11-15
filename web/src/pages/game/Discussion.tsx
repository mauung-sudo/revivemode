import { useState } from 'react'
import TvCard from '../../components/TvCard'
import Avatar from '../../components/Avatar'
import type { MockGame } from '../../data/games'
import { useGames } from '../../lib/catalog'
import { useAuth } from '../../lib/auth'
import { addComment, deleteComment, toggleCommentLike, useGameThread, type GameComment } from '../../lib/gameComments'

function CommentBox({ onPost, placeholder, avatar, autoFocus }: { onPost: (text: string) => Promise<boolean>; placeholder: string; avatar?: string | null; autoFocus?: boolean }) {
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
      className="flex flex-col gap-1"
    >
      <div className="flex gap-3">
        <Avatar size={40} src={avatar} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          maxLength={2000}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 rounded-lg border border-neutral-400 bg-transparent px-4 text-[16px] focus:border-secondary-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="rounded-lg bg-secondary-500 px-4 font-pixel text-[20px] text-black hover:bg-secondary-400 disabled:opacity-50"
        >
          POST
        </button>
      </div>
      {error && <p className="pl-[52px] text-[14px] text-red-400">{error}</p>}
    </form>
  )
}

function CommentRow({ c, gameId, myAvatar, isReply = false }: { c: GameComment; gameId: string; myAvatar?: string | null; isReply?: boolean }) {
  const [open, setOpen] = useState(false)
  const [replying, setReplying] = useState(false)
  const replyCount = c.real ? c.replies.length : (c.sampleReplies ?? c.replies.length)
  // Sample comments have a count but no reply bodies, so there is nothing to expand.
  const canExpand = c.replies.length > 0

  return (
    <li className={`flex gap-3 rounded-lg p-4 ${isReply ? 'bg-neutral-700' : 'bg-neutral-800'}`}>
      <Avatar size={isReply ? 32 : 40} src={c.avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold">{c.user}</span>
          <span className="text-[12px] text-neutral-400">{c.ago}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-[16px]">{c.text}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-[14px]">
          {!isReply && replyCount > 0 && (
            <button
              type="button"
              disabled={!canExpand}
              onClick={() => setOpen((o) => !o)}
              className="text-secondary-400 enabled:hover:underline disabled:cursor-default"
            >
              {open ? 'Hide replies' : `View ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`}
            </button>
          )}
          {!isReply && (
            <button type="button" onClick={() => setReplying((r) => !r)} className="text-neutral-400 hover:text-white">
              Reply
            </button>
          )}
          {c.mine && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this comment?')) deleteComment(gameId, c.id).catch((e) => alert(e.message))
              }}
              className="text-neutral-400 hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>
        {replying && (
          <div className="mt-3">
            <CommentBox
              placeholder={`Reply to ${c.user}…`}
              avatar={myAvatar}
              autoFocus
              onPost={async (text) => {
                const ok = await addComment(gameId, text, c.id)
                if (ok) {
                  setReplying(false)
                  setOpen(true)
                }
                return ok
              }}
            />
          </div>
        )}
        {open && c.replies.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {c.replies.map((r) => (
              <CommentRow key={r.id} c={r} gameId={gameId} myAvatar={myAvatar} isReply />
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        aria-pressed={c.likedByMe}
        aria-label="Like comment"
        onClick={() => toggleCommentLike(gameId, c.id)}
        className={`flex h-fit items-center gap-1 rounded-full px-2 py-1 text-[14px] ${c.likedByMe ? 'bg-primary-500/20 text-primary-500' : 'text-neutral-50 hover:bg-neutral-600'}`}
      >
        <img src="/assets/game/heart.png" alt="" className={`pixelated size-4 ${c.likedByMe ? '' : 'grayscale'}`} />
        {c.likes}
      </button>
    </li>
  )
}

// Comments (with replies and hearts) + related games. Saved to the backend
// through lib/gameComments; posting needs an account.
export default function Discussion({ game }: { game: MockGame }) {
  const thread = useGameThread(game.id, game.title)
  const { profile } = useAuth()
  const related = useGames().filter((g) => g.id !== game.id && (g.genre === game.genre || g.platform === game.platform)).slice(0, 3)

  return (
    <section className="flex gap-12 py-10 max-lg:flex-col">
      <div className="min-w-0 flex-1">
        <h2 className="mb-6 text-[25px] font-bold">Comments({thread.comments.length})</h2>
        <div className="mb-6">
          <CommentBox placeholder="Add a comment…" avatar={profile?.avatar_url} onPost={(text) => addComment(game.id, text)} />
        </div>
        {!thread.loaded && <p className="mb-3 text-[14px] text-neutral-400">Loading comments…</p>}
        <ul className="flex flex-col gap-3">
          {thread.comments.map((c) => (
            <CommentRow key={c.id} c={c} gameId={game.id} myAvatar={profile?.avatar_url} />
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
