'use client'

import { useUser } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    totalUsers: number
}

export default function AdminDashboard() {
    const { user, profile, loading, isAdmin } = useUser()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats>({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalUsers: 0,
    })
    const [statsLoading, setStatsLoading] = useState(true)

    useEffect(() => {
        if (!loading && !user) { router.push('/sign-in'); return }
        if (!loading && user && !isAdmin) { router.push('/'); return }
    }, [user, loading, isAdmin, router])

    useEffect(() => {
        if (!user || !isAdmin) return

        const fetchStats = async () => {
            setStatsLoading(true)
            try {
                const [allRes, publishedRes, usersRes] = await Promise.all([
                    fetch('/api/articles').then((r) => r.json()),
                    fetch('/api/articles?published=true').then((r) => r.json()),
                    fetch('/api/admin/users').then((r) => r.json()),
                ])

                const all: any[] = Array.isArray(allRes) ? allRes : []
                const published: any[] = Array.isArray(publishedRes) ? publishedRes : []
                const users: any[] = Array.isArray(usersRes) ? usersRes : []

                setStats({
                    totalArticles: all.length,
                    publishedArticles: published.length,
                    draftArticles: all.length - published.length,
                    totalUsers: users.length,
                })
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err)
            } finally {
                setStatsLoading(false)
            }
        }

        fetchStats()
    }, [user, isAdmin])

    if (loading || !user || !isAdmin) {
        return (
            <div className="flex min-h-[calc(100vh-68px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                    <p className="font-medium text-ink-500">Loading admin panel…</p>
                </div>
            </div>
        )
    }

    const statCards = [
        {
            label: 'Total articles',
            value: stats.totalArticles,
            tone: 'brand',
            icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
        },
        {
            label: 'Published',
            value: stats.publishedArticles,
            tone: 'emerald',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Drafts',
            value: stats.draftArticles,
            tone: 'amber',
            icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        },
        {
            label: 'Total users',
            value: stats.totalUsers,
            tone: 'slate',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        },
    ] as const

    const toneMap: Record<string, { iconBg: string; iconText: string; valueText: string }> = {
        brand: { iconBg: 'bg-brand-600', iconText: 'text-white', valueText: 'text-ink-900' },
        emerald: { iconBg: 'bg-emerald-500', iconText: 'text-white', valueText: 'text-ink-900' },
        amber: { iconBg: 'bg-amber-500', iconText: 'text-white', valueText: 'text-ink-900' },
        slate: { iconBg: 'bg-slate-700', iconText: 'text-white', valueText: 'text-ink-900' },
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="relative overflow-hidden bg-brand-gradient text-white">
                <div className="absolute inset-0 bg-grid opacity-[0.1] pointer-events-none" aria-hidden="true" />
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.1), transparent 45%)',
                    }}
                    aria-hidden="true"
                />
                <div className="relative section-shell py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Control center</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/15 backdrop-blur-sm">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="mt-1 text-white/85">
                                Welcome back, {profile?.full_name || profile?.email || 'Admin'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-shell -mt-10 relative z-10 py-10">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => {
                        const tones = toneMap[card.tone]
                        return (
                            <div key={card.label} className="card p-6">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones.iconBg} ${tones.iconText} shadow-soft`}>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={card.icon} />
                                    </svg>
                                </div>
                                {statsLoading ? (
                                    <div className="mt-4 animate-pulse space-y-2">
                                        <div className="h-8 w-16 rounded bg-ink-300/30" />
                                        <div className="h-4 w-24 rounded bg-ink-300/20" />
                                    </div>
                                ) : (
                                    <>
                                        <p className={`mt-4 text-3xl font-bold tabular-nums ${tones.valueText}`}>{card.value}</p>
                                        <p className="mt-1 text-sm font-medium text-ink-500">{card.label}</p>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>

                <h2 className="mb-4 mt-12 text-xl font-bold text-ink-900">Quick actions</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Link
                        href="/admin/articles"
                        className="card-interactive group flex items-center gap-5 p-6"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand-glow transition-transform duration-200 group-hover:scale-110">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-ink-900 transition-colors group-hover:text-brand-700">Manage articles</h3>
                            <p className="text-sm text-ink-500">Create, edit, and publish articles</p>
                        </div>
                        <svg className="h-5 w-5 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="card-interactive group flex items-center gap-5 p-6"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-soft transition-transform duration-200 group-hover:scale-110">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-ink-900 transition-colors group-hover:text-brand-700">Manage users</h3>
                            <p className="text-sm text-ink-500">View accounts, roles, and permissions</p>
                        </div>
                        <svg className="h-5 w-5 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
