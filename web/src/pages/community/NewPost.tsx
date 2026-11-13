import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGames } from '../../lib/catalog'
import { addPost, SECTIONS, type Challenge, type Section } from '../../data/community'
import { BackButton, PrimaryButton } from '../NewCollection'

const TOOLS = [
  { label: 'List', icon: '/assets/community/ic-list.svg', insert: '\n- ' },
  { label: 'Image', icon: '/assets/community/ic-image.svg', insert: '\n![image](url)' },
  { label: 'Video', icon: '/assets/community/ic-video.svg', insert: '\n[video](url)' },
  { label: 'Link', icon: '/assets/community/ic-link.svg', insert: '[text](url)' },
]
const DIFFICULTIES: Challenge['difficulty'][] = ['EZ', 'Medium', 'Hard', 'Extreme']
const PLACEHOLDER: Record<Section, { title: string; body: string }> = {
  discussions: { title: 'Introduce your topic', body: 'Start your discussion here' },
  challenges: { title: 'Name of the challenge', body: 'Add rules of your challenge here' },
  creations: { title: 'Name of the artwork', body: 'Add some description of your artwork' },
}

export default function NewPost() {
  const allGames = useGames()
  const { section } = useParams() as { section: Section }
  const navigate = useNavigate()
  const meta = SECTIONS.find((s) => s.id === section)
  const body = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [tags, setTags] = useState<string[]>(['general'])
  const [tagDraft, setTagDraft] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [difficulty, setDifficulty] = useState<Challenge['difficulty'] | null>(null)
  const [game, setGame] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  if (!meta) return null
  const ph = PLACEHOLDER[section]

  const addImages = (files: FileList | null) => {
    if (!files) return
    // Local previews only; uploading to storage arrives with the backend.
    const urls = [...files].filter((f) => f.type.startsWith('image/')).map((f) => URL.createObjectURL(f))
    setImages((s) => [...s, ...urls])
  }

  const insert = (snippet: string) => {
    const el = body.current
    if (!el) return
    const at = el.selectionStart ?? text.length
    setText(text.slice(0, at) + snippet + text.slice(at))
    requestAnimationFrame(() => el.focus())
  }

  const canPublish = title.trim().length > 2 && (section !== 'challenges' || (difficulty && game)) && (section !== 'creations' || images.length > 0)

  const publish = () => {
    const base = {
      id: `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      title: title.trim(),
      author: { name: 'You', level: 'lvl.1' },
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      tags,
      replies: [],
    }
    if (section === 'discussions') addPost({ ...base, kind: 'discussions', body: text, likes: 0, views: 0 })
    if (section === 'creations') addPost({ ...base, kind: 'creations', body: text, likes: 0, images })
    if (section === 'challenges')
      addPost({ ...base, kind: 'challenges', game, platform: allGames.find((g) => g.title === game)?.platform ?? '', difficulty: difficulty!, competitors: 0, points: 100, badge: { name: 'Pioneer', icon: '/assets/community/trophy.png' }, rules: text.split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean) })
    navigate(`/community/${section}/${base.id}`, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262626]">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-4 px-4 py-10 lg:px-0">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate(`/community/${section}`)} />
          <h1 className="flex-1 text-[24px] font-bold max-md:text-[18px]">{meta.newTitle}</h1>
          {preview ? (
            <>
              <button type="button" onClick={() => setPreview(false)} className="px-3 font-pixel text-[20px] hover:text-secondary-400">
                EDIT
              </button>
              <PrimaryButton type="button" onClick={publish} disabled={!canPublish}>
                Publish
              </PrimaryButton>
            </>
          ) : (
            <PrimaryButton type="button" onClick={() => setPreview(true)} disabled={!title.trim()}>
              Preview
            </PrimaryButton>
          )}
        </div>

        {!preview && (
          <div className="flex items-center rounded-lg bg-neutral-700 px-2 py-1.5 text-[12px] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]">
            <span className="flex flex-1 items-center gap-1 border-r border-neutral-500">
              <img src="/assets/community/ic-text.svg" alt="" className="h-3.5" /> Title text
            </span>
            <span className="flex flex-1 justify-end gap-4">
              {TOOLS.map((t) => (
                <button key={t.label} type="button" onClick={() => insert(t.insert)} className="flex items-center gap-1 hover:text-secondary-400">
                  <img src={t.icon} alt="" className="size-4" /> {t.label}
                </button>
              ))}
            </span>
          </div>
        )}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={preview}
          placeholder={ph.title}
          aria-label="Title"
          maxLength={80}
          className="bg-transparent text-[24px] font-bold placeholder:text-neutral-50/80 focus:outline-none"
        />

        {section === 'challenges' ? (
          <>
            <label className="flex w-[236px] items-center gap-2 rounded-lg border border-neutral-400 px-3 py-2 font-pixel text-[16px]">
              <img src="/assets/ui/search.png" alt="" className="size-5" />
              <input list="challenge-games" value={game} onChange={(e) => setGame(e.target.value)} readOnly={preview} placeholder="Find the game to challenge" className="min-w-0 flex-1 bg-transparent placeholder:text-white focus:outline-none" />
              <datalist id="challenge-games">
                {allGames.map((g) => (
                  <option key={g.id} value={g.title} />
                ))}
              </datalist>
            </label>
            <p className="text-[14px] font-bold">Select difficulty</p>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button key={d} type="button" disabled={preview} aria-pressed={difficulty === d} onClick={() => setDifficulty(d)} className={`rounded-full px-3 py-1 text-[12px] ${difficulty === d ? 'bg-secondary-500 text-black' : 'bg-neutral-500 hover:bg-neutral-400'}`}>
                  {d}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {tags.map((t) => (
              <button key={t} type="button" disabled={preview || t === 'general'} onClick={() => setTags((s) => s.filter((x) => x !== t))} className="text-[14px] font-bold" title={t === 'general' ? undefined : 'Remove tag'}>
                #{t}
              </button>
            ))}
            {!preview &&
              (tagDraft === null ? (
                <button type="button" onClick={() => setTagDraft('')} className="flex items-center gap-1 rounded-full bg-neutral-500 px-2.5 py-1 text-[14px] font-bold hover:bg-neutral-400">
                  <img src="/assets/community/ic-add.svg" alt="" className="size-4" /> Add tag
                </button>
              ) : (
                <input
                  autoFocus
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (tagDraft && !tags.includes(tagDraft)) setTags((s) => [...s, tagDraft])
                      setTagDraft(null)
                    }
                    if (e.key === 'Escape') setTagDraft(null)
                  }}
                  onBlur={() => setTagDraft(null)}
                  placeholder="tag + Enter"
                  className="w-32 rounded-full bg-neutral-600 px-3 py-1 text-[14px] focus:outline-none"
                />
              ))}
          </div>
        )}

        {section === 'creations' && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addImages(e.dataTransfer.files)
            }}
            className={`flex w-[400px] max-w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 ${dragging ? 'border-secondary-500 bg-secondary-500/10' : 'border-neutral-400 bg-neutral-700'}`}
          >
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((src) => (
                  <img key={src} src={src} alt="" className="size-20 rounded object-cover" />
                ))}
              </div>
            )}
            {!preview && (
              <>
                <p className="text-[20px] font-bold">Drag and drop your photos here</p>
                <p className="text-[14px] font-bold">OR</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-2 rounded-full bg-secondary-500 px-4 py-2 text-[14px] font-bold text-black hover:bg-secondary-400">
                  <img src="/assets/community/ic-upload.svg" alt="" className="size-5" /> Upload from your device
                </button>
                <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
              </>
            )}
          </div>
        )}

        <textarea
          ref={body}
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={preview}
          placeholder={ph.body}
          aria-label="Body"
          rows={10}
          className="resize-y bg-transparent text-[18px] leading-[30px] placeholder:text-white focus:outline-none"
        />
        {preview && !canPublish && (
          <p className="text-[14px] text-primary-500">
            {section === 'challenges' ? 'Pick a game and difficulty before publishing.' : section === 'creations' ? 'Add at least one image before publishing.' : 'Add a longer title.'}
          </p>
        )}
      </div>
    </div>
  )
}
