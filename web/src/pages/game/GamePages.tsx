import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import EmulatorFrame from '../../components/EmulatorFrame'
import type { MockGame } from '../../data/games'
import { useGame as useCatalogGame } from '../../lib/catalog'
import { library } from '../../lib/libraryStore'
import { getLocalRom, romUrl, setLocalRom } from '../../lib/localRom'
import ComingSoon from '../ComingSoon'
import ControlTable from './ControlTable'
import Discussion from './Discussion'
import GameInfoBlock from './GameInfoBlock'
import { useAuth } from '../../lib/auth'
import { loadFrameState, loadSlot, saveSlot } from '../../lib/cloudSaves'
import { hasBackend } from '../../lib/supabase'
import RoomPanel from './RoomPanel'
import StartChooser from './StartChooser'
import { systemForPlatform } from './platformCore'

function TopBar({ game }: { game: MockGame }) {
  const navigate = useNavigate()
  const back = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/'))
  return (
    <div className="flex h-[88px] items-center justify-between pt-4">
      <button type="button" onClick={back} className="flex items-center gap-2 font-pixel text-[24px] tracking-[1.2px] hover:text-secondary-400">
        <img src="/assets/game/back.png" alt="" className="size-5" /> BACK
      </button>
      {game.platform === 'NES' ? (
        <img src="/assets/game/logo-nes.png" alt="Nintendo Entertainment System" className="h-10 w-[271px] object-contain brightness-0 invert max-md:w-[160px]" />
      ) : (
        <span className="font-pixel text-[28px] uppercase tracking-[2px]">{game.platform}</span>
      )}
    </div>
  )
}

function useGame() {
  const { id = '' } = useParams()
  return useCatalogGame(id)
}

// Blurred cover behind the info block (design: bg-thumbnail).
function Backdrop({ game }: { game: MockGame }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <img src={game.cover} alt="" className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-[60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#262626]/40 to-[#262626]" />
    </div>
  )
}

export function GameDetails() {
  const game = useGame()
  if (!game) return <ComingSoon />
  return (
    <div className="bg-[#262626]">
      <div className="relative">
        <Backdrop game={game} />
        <div className="relative mx-auto max-w-[1024px] px-4 pb-10 lg:px-0">
          <TopBar game={game} />
          <GameInfoBlock game={game} />
        </div>
      </div>
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <Discussion game={game} />
      </div>
    </div>
  )
}

type Source = { url: string; name: string } | null

