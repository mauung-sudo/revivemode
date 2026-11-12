// Generates public/games/test-pattern.nes — a minimal NES ROM (our own work, CC0)
// that sets the background color to blue. Used to smoke-test the emulator.
// Run: node scripts/make-test-rom.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const header = [0x4e, 0x45, 0x53, 0x1a, 0x01, 0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // iNES, 16K PRG, 8K CHR, mapper 0
const prg = new Uint8Array(0x4000)

// 6502 code at $C000
const code = [
  0x78, 0xd8, 0xa2, 0xff, 0x9a, //       SEI / CLD / LDX #$FF / TXS
  0x2c, 0x02, 0x20, 0x10, 0xfb, // w1:   BIT $2002 / BPL w1   (wait vblank)
  0x2c, 0x02, 0x20, 0x10, 0xfb, // w2:   BIT $2002 / BPL w2
  0xa9, 0x3f, 0x8d, 0x06, 0x20, //       LDA #$3F / STA $2006
  0xa9, 0x00, 0x8d, 0x06, 0x20, //       LDA #$00 / STA $2006 (PPU addr = $3F00)
  0xa9, 0x21, 0x8d, 0x07, 0x20, //       LDA #$21 / STA $2007 (backdrop = light blue)
  0xa9, 0x00, 0x8d, 0x06, 0x20, 0x8d, 0x06, 0x20, // reset PPU addr
  0x8d, 0x05, 0x20, 0x8d, 0x05, 0x20, //            reset scroll
  0xa9, 0x08, 0x8d, 0x01, 0x20, //       LDA #$08 / STA $2001 (show background)
  0x4c, 0x31, 0xc0, //             loop: JMP loop ($C031)
  0x40, //                         nmi:  RTI ($C034)
]
prg.set(code, 0)
prg.set([0x34, 0xc0, 0x00, 0xc0, 0x34, 0xc0], 0x3ffa) // NMI, RESET, IRQ vectors

const chr = new Uint8Array(0x2000)
mkdirSync(new URL('../public/games/', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/games/test-pattern.nes', import.meta.url), Buffer.concat([Buffer.from(header), prg, chr]))
console.log('wrote public/games/test-pattern.nes')
