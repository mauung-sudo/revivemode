// Bring-Your-Own-ROM: the file stays in browser memory as a blob URL.
// It is never uploaded anywhere.
import type { System } from './systems'

export interface LocalRom {
  name: string
  url: string
  system: System
}

let current: LocalRom | null = null

export function setLocalRom(file: File, system: System): LocalRom {
  if (current) URL.revokeObjectURL(current.url)
  current = { name: file.name, url: URL.createObjectURL(file), system }
  return current
}

export function getLocalRom(): LocalRom | null {
  return current
}
