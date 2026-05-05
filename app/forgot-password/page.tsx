'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { forgotPassword, validateResetToken, resetPassword } from '@/actions/password-reset'

type Step = 'email' | 'code' | 'reset' | 'done'

function EyeIcon({ open }: { open: boolean }) {
    if (open) {
        return (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.77 21.77 0 015.06-5.94 M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.77 21.77 0 01-3.17 4.4 M1 1l22 22" />
                <path d="M14.12 14.12A3 3 0 019.88 9.88" />
            </svg>
        )
    }
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
            <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{message}</span>
        </div>
    )
}

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const otp = digits.join('')

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const next = [...digits]
        next[index] = value.slice(-1)
        setDigits(next)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const next = Array(6).fill('')
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
        setDigits(next)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        setIsSubmitting(true)
        setErrorMessage('')
        try {
            const normalized = email.toLowerCase().trim()
            const result = await forgotPassword(normalized)
            if (!result.success) {
                setErrorMessage(result.error || 'Request failed.')
            } else {
                setEmail(normalized)
                setStep('code')
            }
        } catch {
            setErrorMessage('An unexpected error occurred.')
        }
        setIsSubmitting(false)
    }

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length !== 6) return
        setIsSubmitting(true)
        setErrorMessage('')
        try {
            const result = await validateResetToken(email, otp)
            if (!result.success || !result.valid) {
                setErrorMessage(result.error || 'Invalid or expired code.')
                setDigits(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            } else {
                setStep('reset')
            }
        } catch {
            setErrorMessage('An unexpected error occurred.')
        }
        setIsSubmitting(false)
    }

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || newPassword !== confirmPassword) return
        setIsSubmitting(true)
        setErrorMessage('')
        try {
            const result = await resetPassword(email, newPassword)
            if (!result.success) {
                setErrorMessage(result.error || 'Reset failed.')
            } else {
                setStep('done')
            }
        } catch {
            setErrorMessage('An unexpected error occurred.')
        }
        setIsSubmitting(false)
    }

    const handleResend = async () => {
        setErrorMessage('')
        setDigits(['', '', '', '', '', ''])
        try {
            await forgotPassword(email)
        } catch {}
    }

    const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

    return (
        <div className="relative flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12">
            <div className="absolute inset-0 bg-brand-radial opacity-60 pointer-events-none" aria-hidden="true" />
            <div className="card relative w-full max-w-md p-8 sm:p-10 shadow-elevated">

                {/* ── Step: Email ── */}
                {step === 'email' && (
                    <>
                        <div className="mb-7 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-glow">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-ink-900">Forgot your password?</h1>
                            <p className="mt-1 text-sm text-ink-500">Enter your email and we&apos;ll send you a 6-digit code.</p>
                        </div>

                        {errorMessage && <ErrorBox message={errorMessage} />}

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                            <button
                                type="submit"
                                disabled={isSubmitting || !email.trim()}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Sending…
                                    </>
                                ) : 'Send Code'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-ink-500">
                            Remember your password?{' '}
                            <Link href="/sign-in" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
                        </p>
                    </>
                )}

                {/* ── Step: Code ── */}
                {step === 'code' && (
                    <>
                        <div className="mb-7 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-glow">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-ink-900">Check your email</h1>
                            <p className="mt-1 text-sm text-ink-500">
                                We sent a 6-digit code to <span className="font-semibold text-ink-700">{email}</span>
                            </p>
                        </div>

                        {errorMessage && <ErrorBox message={errorMessage} />}

                        <form onSubmit={handleCodeSubmit} className="space-y-5">
                            <div>
                                <label className="field-label mb-3 block text-center">Verification Code</label>
                                <div className="flex justify-center gap-2.5">
                                    {digits.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { inputRefs.current[i] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={d}
                                            onChange={(e) => handleDigitChange(i, e.target.value)}
                                            onKeyDown={(e) => handleDigitKeyDown(i, e)}
                                            onPaste={handleDigitPaste}
                                            className="h-14 w-11 rounded-xl border border-ink-300/70 bg-white text-center text-xl font-bold text-ink-900 shadow-soft transition-all duration-150 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || otp.length !== 6}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Verifying…
                                    </>
                                ) : 'Verify Code'}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-ink-500">
                            Didn&apos;t receive it?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="font-semibold text-brand-700 hover:text-brand-800"
                            >
                                Resend code
                            </button>
                        </p>
                        <p className="mt-2 text-center text-sm text-ink-500">
                            Wrong email?{' '}
                            <button
                                type="button"
                                onClick={() => { setStep('email'); setErrorMessage(''); setDigits(['', '', '', '', '', '']) }}
                                className="font-semibold text-brand-700 hover:text-brand-800"
                            >
                                Go back
                            </button>
                        </p>
                    </>
                )}

                {/* ── Step: Reset ── */}
                {step === 'reset' && (
                    <>
                        <div className="mb-7 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-glow">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-ink-900">Set new password</h1>
                            <p className="mt-1 text-sm text-ink-500">Choose a strong password for your account.</p>
                        </div>

                        {errorMessage && <ErrorBox message={errorMessage} />}

                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="new-password" className="field-label">New Password</label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                        className="field-input pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew((v) => !v)}
                                        aria-label={showNew ? 'Hide password' : 'Show password'}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-300/20 hover:text-ink-700"
                                    >
                                        <EyeIcon open={showNew} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="field-label">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                        className={`field-input pr-11 ${passwordMismatch ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-300/20 hover:text-ink-700"
                                    >
                                        <EyeIcon open={showConfirm} />
                                    </button>
                                </div>
                                {passwordMismatch && (
                                    <p className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !newPassword || passwordMismatch}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Resetting…
                                    </>
                                ) : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {/* ── Step: Done ── */}
                {step === 'done' && (
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-ink-900">Password reset!</h2>
                        <p className="mt-2 text-sm text-ink-500">Your password has been updated. You can now sign in with your new password.</p>
                        <Link href="/sign-in" className="btn-primary mt-6 inline-flex">
                            Go to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
