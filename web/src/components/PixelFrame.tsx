import type { ReactNode } from 'react'

// The white pixel "[ ]" brackets the design draws around hero and feature panels.
function Bracket({ side, thickness }: { side: 'left' | 'right'; thickness: number }) {
  const t = thickness
  const pos = side === 'left' ? { left: 0 } : { right: 0 }
  const hook = side === 'left' ? { left: t } : { right: t }
  return (
    <span aria-hidden className="pointer-events-none absolute inset-y-0" style={{ ...pos, width: t * 3 }}>
      <span className="absolute bg-white" style={{ ...pos, top: t * 2, bottom: t * 2, width: t }} />
      <span className="absolute bg-white" style={{ ...pos, top: t, height: t, width: t }} />
      <span className="absolute bg-white" style={{ ...hook, top: 0, height: t, width: t * 2 }} />
      <span className="absolute bg-white" style={{ ...pos, bottom: t, height: t, width: t }} />
      <span className="absolute bg-white" style={{ ...hook, bottom: 0, height: t, width: t * 2 }} />
    </span>
  )
}

export default function PixelFrame({
  children,
  className = '',
  thickness = 5,
}: {
  children: ReactNode
  className?: string
  thickness?: number
}) {
  return (
    <div className={`panel-vignette relative ${className}`}>
      <Bracket side="left" thickness={thickness} />
      <Bracket side="right" thickness={thickness} />
      {children}
    </div>
  )
}