export function GamePlayer() {
  const game = useGame()
  const [params] = useSearchParams()
  const shell = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<Source>(null)
  // "Start game" choices: new game, continue from a cloud slot, or load your copy.
  const [chooser, setChooser] = useState(params.get('byor') === '1')
  const [focus, setFocus] = useState(false)
  const [rooms, setRooms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const { session } = useAuth()
  const cloud = hasBackend && !!session
  // Cloud slot the emulator's Save/Load State buttons use, and one to load once the game boots.
  const slot = useRef(0)
  const pendingLoad = useRef<number | null>(null)
  const gameId = game?.id

  useEffect(() => {
    if (!focus) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFocus(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus])

  // Messages from public/player.html: game booted, or Save/Load State pressed.
  useEffect(() => {
    if (!gameId) return
    const notice = (text: string, isError = false) => frame.current?.contentWindow?.postMessage({ type: 'revivemode:notice', text, error: isError }, location.origin)
    const fail = (e: unknown) => notice(e instanceof Error ? e.message : 'Something went wrong.', true)
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== location.origin || !frame.current || e.source !== frame.current.contentWindow) return
      const type = e.data?.type
      if (type === 'revivemode:started' && pendingLoad.current !== null) {
        const s = pendingLoad.current
        pendingLoad.current = null
        try {
          await loadFrameState(frame.current, await loadSlot(gameId, s))
          notice(`Continued from cloud slot ${s + 1}`)
        } catch (err) {
          fail(err)
        }
      } else if (type === 'revivemode:cloudSave' && e.data.state instanceof Uint8Array) {
        notice('Saving to the cloud…')
        try {
          await saveSlot(gameId, slot.current, e.data.state)
          notice(`Saved to cloud slot ${slot.current + 1}`)
        } catch (err) {
          fail(err)
        }
      } else if (type === 'revivemode:cloudLoad') {
        try {
          await loadFrameState(frame.current, await loadSlot(gameId, slot.current))
          notice(`Loaded cloud slot ${slot.current + 1}`)
        } catch {
          notice(`No cloud save in slot ${slot.current + 1} yet.`, true)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [gameId])

  if (!game) return <ComingSoon />
  const system = systemForPlatform(game.platform, game.id)
  const local = getLocalRom()
  const localMatch = local && system && local.system.id === system.id ? local : null

  const play = () => {
    library.setLastPlayed(game.id)
    setChooser(false)
    if (game.file) return setSource({ url: game.file, name: game.title })
    if (localMatch) return setSource({ url: romUrl(localMatch), name: localMatch.name })
  }

  const onFile = (file?: File) => {
    if (!file || !system) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!system.extensions.includes(ext)) {
      setError(`That doesn't look like a ${game.platform} ROM (.${system.extensions.join(', .')}).`)
      return
    }
    setError(null)
    const rom = setLocalRom(file, system)
    library.setLastPlayed(game.id)
    setChooser(false)
    setSource({ url: romUrl(rom), name: rom.name })
  }

  const fullscreen = () => {
    const el = shell.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.().catch(() => {})
  }

  const toolbarBtn = 'flex flex-1 items-center justify-center gap-2.5 bg-neutral-800 px-6 py-3 font-pixel text-[24px] tracking-[1.2px] hover:bg-neutral-600 max-md:px-2 max-md:text-[16px]'

  return (
    <div className="bg-[#262626]">
      {focus && <div className="fixed inset-0 z-40 bg-black/90" onClick={() => setFocus(false)} />}
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <TopBar game={game} />
      </div>
      <div className="mx-auto flex max-w-[1280px] items-start justify-center gap-0 p-6 max-lg:flex-col max-lg:items-stretch max-md:p-4">
        <div ref={shell} className={`relative flex w-[913px] max-w-full flex-col rounded-t-2xl bg-[#1d1d1d] ${focus ? 'z-50' : ''}`}>
          <div className="relative flex aspect-[913/577] w-full items-center justify-center overflow-hidden rounded-t-2xl [:fullscreen_&]:aspect-auto [:fullscreen_&]:flex-1">
            {source ? (
              <EmulatorFrame
                core={system?.core ?? 'nes'}
                gameUrl={source.url}
                gameName={source.name}
                // Achievements only for our hosted file: a user's own ROM may be a different version.
                gameId={source.url === game.file ? game.id : undefined}
                frameRef={frame}
                cloud={cloud}
                bare
              />
            ) : (
              <>
                <img src={game.id === 'super-mario-bros' ? '/assets/game/player-thumb.png' : game.cover} alt="" className="absolute inset-0 size-full object-contain" />
                <div className="absolute inset-0 bg-black/30" />
                {system && <input ref={fileInput} type="file" accept={system.extensions.map((e) => `.${e}`).join(',')} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />}
                {chooser ? (
                  system ? (
                    <div className="relative flex w-full flex-col items-center gap-2">
                      <StartChooser
                        gameId={game.id}
                        hosted={!!game.file}
                        localRom={localMatch?.name ?? null}
                        hint={system.hint}
                        onNew={(s) => {
                          slot.current = s
                          pendingLoad.current = null
                          play()
                        }}
                        onContinue={(s) => {
                          slot.current = s
                          pendingLoad.current = s
                          play()
                        }}
                        onLoadCopy={(s, cont) => {
                          slot.current = s
                          pendingLoad.current = cont ? s : null
                          fileInput.current?.click()
                        }}
                        onClose={() => setChooser(false)}
                      />
                      {error && <p className="rounded bg-black/80 px-3 py-1 text-[14px] text-red-400">{error}</p>}
                    </div>
                  ) : (
                    <div className="relative flex max-w-[460px] flex-col items-center gap-4 rounded-xl bg-black/80 p-6 text-center">
                      <p className="font-pixel text-[28px]">NOT PLAYABLE YET</p>
                      <p className="text-[15px] text-neutral-50">{game.platform} support is on the roadmap.</p>
                    </div>
                  )
                ) : (
                  <button type="button" onClick={() => setChooser(true)} className="relative flex flex-col items-center gap-2.5 transition hover:scale-105">
                    <img src="/assets/game/play-big.png" alt="" className="pixelated size-[167px] max-md:size-24" />
                    <span className="font-pixel text-[48px] uppercase tracking-[2.4px] [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] max-md:text-[28px]">Start game</span>
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-0.5 overflow-hidden rounded-b-2xl">
            <button type="button" onClick={() => setRooms((r) => !r)} className={toolbarBtn} aria-expanded={rooms}>
              <img src="/assets/game/users.png" alt="" className="pixelated size-6" /> CONNECT TO ROOM
            </button>
            <button type="button" onClick={() => setFocus((f) => !f)} className={toolbarBtn} aria-pressed={focus}>
              <img src="/assets/game/focus.png" alt="" className="pixelated size-6" /> {focus ? 'EXIT FOCUS' : 'FOCUS MODE'}
            </button>
            <button type="button" onClick={fullscreen} className={toolbarBtn}>
              <img src="/assets/game/maximize.png" alt="" className="pixelated size-6" /> FULL SCREEN
            </button>
          </div>
          {rooms && (
            <div className="absolute left-4 top-4 z-10">
              <RoomPanel onClose={() => setRooms(false)} />
            </div>
          )}
        </div>
        <ControlTable controller={game.platform === 'NES' ? '/assets/game/controller-nes.png' : undefined} />
      </div>
      <div className="relative">
        <Backdrop game={game} />
        <div className="relative mx-auto max-w-[1024px] px-4 py-10 lg:px-0">
          <GameInfoBlock game={game} showPlay={false} />
        </div>
      </div>
      <div className="mx-auto max-w-[1024px] px-4 lg:px-0">
        <Discussion game={game} />
      </div>
    </div>
  )
}
