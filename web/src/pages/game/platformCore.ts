import type { Platform } from '../../data/games'
import { systemById, type System } from '../../lib/systems'

// Which EmulatorJS system runs each platform. Platforms not listed here
// (PSX needs a BIOS, arcade sets need per-game cores) aren't playable yet.
const MAP: Partial<Record<Platform, string>> = {
  NES: 'nes',
  SNES: 'snes',
  'Sega Genesis': 'segaMD',
  'Game Boy': 'gb',
}

export function systemForPlatform(p: Platform): System | undefined {
  const id = MAP[p]
  return id ? systemById(id) : undefined
}
