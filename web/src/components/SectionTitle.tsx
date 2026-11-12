import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function SeeAll({ to }: { to: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded p-2 font-pixel text-[24px] leading-[18px] tracking-[1.2px] hover:text-secondary-400">
      See all
      <img src="/assets/home/arrowhead.png" alt="" className="size-4" />
    </Link>
  )
}

export default function SectionTitle({
  children,
  icon,
  action,
}: {
  children: ReactNode
  icon?: string
  action?: ReactNode
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-6">
      <div className="flex items-center gap-3">
        {icon && <img src={icon} alt="" className="size-8 object-contain md:size-10" />}
        <h2 className="font-display text-[28px] font-bold uppercase tracking-[0.05em] md:text-[48px]">{children}</h2>
      </div>
      {action}
    </div>
  )
}
