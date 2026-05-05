'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

interface Props {
    onClose: () => void
}

function ModalContent({ onClose }: Props) {
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
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [])

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
        e.stopPropagation()
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
        e.stopPropagation()
        if (otp.length !== 6) return
        setIsSubmitting(true)
        setErrorMessage('')
        try {
            const result = await validateResetToken(email, otp)
            if (!result.success || !result.valid) {
                setErrorMessage(result.error || 'Invalid or expired code.')
                setDigits(['', '', '', '', '', ''])
                setTimeout(() => inputRefs.current[0]?.focus(), 0)
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
        e.stopPropagation()
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
        try { await forgotPassword(email) } catch {}
    }

    const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

    const stepLabels: Record<Step, string> = {
        email: 'Step 1 of 3',
        code: 'Step 2 of 3',
        reset: 'Step 3 of 3',
        done: 'Done',
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" aria-hidden="true" />

            <div className="card relative w-full max-w-md p-8 shadow-elevated animate-fade-in">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-300/20 hover:text-ink-700"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {step !== 'done' && (
                    <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink-500">
                        {stepLabels[step]}
                    </p>
                )}

                {/* ── Step: Email ── */}
                {step === 'email' && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-ink-900">Forgot your password?</h2>
                            <p className="mt-1 text-sm text-ink-500">
                                Enter your email and we&apos;ll send you a 6-digit verification code.
                            </p>
                        </div>

                        {errorMessage && <ErrorBox message={errorMessage} />}

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="fp-email" className="field-label">Email</label>
                                <input
                                    id="fp-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    autoFocus
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
                    </>
                )}

                {/* ── Step: Code ── */}
                {step === 'code' && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-ink-900">Check your email</h2>
                            <p className="mt-1 text-sm text-ink-500">
                                We sent a 6-digit code to{' '}
                                <span className="font-semibold text-ink-700">{email}</span>.
                                Enter it below.
                            </p>
                        </div>

                        {errorMessage && <ErrorBox message={errorMessage} />}

                        <form onSubmit={handleCodeSubmit} className="space-y-5">
                            <div>
                                <label className="field-label mb-3 block text-center">Verification Code</label>
                                <div className="flex justify-center gap-2">
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
                                            autoFocus={i === 0}
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

                        <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
                            <button
                                type="button"
                                onClick={() => { setStep('email'); setErrorMessage(''); setDigits(['', '', '', '', '', '']) }}
                                className="font-semibold text-brand-700 hover:text-brand-800"
                            >
                                ← Change email
                            </button>
                            <button
                                type="button"
                                onClick={handleResend}
                                className="font-semibold text-brand-700 hover:text-brand-800"
                            >
                                Resend code
                            </button>
                        </div>
                    </>
                )}

                {/* ── Step: Reset ── */}
                {step === 'reset' && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-ink-900">Set new password</h2>
                            <p className="mt-1 text-sm text-ink-500">Choose a strong password for your account.</p>
                        </div>

                        {errorMessage && <ErrorBox message={errorMessage} />}

                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="fp-new" className="field-label">New Password</label>
                                <div className="relative">
                                    <input
                                        id="fp-new"
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                        autoFocus
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
                                <label htmlFor="fp-confirm" className="field-label">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        id="fp-confirm"
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
                                disabled={isSubmitting || !newPassword || passwordMismatch || !confirmPassword}
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
                    <div className="py-2 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-ink-900">Password reset!</h2>
                        <p className="mt-2 text-sm text-ink-500">
                            Your password has been updated. You can now sign in with your new password.
                        </p>
                        <button type="button" onClick={onClose} className="btn-primary mt-6">
                            Back to Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ForgotPasswordModal({ onClose }: Props) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return null
    return createPortal(<ModalContent onClose={onClose} />, document.body)
}
