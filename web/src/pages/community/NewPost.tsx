import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGames } from '../../lib/catalog'
import { addPost, SECTIONS, type Challenge, type Section } from '../../data/community'
import { hasBackend } from '../../lib/supabase'
import { openSignIn, useAuth } from '../../lib/auth'
import { BackButton, PrimaryButton } from '../NewCollection'

const TOOLS = [
  { label: 'List', icon: '/assets/community/toolbar/list.svg', insert: '\n- ' },
  { label: 'Image', icon: '/assets/community/toolbar/image.svg', insert: '\n![image](url)' },
  { label: 'Video', icon: '/assets/community/toolbar/video.svg', insert: '\n[video](url)' },
  { label: 'Link', icon: '/assets/community/toolbar/link.svg', insert: '[text](url)' },
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
  const [images, setImages] = useState<{ url: string; file: File }[]>([])
  const [dragging, setDragging] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { session } = useAuth()
  const needsSignIn = hasBackend && !session

  if (!meta) return null
  const ph = PLACEHOLDER[section]

  const addImages = (files: FileList | null) => {
    if (!files) return
    // Previews now; the files upload to storage when the post is published.
    const picked = [...files].filter((f) => f.type.startsWith('image/'))
    const tooBig = picked.filter((f) => f.size > 5 * 1024 * 1024)
    setError(tooBig.length ? `Images must be 5 MB or smaller (${tooBig.map((f) => f.name).join(', ')}).` : null)
    const ok = picked.filter((f) => f.size <= 5 * 1024 * 1024).map((file) => ({ url: URL.createObjectURL(file), file }))
    setImages((s) => [...s, ...ok])
  }

  const insert = (snippet: string) => {
    const el = body.current
    if (!el) return
    const at = el.selectionStart ?? text.length
    setText(text.slice(0, at) + snippet + text.slice(at))
    requestAnimationFrame(() => el.focus())
  }

  const canPublish = title.trim().length > 2 && (section !== 'challenges' || (difficulty && game)) && (section !== 'creations' || images.length > 0)

  const publish = async () => {
    if (needsSignIn) return openSignIn()
    setPublishing(true)
    setError(null)
    try {
      const t = title.trim()
      const id =
        section === 'discussions'
          ? await addPost({ kind: 'discussions', title: t, body: text, tags })
          : section === 'creations'
            ? await addPost({ kind: 'creations', title: t, body: text, tags, images: images.map((i) => i.file) })
            : await addPost({ kind: 'challenges', title: t, tags, game, difficulty: difficulty!, rules: text.split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean) })
      navigate(`/community/${section}/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish. Please try again.')
      setPublishing(false)
    }
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
              {needsSignIn ? (
                <PrimaryButton type="button" onClick={openSignIn} className="shrink-0 whitespace-nowrap">
                  <span className="max-md:hidden">Sign in to publish</span>
                  <span className="md:hidden">Sign in</span>
                </PrimaryButton>
              ) : (
                <PrimaryButton type="button" onClick={publish} disabled={!canPublish || publishing} className="shrink-0 whitespace-nowrap">
                  {publishing ? 'Publishing…' : 'Publish'}
                </PrimaryButton>
              )}
            </>
          ) : (
            <PrimaryButton type="button" onClick={() => setPreview(true)} disabled={!title.trim()}>
              Preview
            </PrimaryButton>
          )}
        </div>

        {!preview && (
          // Create toolbar (Figma 319:5195).
          <div className="relative flex items-center justify-between rounded-[8px] bg-neutral-800 px-2 py-1 shadow-[0_0_8px_black,0_0_4px_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]">
            <span className="flex flex-1 items-center gap-1 overflow-clip rounded-[4px] p-1 text-[12px] text-white">
              <img src="/assets/community/toolbar/text.svg" alt="" width={16} height={16} /> Title text
            </span>
            <span aria-hidden className="flex h-[33px] w-0 shrink-0 items-center justify-center">
              <img src="/assets/community/toolbar/divider.svg" alt="" width={33} height={1} className="max-w-none rotate-90" />
            </span>
            <span className="flex flex-1 items-center justify-end gap-1">
              {TOOLS.map((t) => (
                <button key={t.label} type="button" onClick={() => insert(t.insert)} className="flex items-center gap-2 overflow-clip rounded-[4px] p-1 text-[12px] text-neutral-50 hover:bg-neutral-700">
                  <img src={t.icon} alt="" width={16} height={16} /> {t.label}
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
                {images.map((img) => (
                  <span key={img.url} className="relative">
                    <img src={img.url} alt="" className="size-20 rounded object-cover" />
                    {!preview && (
                      <button
                        type="button"
                        aria-label={`Remove ${img.file.name}`}
                        onClick={() => setImages((s) => s.filter((x) => x !== img))}
                        className="absolute -right-1.5 -top-1.5 size-5 rounded-full bg-black text-[12px] leading-none hover:bg-primary-500"
                      >
                        ×
                      </button>
                    )}
                  </span>
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
        {error && (
          <p role="alert" className="text-[14px] font-bold text-primary-500">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
