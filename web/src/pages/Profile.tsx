import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SortButton } from '../components/FilterBar'
import { usePosts } from '../data/community'
import type { SortKey } from '../lib/gameFilter'
import { DEFAULT_SETTINGS, resetSettings, updateSettings, useSettings, type Settings } from '../lib/settingsStore'
import { ContinuePlaying } from './Library'

const STATS = [
  ['15', 'Level'],
  ['42', 'Games Played'],
  ['12', 'Achievements Unlocked'],
  ['23', 'Friends'],
  ['128h', 'Hours Played'],
  ['9', 'Challenges completed'],
]

// Seed activity from the design; the user's own community posts are prepended.
const ACTIVITY = [
  { title: 'Best SNES sound track of all time?', likes: 88, replies: 54, views: 160, tags: ['music', 'SNES'], ago: '2h ago' },
  { title: 'What’s your first ever console?', likes: 147, replies: 102, views: 304, tags: ['gerneral', 'console'], ago: '6h ago' },
  { title: 'Can’t save progress on RetroArch', likes: 5, replies: 12, views: 10, tags: ['support', 'retroarch'], ago: '1d ago' },
]
const ACTIVITY_TABS = [
  ['discussions', 'Discussions', 5],
  ['challenges', 'Challenges', 8],
  ['creations', 'Creations', 7],
  ['achievements', 'Achievements', 12],
] as const
const SETTINGS_TABS = ['Account Settings', 'Emulator Settings', 'Theme Preferences', 'Notification', 'Accessibility', 'Data Management'] as const
type Tab = (typeof ACTIVITY_TABS)[number][0] | (typeof SETTINGS_TABS)[number]

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative flex h-7 w-[60px] shrink-0 items-center rounded-full border-2 px-1 font-pixel text-[14px] transition ${
        on ? 'justify-start border-secondary-500 bg-secondary-500 text-black' : 'justify-end border-primary-500 bg-[#2a2a2a] text-primary-500'
      }`}
    >
      <span className={on ? 'pl-1.5' : 'pr-1.5'}>{on ? 'ON' : 'OFF'}</span>
      <span className={`absolute top-0.5 size-5 rounded-full ${on ? 'right-0.5 bg-white' : 'left-0.5 bg-primary-500'}`} />
    </button>
  )
}

function Select<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-lg border border-[#989898] bg-neutral-800 px-3 py-2 text-[14px] font-bold focus:border-secondary-500 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-neutral-700 px-4 py-3">
      <div>
        <p className="text-[16px] font-bold">{title}</p>
        {desc && <p className="text-[13px] text-neutral-50">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl bg-[#2e2e2e] p-4">
      <h3 className="mb-1 text-[20px] font-bold">{title}</h3>
      {children}
    </section>
  )
}

const KEYMAP: [string, string][] = [
  ['D-pad up', 'up'],
  ['D-pad down', 'down'],
  ['D-pad left', 'left'],
  ['D-pad right', 'right'],
  ['A', 'X'],
  ['B', 'Z'],
  ['SELECT', 'SHIFT'],
  ['START', 'ENTER'],
]

function EmulatorSettings({ s, set, q }: { s: Settings; set: (p: Partial<Settings>) => void; q: string }) {
  const show = (t: string) => !q || t.toLowerCase().includes(q.toLowerCase())
  return (
    <div className="flex flex-col gap-6">
      <Group title="General">
        {show('Autosave State') && (
          <Row title="Autosave State" desc="Automatically save game progress every few minutes or on exit">
            <Toggle label="Autosave State" on={s.autosave} onChange={(autosave) => set({ autosave })} />
          </Row>
        )}
        {show('Auto-load Last Save') && (
          <Row title="Auto-load Last Save" desc="Resume the last session automatically when reopening a game">
            <Toggle label="Auto-load Last Save" on={s.autoload} onChange={(autoload) => set({ autoload })} />
          </Row>
        )}
        {show('Pause on Tab Switch') && (
          <Row title="Pause on Tab Switch" desc="Automatically pauses when user switches browser tabs.">
            <Toggle label="Pause on Tab Switch" on={s.pauseOnBlur} onChange={(pauseOnBlur) => set({ pauseOnBlur })} />
          </Row>
        )}
        {show('Frame Skip') && (
          <Row title="Frame Skip" desc="Skip frames to improve performance on slower devices">
            <Select label="Frame Skip" value={s.frameSkip} options={['Auto', 'Off', '1', '2'] as const} onChange={(frameSkip) => set({ frameSkip })} />
          </Row>
        )}
        {show('Cloud Sync') && (
          <Row title="Cloud Sync" desc="Upload saves to the user’s profile (requires login)">
            <Toggle label="Cloud Sync" on={s.cloudSync} onChange={(cloudSync) => set({ cloudSync })} />
          </Row>
        )}
      </Group>
      {show('Input controller console preset keyboard') && (
        <Group title="Input">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-neutral-700 p-4 text-center">
            <div className="relative h-[100px] w-[185px] overflow-hidden">
              <img src="/assets/game/controller-nes.png" alt="" className="absolute left-0 top-[-55.67%] h-[212.77%] w-full max-w-none" />
            </div>
            <p className="max-w-[420px] text-[13px] text-neutral-50">Select your console and customize your controls. Default presets are provided for each emulator.</p>
            <label className="flex items-center gap-3 text-[16px] font-bold">
              Select your console
              <Select label="Console" value={s.console} options={['NES', 'SNES', 'Sega Genesis', 'Game Boy'] as const} onChange={(console) => set({ console, preset: `Default ${console} Layout` })} />
            </label>
          </div>
          <Row title="Current Preset">
            <span className="rounded-lg border border-[#989898] px-3 py-2 text-[14px] font-bold">{s.preset}</span>
          </Row>
          <table className="w-full overflow-hidden rounded-lg bg-neutral-800 text-[14px] font-bold">
            <thead>
              <tr className="bg-neutral-700 text-secondary-500">
                <th className="p-3 text-left">Actions</th>
                <th className="p-3 text-right">Keyboard</th>
              </tr>
            </thead>
            <tbody>
              {KEYMAP.map(([a, k]) => (
                <tr key={a} className="border-t border-neutral-700">
                  <td className="px-3 py-2">{a}</td>
                  <td className="px-3 py-2 text-right">{k}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Row title="Controller Support" desc="Detects and maps external gamepads">
            <Toggle label="Controller Support" on={s.controllerSupport} onChange={(controllerSupport) => set({ controllerSupport })} />
          </Row>
          <Row title="Vibration Feedback (if supported)">
            <Toggle label="Vibration Feedback" on={s.vibration} onChange={(vibration) => set({ vibration })} />
          </Row>
        </Group>
      )}
      <Group title="Video">
        {show('Resolution Scaling') && (
          <Row title="Resolution Scaling" desc="Renders game pixels at 1x-4x original size">
            <Select label="Resolution Scaling" value={s.scale} options={['1x', '2x', '3x', '4x'] as const} onChange={(scale) => set({ scale })} />
          </Row>
        )}
        {show('Aspect Ratio') && (
          <Row title="Aspect Ratio">
            <Select label="Aspect Ratio" value={s.aspect} options={['Original', '4:3', '16:9', 'Stretch'] as const} onChange={(aspect) => set({ aspect })} />
          </Row>
        )}
        {show('VSync') && (
          <Row title="VSync" desc="Sync frame rate with display refresh rate to reduce tearing">
            <Toggle label="VSync" on={s.vsync} onChange={(vsync) => set({ vsync })} />
          </Row>
        )}
        {show('Pixel Smoothing') && (
          <Row title="Pixel Smoothing" desc="Soften pixel edges for modern screens">
            <Toggle label="Pixel Smoothing" on={s.smoothing} onChange={(smoothing) => set({ smoothing })} />
          </Row>
        )}
      </Group>
      <button type="button" onClick={resetSettings} className="self-start text-[20px] font-bold text-primary-500 hover:underline">
        Reset to Defaults
      </button>
    </div>
  )
}

function OtherSettings({ tab, s, set }: { tab: Tab; s: Settings; set: (p: Partial<Settings>) => void }) {
  if (tab === 'Account Settings')
    return (
      <Group title="Account">
        <Row title="Display name">
          <input value={s.displayName} onChange={(e) => set({ displayName: e.target.value })} aria-label="Display name" className="w-48 rounded-lg border border-[#989898] bg-neutral-800 px-3 py-2 text-[14px] focus:border-secondary-500 focus:outline-none" />
        </Row>
        <Row title="Email" desc="Sign-in arrives with accounts (backend).">
          <input type="email" value={s.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" aria-label="Email" className="w-48 rounded-lg border border-[#989898] bg-neutral-800 px-3 py-2 text-[14px] focus:border-secondary-500 focus:outline-none" />
        </Row>
      </Group>
    )
  if (tab === 'Theme Preferences')
    return (
      <Group title="Theme">
        <Row title="Theme">
          <Select label="Theme" value={s.theme} options={['Dark', 'Darker', 'High contrast'] as const} onChange={(theme) => set({ theme })} />
        </Row>
      </Group>
    )
  if (tab === 'Notification')
    return (
      <Group title="Notifications">
        <Row title="Replies to my posts">
          <Toggle label="Replies to my posts" on={s.notifyReplies} onChange={(notifyReplies) => set({ notifyReplies })} />
        </Row>
        <Row title="New challenges">
          <Toggle label="New challenges" on={s.notifyChallenges} onChange={(notifyChallenges) => set({ notifyChallenges })} />
        </Row>
      </Group>
    )
  if (tab === 'Accessibility')
    return (
      <Group title="Accessibility">
        <Row title="Reduce motion" desc="Turn off decorative animations">
          <Toggle label="Reduce motion" on={s.reduceMotion} onChange={(reduceMotion) => set({ reduceMotion })} />
        </Row>
        <Row title="Larger text">
          <Toggle label="Larger text" on={s.largeText} onChange={(largeText) => set({ largeText })} />
        </Row>
      </Group>
    )
  return (
    <Group title="Data Management">
      <Row title="Local data" desc="Library, settings and drafts stored in this browser">
        <button
          type="button"
          onClick={() => {
            if (!confirm('Clear all Revive Mode data stored in this browser?')) return
            Object.keys(localStorage)
              .filter((k) => k.startsWith('revivemode.'))
              .forEach((k) => localStorage.removeItem(k))
            location.reload()
          }}
          className="rounded-lg border border-primary-500 px-3 py-2 text-[14px] font-bold text-primary-500 hover:bg-primary-500/10"
        >
          Clear data
        </button>
      </Row>
    </Group>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const s = useSettings()
  const posts = usePosts()
  const [tab, setTab] = useState<Tab>('discussions')
  const [sort, setSort] = useState<SortKey>('newest')
  const [q, setQ] = useState('')
  const isSettings = (SETTINGS_TABS as readonly string[]).includes(tab)

  const activity = useMemo(() => {
    const mine = posts
      .filter((p) => p.mine && p.kind === tab)
      .map((p) => ({ title: p.title, likes: 0, replies: p.replies.length, views: 0, tags: p.tags, ago: 'just now', href: `/community/${p.kind}/${p.id}` }))
    const seed = tab === 'discussions' ? ACTIVITY.map((a) => ({ ...a, href: '/community/discussions' })) : []
    const list = [...mine, ...seed]
    return sort === 'az' ? [...list].sort((a, b) => a.title.localeCompare(b.title)) : sort === 'oldest' ? [...list].reverse() : list
  }, [posts, tab, sort])

  const menuItem = (id: Tab, label: string, count?: number) => (
    <button
      key={id}
      type="button"
      aria-current={tab === id ? 'page' : undefined}
      onClick={() => {
        setTab(id)
        setQ('')
      }}
      className={`flex w-full items-center justify-between px-4 py-3 text-left text-[18px] font-bold ${tab === id ? 'text-secondary-400' : 'hover:text-secondary-400'}`}
    >
      <span>
        {tab === id ? '› ' : ''}
        {label}
      </span>
      {count !== undefined && <span>{count}</span>}
    </button>
  )

  return (
    <div className="bg-[#262626] bg-[radial-gradient(#353535_1px,transparent_1px)] [background-size:12px_12px]">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-6 px-4 py-8 lg:px-0">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/'))} className="flex items-center gap-2 font-pixel text-[28px] tracking-[1.4px] hover:text-secondary-400">
            <img src="/assets/game/back.png" alt="" className="size-5" /> BACK
          </button>
          <ContinuePlaying />
        </div>

        <section className="relative overflow-hidden rounded-xl border border-neutral-700 bg-[#1d1d1d] p-8 max-md:p-4">
          <img src="/assets/profile/banner.webp" alt="" className="pixelated absolute inset-x-0 top-[40%] h-[45%] w-full object-cover object-left opacity-90" />
          <div className="relative flex items-center gap-6 max-lg:flex-col max-lg:items-start">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img src="/assets/profile/avatar.png" alt="" className="size-[140px] rounded-xl border-[6px] border-neutral-700 object-cover max-md:size-[110px]" />
              </div>
              <div className="pb-2">
                <h1 className="text-[40px] font-bold leading-none">{s.displayName}</h1>
                <p className="mt-2 text-[14px] font-bold text-neutral-50">joined Nov 2023</p>
              </div>
            </div>
            <div className="flex-1" />
            <div className="w-[364px] max-w-full rounded-xl bg-neutral-700/95 p-5">
              <h2 className="mb-3 text-[18px] font-bold text-secondary-400">Quick Stats</h2>
              <dl className="grid grid-cols-[auto_auto_1fr] gap-x-6 gap-y-4">
                {STATS.map(([n, l]) => (
                  <div key={l}>
                    <dt className="text-[14px] font-bold">{n}</dt>
                    <dd className="text-[12px] text-neutral-50">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab('Account Settings')}
            className="relative mt-[-20px] ml-[150px] rounded-full bg-[radial-gradient(ellipse_at_50%_100%,#fe8462,#e53201)] px-5 py-2 text-[18px] font-bold shadow-[0_0_8px_black] hover:brightness-110 max-lg:mt-4 max-lg:ml-0"
          >
            Edit profile
          </button>
        </section>

        <section className="flex overflow-hidden rounded-xl bg-[#2e2e2e] max-md:flex-col">
          <nav className="w-[308px] shrink-0 bg-neutral-800 max-md:w-full">
            <h2 className="bg-gradient-to-r from-secondary-500 to-secondary-400 px-6 py-6 text-[32px] font-bold text-black">My Activity</h2>
            <div className="py-2">{ACTIVITY_TABS.map(([id, label, n]) => menuItem(id, label, id === 'discussions' ? n + posts.filter((p) => p.mine && p.kind === 'discussions').length : n))}</div>
            <h2 className="border-t border-neutral-600 px-4 pb-1 pt-4 text-[20px] font-bold">Settings</h2>
            <div className="pb-4">{SETTINGS_TABS.map((t) => menuItem(t, t))}</div>
          </nav>
          <div className="min-w-0 flex-1 p-4">
            {isSettings ? (
              <div className="flex flex-col gap-4">
                {tab === 'Emulator Settings' && (
                  <label className="flex w-[300px] max-w-full items-center gap-2.5 rounded-lg border border-[#989898] px-3 py-2">
                    <img src="/assets/ui/search.png" alt="" className="size-5" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your settings" className="min-w-0 flex-1 bg-transparent text-[14px] font-bold placeholder:text-white focus:outline-none" />
                  </label>
                )}
                {tab === 'Emulator Settings' ? <EmulatorSettings s={s} set={updateSettings} q={q} /> : <OtherSettings tab={tab} s={s} set={updateSettings} />}
                {JSON.stringify(s) !== JSON.stringify(DEFAULT_SETTINGS) && <p className="text-[12px] text-neutral-400">Saved on this device.</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SortButton sort={sort} onChange={setSort} />
                  <Link to="/search" aria-label="Search" className="rounded-lg bg-neutral-50 p-2">
                    <img src="/assets/ui/search.png" alt="" className="size-5" />
                  </Link>
                </div>
                {activity.length ? (
                  <ul className="flex flex-col gap-3">
                    {activity.map((a) => (
                      <li key={a.title}>
                        <Link to={a.href} className="block rounded-lg bg-neutral-700 p-3 hover:bg-neutral-600">
                          <div className="flex justify-between gap-3">
                            <h3 className="text-[16px] font-bold">{a.title}</h3>
                            <span className="flex shrink-0 gap-3 text-[12px] text-neutral-50">
                              <span className="flex items-center gap-1">
                                <img src="/assets/community/ic-thumbs-up.svg" alt="" className="size-3.5" />
                                {a.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <img src="/assets/community/ic-chat.svg" alt="" className="size-3.5" />
                                {a.replies}
                              </span>
                              <span className="flex items-center gap-1">
                                <img src="/assets/profile/ic-eye.svg" alt="" className="size-3.5" />
                                {a.views}
                              </span>
                            </span>
                          </div>
                          <div className="mt-1 flex justify-between text-[12px] text-neutral-50">
                            <span className="flex gap-2">{a.tags.map((t) => `#${t}`).join(' ')}</span>
                            <span>{a.ago}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-10 text-center font-pixel text-[22px] text-neutral-50">
                    No {tab} yet.{' '}
                    {tab !== 'achievements' && (
                      <Link to={`/community/${tab}/new`} className="text-secondary-400 underline">
                        Create one
                      </Link>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
