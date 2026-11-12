import { Link, useLocation } from 'react-router-dom'

// Placeholder for routes whose flow hasn't been built yet.
export default function ComingSoon() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-pixel text-[32px] tracking-[2px] text-secondary-400">LOADING LEVEL…</p>
      <p className="font-copy text-neutral-50">{pathname} is coming in a later build.</p>
      <Link to="/" className="font-pixel text-[20px] underline">
        Back home
      </Link>
    </div>
  )
}
