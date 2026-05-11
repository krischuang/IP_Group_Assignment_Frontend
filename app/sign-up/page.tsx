'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { signUpWithEmail } from '@/actions/auth'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export default function SignUp() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [turnstileToken, setTurnstileToken] = useState('')
    const turnstileRef = useRef<TurnstileInstance>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            setErrorMessage('All fields are required.')
            return
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.')
            return
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.')
            return
        }

        if (!turnstileToken) {
            setErrorMessage('Please complete the security check.')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await signUpWithEmail(
                email.toLowerCase().trim(),
                password,
                fullName.trim(),
                turnstileToken
            )

            if (!result.success) {
                setErrorMessage(result.error || 'Failed to create account.')
                turnstileRef.current?.reset()
                setTurnstileToken('')
            } else {
                setSuccessMessage('Account created! Redirecting to sign in…')
                setTimeout(() => {
                    router.push('/sign-in')
                }, 1500)
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.')
            turnstileRef.current?.reset()
            setTurnstileToken('')
        } finally {
            setIsSubmitting(false)
        }
    }

    const strength = (() => {
        if (!password) return { score: 0, label: '', className: '' }
        let score = 0
        if (password.length >= 6) score++
        if (password.length >= 10) score++
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        const pct = Math.min(100, (score / 5) * 100)
        if (score <= 1) return { score, pct, label: 'Weak', className: 'bg-red-500' }
        if (score <= 3) return { score, pct, label: 'Fair', className: 'bg-amber-500' }
        return { score, pct, label: 'Strong', className: 'bg-emerald-500' }
    })()

    return (
        <div className="relative flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12">
            <div className="absolute inset-0 bg-brand-radial opacity-60 pointer-events-none" aria-hidden="true" />
            <div className="card relative w-full max-w-md p-8 sm:p-10 shadow-elevated">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-glow">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M19 8v6 M22 11h-6" />
                            <circle cx="8.5" cy="7" r="4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
                    <p className="mt-1 text-sm text-ink-500">Join UTSFE to start reading and sharing</p>
                </div>

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
                        <label htmlFor="fullName" className="field-label">Full name</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jane Doe"
                            required
                            autoComplete="name"
                            className="field-input"
                        />
                    </div>

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
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={setPassword}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                        {password && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-300/30">
                                    <div className={`h-full rounded-full transition-all duration-300 ${strength.className}`} style={{ width: `${strength.pct}%` }} />
                                </div>
                                <span className="w-12 text-right text-xs font-semibold text-ink-500">{strength.label}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="field-label">Confirm password</label>
                        <PasswordInput
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Re-enter password"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            error={!!(confirmPassword && password !== confirmPassword)}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="mt-1.5 text-xs text-red-600">Passwords do not match</p>
                        )}
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
                        disabled={isSubmitting || !turnstileToken}
                        className="btn-primary w-full py-3 text-base"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Creating account…
                            </>
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-500">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="font-semibold text-brand-700 hover:text-brand-800">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
