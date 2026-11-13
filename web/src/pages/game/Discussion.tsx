import { useState } from 'react'
import TvCard from '../../components/TvCard'
import Avatar from '../../components/Avatar'
import type { MockGame } from '../../data/games'
import { useGames } from '../../lib/catalog'
import { SAMPLE_COMMENTS, type Comment } from '../../data/gameDetails'

function CommentRow({ c }: { c: Comment }) {
  const [liked, setLiked] = useState(false)
  return (
    <li className="flex gap-3 rounded-lg bg-neutral-800 p-4">
      <Avatar size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold">{c.user}</span>
          <span className="text-[12px] text-neutral-400">{c.ago}</span>
        </div>
        <p className="mt-1 text-[16px]">{c.text}</p>
        {c.replies > 0 && <button className="mt-2 text-[14px] text-secondary-400 hover:underline">View {c.replies} Replies</button>}
      </div>
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => setLiked((l) => !l)}
        className={`flex h-fit items-center gap-1 rounded-full px-2 py-1 text-[14px] ${liked ? 'bg-primary-500/20 text-primary-500' : 'text-neutral-50 hover:bg-neutral-600'}`}
      >
        <img src="/assets/game/heart.png" alt="" className={`pixelated size-4 ${liked ? '' : 'grayscale'}`} />
        {c.likes + (liked ? 1 : 0)}
      </button>
    </li>
  )
}

// Comments + related games. Comments are local until the backend exists.
export default function Discussion({ game }: { game: MockGame }) {
  const [comments, setComments] = useState(() => SAMPLE_COMMENTS(game.title))
  const [draft, setDraft] = useState('')
  const related = useGames().filter((g) => g.id !== game.id && (g.genre === game.genre || g.platform === game.platform)).slice(0, 3)

  return (
    <section className="flex gap-12 py-10 max-lg:flex-col">
      <div className="min-w-0 flex-1">
        <h2 className="mb-6 text-[25px] font-bold">Comments({comments.length})</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            setComments((cs) => [{ id: String(Date.now()), user: 'You', text: draft.trim(), ago: 'now', replies: 0, likes: 0 }, ...cs])
            setDraft('')
          }}
          className="mb-6 flex gap-3"
        >
          <Avatar size={40} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            className="min-w-0 flex-1 rounded-lg border border-neutral-400 bg-transparent px-4 text-[16px] focus:border-secondary-500 focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-secondary-500 px-4 font-pixel text-[20px] text-black hover:bg-secondary-400">
            POST
          </button>
        </form>
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <CommentRow key={c.id} c={c} />
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
