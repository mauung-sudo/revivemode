import data from '../data/catalog.json'
import type { SystemId } from './systems'

export interface Game {
  id: string
  title: string
  system: SystemId
  file: string
  year?: number
  author?: string
  license: string // SPDX id or a note of the permission granted — required
  description?: string
  cover?: string
}

export const CATALOG = data as Game[]

export function gameById(id: string): Game | undefined {
  return CATALOG.find((g) => g.id === id)
}
