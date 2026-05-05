'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useAuth'
import { updateUser } from '@/hooks/useUser'
import { resetPassword } from '@/actions/password-reset'
import { useRouter } from 'next/navigation'

export default function Profile() {
    const { user, profile, loading, isAdmin, refetchUser } = useUser()
    const router = useRouter()

    const [editing, setEditing] = useState(false)
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [showResetModal, setShowResetModal] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)
    const [resetSaving, setResetSaving] = useState(false)
    const [resetError, setResetError] = useState('')

    useEffect(() => {
        if (!loading && !user) {
            router.push('/sign-in')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '')
            setBio(profile.bio || '')
        }
    }, [profile])

    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(timer)
    }, [toast])

    const handleSave = async () => {
        if (!profile) return
        setSaving(true)
        const result = await updateUser({ full_name: fullName, bio })
        setSaving(false)

        if (result) {
            setToast({ type: 'success', text: 'Profile updated successfully' })
            setEditing(false)
            await refetchUser?.()
        } else {
            setToast({ type: 'error', text: 'Failed to update profile. Please try again.' })
        }
    }

    const handleCancel = () => {
        setFullName(profile?.full_name || '')
        setBio(profile?.bio || '')
        setEditing(false)
    }

    const openResetModal = () => {
        setNewPassword('')
        setConfirmPassword('')
        setResetError('')
        setShowResetModal(true)
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.email || !newPassword || newPassword !== confirmPassword) return
        setResetSaving(true)
        setResetError('')
        const result = await resetPassword(user.email, newPassword)
        setResetSaving(false)
        if (!result.success) {
            setResetError(result.error || 'Reset failed.')
        } else {
            setShowResetModal(false)
            setToast({ type: 'success', text: 'Password reset successfully' })
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-68px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                    <p className="font-medium text-ink-500">Loading your profile…</p>
                </div>
            </div>
        )
    }

    if (!user || !profile) return null

    const initial = profile.full_name
        ? profile.full_name.charAt(0).toUpperCase()
        : user.email?.charAt(0).toUpperCase()

    return (
        <>
        <div className="relative py-10 sm:py-14">
            <div className="absolute inset-x-0 top-0 h-56 bg-brand-gradient" aria-hidden="true" />

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className={`fixed right-4 top-20 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-elevated animate-fade-in ${
                        toast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    )}
                    {toast.text}
                </div>
            )}

            <div className="relative section-shell max-w-3xl">
                <div className="card overflow-hidden shadow-elevated">
                    {/* Header */}
                    <div className="relative px-8 pb-10 pt-12 text-center text-white bg-brand-gradient">
                        <div
                            className="absolute inset-0 opacity-40"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12), transparent 45%)',
                            }}
                            aria-hidden="true"
                        />
                        <div className="relative">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-3xl font-bold backdrop-blur-sm">
                                {initial}
                            </div>
                            <h1 className="mt-5 text-2xl font-bold">
                                {profile.full_name || 'Your Profile'}
                            </h1>
                            <p className="mt-1 text-sm text-white/80">{user.email}</p>
                            <span
                                className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                    isAdmin
                                        ? 'bg-amber-300 text-amber-900'
                                        : 'bg-white/20 text-white border border-white/30 backdrop-blur-sm'
                                }`}
                            >
                                {isAdmin && (
                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                )}
                                {profile.role}
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-5 p-8 sm:p-10">
                        <div>
                            <label className="field-label">Email</label>
                            <p className="rounded-xl border border-ink-300/40 bg-surface-muted px-4 py-3 text-ink-900">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <label className="field-label">Full name</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="field-input"
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p className="rounded-xl border border-ink-300/40 bg-surface-muted px-4 py-3 text-ink-900">
                                    {profile.full_name || <span className="text-ink-500">Not provided</span>}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="field-label">Bio</label>
                            {editing ? (
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="field-input resize-none"
                                    placeholder="Tell us about yourself"
                                />
                            ) : (
                                <p className="min-h-[4rem] whitespace-pre-wrap rounded-xl border border-ink-300/40 bg-surface-muted px-4 py-3 text-ink-900">
                                    {profile.bio || <span className="text-ink-500">No bio yet</span>}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-3">
                            {editing ? (
                                <>
                                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3">
                                        {saving ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Saving…
                                            </>
                                        ) : (
                                            'Save changes'
                                        )}
                                    </button>
                                    <button onClick={handleCancel} className="btn-secondary flex-1 py-3">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditing(true)} className="btn-primary flex-1 py-3">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit profile
                                    </button>
                                    <button onClick={openResetModal} className="btn-secondary flex-1 py-3">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        Reset password
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Reset Password Modal */}
        {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => setShowResetModal(false)}>
                <div className="card w-full max-w-md p-8 shadow-elevated" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-glow">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-ink-900">Reset password</h2>
                        <p className="mt-1 text-sm text-ink-500">Enter and confirm your new password.</p>
                    </div>

                    {resetError && (
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
                            <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{resetError}</span>
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label htmlFor="new-password" className="field-label">New password</label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                    className="field-input pr-11"
                                />
                                <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 hover:bg-ink-300/20 hover:text-ink-700">
                                    {showNewPw
                                        ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.77 21.77 0 015.06-5.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.77 21.77 0 01-3.17 4.4M1 1l22 22" /><path d="M14.12 14.12A3 3 0 019.88 9.88" /></svg>
                                        : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="field-label">Confirm password</label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPw ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                    className={`field-input pr-11 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                                />
                                <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 hover:bg-ink-300/20 hover:text-ink-700">
                                    {showConfirmPw
                                        ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.77 21.77 0 015.06-5.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.77 21.77 0 01-3.17 4.4M1 1l22 22" /><path d="M14.12 14.12A3 3 0 019.88 9.88" /></svg>
                                        : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button type="submit" disabled={resetSaving || !newPassword || newPassword !== confirmPassword} className="btn-primary flex-1 py-3">
                                {resetSaving ? (
                                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Resetting…</>
                                ) : 'Reset password'}
                            </button>
                            <button type="button" onClick={() => setShowResetModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    )
}
