import { useEffect, useRef, useState } from 'react'
import { closeSignIn, signInWithEmail, signInWithProvider, useAuth, type Provider } from '../lib/auth'

const PROVIDER_LABEL: Record<Provider, string> = { google: 'Google', discord: 'Discord' }

// Sign-in dialog, opened from the navbar or any "sign in to …" prompt.
// Email magic link always works; Google/Discord buttons appear once they
// are enabled in Supabase → Authentication → Providers.
export default function SignInModal() {
  const { modalOpen, providers } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!modalOpen) return
    setStatus('idle')
    setError(null)
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSignIn()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  if (!modalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(e) => e.target === e.currentTarget && closeSignIn()}>
      <div role="dialog" aria-modal="true" aria-labelledby="signin-title" className="w-[400px] max-w-full border-4 border-black bg-white text-black shadow-[8px_8px_0_#000]">
        <div className="flex items-center justify-between border-b-4 border-black py-3 pl-5 pr-3">
          <h2 id="signin-title" className="font-display text-[24px] font-bold uppercase tracking-[1.2px]">
            {status === 'sent' ? 'Check your email' : 'Sign in'}
          </h2>
          <button type="button" onClick={closeSignIn} aria-label="Close" className="px-2 font-pixel text-[28px] leading-none hover:text-primary-500">
            ×
          </button>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col gap-4 px-5 py-5">
            <p className="text-[16px]">
              We sent a sign-in link to <strong className="break-all">{email}</strong>. Open it on this device to continue.
            </p>
            <button type="button" onClick={() => setStatus('idle')} className="self-start font-pixel text-[20px] underline hover:text-primary-500">
              Use a different email
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-5 py-5">
            <p className="text-[15px]">Save your library, settings and posts to your account and pick up on any device.</p>

            {providers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => signInWithProvider(p)}
                className="flex h-[48px] items-center justify-center border-4 border-black bg-neutral-50 font-pixel text-[24px] tracking-[1.2px] hover:bg-secondary-100"
              >
                Continue with {PROVIDER_LABEL[p]}
              </button>
            ))}
            {providers.length > 0 && (
              <div className="flex items-center gap-3 font-pixel text-[18px] text-neutral-500">
                <span className="h-0.5 flex-1 bg-black/20" /> or <span className="h-0.5 flex-1 bg-black/20" />
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setError(null)
                setStatus('sending')
                const err = await signInWithEmail(email.trim().toLowerCase())
                if (err) {
                  setError(err)
                  setStatus('idle')
                } else setStatus('sent')
              }}
              className="flex flex-col"
            >
              <label htmlFor="signin-email" className="sr-only">
                Email
              </label>
              <input
                ref={inputRef}
                id="signin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                className="h-[44px] border-4 border-black px-3 text-center font-display text-[16px] font-medium uppercase tracking-[0.8px] placeholder:text-[#868686] focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="-mt-1 border-4 border-black bg-secondary-500 py-3 font-pixel text-[28px] leading-none tracking-[1.4px] hover:bg-secondary-400 disabled:opacity-60"
              >
                {status === 'sending' ? 'SENDING…' : 'EMAIL ME A LINK'}
              </button>
            </form>
            {error && (
              <p role="alert" className="text-[14px] font-bold text-primary-500">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
