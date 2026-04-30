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
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="p-6 bg-white rounded-lg shadow text-gray-500">
                        Loading...
                    </div>
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
                setSuccessMessage('Signed in successfully! Redirecting...')
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-6 bg-white rounded-lg shadow text-gray-500">
                    Loading...
                </div>
            </div>
        )
    }

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Welcome back!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        You are signed in as {user.email}
                    </p>
                    {redirectUrl ? (
                        <p className="text-blue-600">
                            Redirecting you to the requested page...
                        </p>
                    ) : (
                        <Link
                            href="/profile"
                            className="inline-block px-6 py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: '#D93C3E' }}
                        >
                            Go to Profile
                        </Link>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
                    Sign In
                </h1>

                {redirectUrl && !errorMessage && !successMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
                        Please sign in to access the requested page.
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D93C3E] focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D93C3E] focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex justify-center">
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
                        className="w-full py-2.5 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                        style={{ backgroundColor: '#D93C3E' }}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/sign-up"
                        className="font-medium hover:underline"
                        style={{ color: '#D93C3E' }}
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    )
}
