// Maps systems to EmulatorJS cores. Core list: https://emulatorjs.org/docs/systems
// Core licenses matter if the project is ever monetized (see docs/TECH_STACK.md).
export type SystemId = 'nes' | 'snes' | 'gb' | 'gba' | 'segaMD'

export interface System {
  id: SystemId
  name: string
  core: string // EmulatorJS EJS_core value
  extensions: string[]
}

export const SYSTEMS: System[] = [
  { id: 'nes', name: 'NES / Famicom', core: 'nes', extensions: ['nes', 'fds', 'unf', 'unif'] },
  { id: 'snes', name: 'Super Nintendo', core: 'snes', extensions: ['sfc', 'smc'] },
  { id: 'gb', name: 'Game Boy / Color', core: 'gb', extensions: ['gb', 'gbc', 'dmg'] },
  { id: 'gba', name: 'Game Boy Advance', core: 'gba', extensions: ['gba'] },
  { id: 'segaMD', name: 'Sega Genesis / Mega Drive', core: 'segaMD', extensions: ['md', 'gen', 'smd', 'bin'] },
]

export const ACCEPTED_EXTENSIONS = SYSTEMS.flatMap((s) => s.extensions.map((e) => `.${e}`)).join(',')

export function systemById(id: string): System | undefined {
  return SYSTEMS.find((s) => s.id === id)
}

export function systemForFile(fileName: string): System | undefined {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return SYSTEMS.find((s) => s.extensions.includes(ext))
}
