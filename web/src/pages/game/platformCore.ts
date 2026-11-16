import type { Platform } from '../../data/games'
import { systemById, type System } from '../../lib/systems'

// Which EmulatorJS system runs each platform. Neo Geo is not listed yet:
// FinalBurn Neo also needs the neogeo.zip BIOS next to the game file.
const MAP: Partial<Record<Platform, string>> = {
  NES: 'nes',
  SNES: 'snes',
  'Sega Genesis': 'segaMD',
  'Game Boy': 'gb',
  PSX: 'psx',
  Atari: 'atari2600',
  Arcade: 'arcade',
}

// Games whose hardware the mapped core can't run (Soulcalibur arcade is
// Namco System 12, which FinalBurn Neo doesn't emulate).
const UNSUPPORTED = new Set(['soulcalibur'])

export function systemForPlatform(p: Platform, gameId?: string): System | undefined {
  if (gameId && UNSUPPORTED.has(gameId)) return undefined
  const id = MAP[p]
  return id ? systemById(id) : undefined
}
