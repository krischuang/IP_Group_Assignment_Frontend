'use client'

import { useState, useRef, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { signInWithPassword } from '@/actions/auth'
import { useUser } from '@/hooks/useAuth'
import Link from 'next/link'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export default function SignIn() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4">
                    <div className="card p-6 text-ink-500">Loading…</div>
                </div>
            }
        >
            <SignInContent />
        </Suspense>
    )
}

function SignInContent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [turnstileToken, setTurnstileToken] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const turnstileRef = useRef<TurnstileInstance>(null)
    const { user, loading } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect')

    useEffect(() => {
        if (user && !loading) {
            const target = redirectUrl
                ? decodeURIComponent(redirectUrl)
                : '/profile'
            window.location.href = target
        }
    }, [user, loading, redirectUrl])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !password || !turnstileToken) return

        setIsSubmitting(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const result = await signInWithPassword(email.toLowerCase().trim(), password, turnstileToken)

            if (!result.success) {
                setErrorMessage(result.error || 'Invalid email or password.')
                turnstileRef.current?.reset()
                setTurnstileToken('')
                setIsSubmitting(false)
            } else {
                setSuccessMessage('Signed in successfully! Redirecting…')
                const target = redirectUrl
                    ? decodeURIComponent(redirectUrl)
                    : '/profile'
                window.location.href = target
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.')
            turnstileRef.current?.reset()
            setTurnstileToken('')
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4">
                <div className="card p-6 text-ink-500">Loading…</div>
            </div>
        )
    }

    if (user) {
        return (
            <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12">
                <div className="card w-full max-w-md p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-ink-900">Welcome back!</h2>
                    <p className="mt-1 text-ink-500">You are signed in as {user.email}</p>
                    {redirectUrl ? (
                        <p className="mt-4 text-sm font-medium text-brand-700">Redirecting you to the requested page…</p>
                    ) : (
                        <Link href="/profile" className="btn-primary mt-6">Go to Profile</Link>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12">
            <div className="absolute inset-0 bg-brand-radial opacity-60 pointer-events-none" aria-hidden="true" />
            <div className="card relative w-full max-w-md p-8 sm:p-10 shadow-elevated">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-glow">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4 M10 17l5-5-5-5 M15 12H3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
                    <p className="mt-1 text-sm text-ink-500">Sign in to continue to UTSFE</p>
                </div>

                {redirectUrl && !errorMessage && !successMessage && (
                    <div className="mb-4 rounded-xl border border-brand-200/60 bg-brand-50 p-3.5 text-sm text-brand-800">
                        Please sign in to access the requested page.
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
                        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
                        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="field-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            className="field-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="field-label">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="field-input pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-300/20 hover:text-ink-700"
                            >
                                {showPassword ? (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.77 21.77 0 015.06-5.94 M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.77 21.77 0 01-3.17 4.4 M1 1l22 22" />
                                        <path d="M14.12 14.12A3 3 0 019.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center pt-1">
                        <Turnstile
                            ref={turnstileRef}
                            siteKey={TURNSTILE_SITE_KEY}
                            onSuccess={(token) => setTurnstileToken(token)}
                            onExpire={() => setTurnstileToken('')}
                            onError={() => setTurnstileToken('')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !email.trim() || !password || !turnstileToken}
                        className="btn-primary w-full py-3 text-base"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Signing in…
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="font-semibold text-brand-700 hover:text-brand-800">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
