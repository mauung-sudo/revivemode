// Bring-Your-Own-ROM: the file stays in browser memory and is never uploaded.
// EmulatorJS revokes a blob: URL once it has read it, so each start gets a
// fresh URL from the kept File (the last one is revoked when replaced).
import type { System } from './systems'

export interface LocalRom {
  name: string
  file: File
  system: System
}

let current: LocalRom | null = null
let lastUrl: string | null = null

export function setLocalRom(file: File, system: System): LocalRom {
  current = { name: file.name, file, system }
  return current
}

export function getLocalRom(): LocalRom | null {
  return current
}

/** A new blob: URL for starting the emulator with this ROM. */
export function romUrl(rom: LocalRom): string {
  if (lastUrl) URL.revokeObjectURL(lastUrl)
  lastUrl = URL.createObjectURL(rom.file)
  return lastUrl
}
