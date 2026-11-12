import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Revive<span className="text-accent">Mode</span>
          </Link>
          <nav className="text-sm text-muted">Prototype</nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
