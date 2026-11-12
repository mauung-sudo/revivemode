import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setLocalRom } from '../lib/localRom'
import { ACCEPTED_EXTENSIONS, SYSTEMS, systemForFile } from '../lib/systems'

export default function RomPicker() {
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function load(file: File | undefined) {
    if (!file) return
    const system = systemForFile(file.name)
    if (!system) {
      setError(`Unsupported file type. Supported: ${ACCEPTED_EXTENSIONS}`)
      return
    }
    setError(null)
    setLocalRom(file, system)
    navigate('/play/local')
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        load(e.dataTransfer.files[0])
      }}
      className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
        dragging ? 'border-accent bg-accent/10' : 'border-border bg-surface'
      }`}
    >
      <p className="font-semibold">Play your own game file</p>
      <p className="mt-1 text-sm text-muted">
        Drop a ROM you legally own. It stays on your device and is never uploaded.
      </p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Choose file
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={(e) => load(e.target.files?.[0])}
      />
      <p className="mt-3 text-xs text-muted">{SYSTEMS.map((s) => s.name).join(' · ')}</p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}
