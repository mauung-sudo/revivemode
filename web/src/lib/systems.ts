// Maps systems to EmulatorJS cores. Core list: https://emulatorjs.org/docs/systems
// Core licenses matter if the project is ever monetized (see docs/TECH_STACK.md).
export type SystemId = 'nes' | 'snes' | 'gb' | 'gba' | 'segaMD' | 'psx' | 'atari2600' | 'arcade'

export interface System {
  id: SystemId
  name: string
  core: string // EmulatorJS EJS_core value
  extensions: string[]
  /** Shown when loading your own copy. */
  hint?: string
}

export const SYSTEMS: System[] = [
  { id: 'nes', name: 'NES / Famicom', core: 'nes', extensions: ['nes', 'fds', 'unf', 'unif'] },
  { id: 'snes', name: 'Super Nintendo', core: 'snes', extensions: ['sfc', 'smc'] },
  { id: 'gb', name: 'Game Boy / Color', core: 'gb', extensions: ['gb', 'gbc', 'dmg'] },
  { id: 'gba', name: 'Game Boy Advance', core: 'gba', extensions: ['gba'] },
  { id: 'segaMD', name: 'Sega Genesis / Mega Drive', core: 'segaMD', extensions: ['md', 'gen', 'smd', 'bin'] },
  { id: 'psx', name: 'PlayStation', core: 'psx', extensions: ['chd', 'pbp', 'iso', 'bin', 'img'], hint: 'Use a single-file .chd or .pbp image (a .cue needs its .bin files too).' },
  { id: 'atari2600', name: 'Atari 2600', core: 'atari2600', extensions: ['a26', 'bin'] },
  { id: 'arcade', name: 'Arcade (FinalBurn Neo)', core: 'arcade', extensions: ['zip'], hint: 'Use the FinalBurn Neo romset .zip, unrenamed (e.g. sfa.zip).' },
]

export const ACCEPTED_EXTENSIONS = SYSTEMS.flatMap((s) => s.extensions.map((e) => `.${e}`)).join(',')

export function systemById(id: string): System | undefined {
  return SYSTEMS.find((s) => s.id === id)
}

export function systemForFile(fileName: string): System | undefined {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return SYSTEMS.find((s) => s.extensions.includes(ext))
}
