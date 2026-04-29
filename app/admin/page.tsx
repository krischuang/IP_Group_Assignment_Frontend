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
            <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4' />
                    <p className='text-gray-600 font-medium'>Loading admin panel...</p>
                </div>
            </div>
        )
    }

    const statCards = [
        { label: 'Total Articles', value: stats.totalArticles, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', color: 'blue' },
        { label: 'Published', value: stats.publishedArticles, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
        { label: 'Drafts', value: stats.draftArticles, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'yellow' },
        { label: 'Total Users', value: stats.totalUsers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'purple' },
    ]

    const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-600' },
        green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-600' },
        yellow: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-600' },
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
            <div className='bg-gradient-to-r from-red-600 to-red-700 text-white'>
                <div className='max-w-6xl mx-auto px-6 pt-20 md:pt-24 pb-12'>
                    <div className='flex items-center space-x-5'>
                        <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                            </svg>
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
                            <p className='text-red-100 mt-1'>
                                Welcome back, {profile?.full_name || profile?.email || 'Admin'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-6xl mx-auto px-6 py-8'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
                    {statCards.map((card) => {
                        const colors = colorMap[card.color]
                        return (
                            <div key={card.label} className={`${colors.bg} rounded-2xl p-6 border border-gray-100 shadow-sm`}>
                                <div className='flex items-center justify-between mb-4'>
                                    <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                                        <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={card.icon} />
                                        </svg>
                                    </div>
                                </div>
                                {statsLoading ? (
                                    <div className='animate-pulse'>
                                        <div className='h-8 bg-gray-200 rounded w-16 mb-2' />
                                        <div className='h-4 bg-gray-200 rounded w-24' />
                                    </div>
                                ) : (
                                    <>
                                        <p className={`text-3xl font-bold ${colors.text}`}>{card.value}</p>
                                        <p className='text-gray-600 text-sm mt-1'>{card.label}</p>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>

                <h2 className='text-xl font-bold text-gray-800 mb-4'>Quick Actions</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Link href='/admin/articles' className='group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-200'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
                                </svg>
                            </div>
                            <div>
                                <h3 className='text-lg font-semibold text-gray-800 group-hover:text-red-600 transition-colors'>Manage Articles</h3>
                                <p className='text-sm text-gray-500'>Create, edit, and publish articles</p>
                            </div>
                            <svg className='w-5 h-5 text-gray-300 ml-auto group-hover:text-red-400 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </Link>

                    <Link href='/admin/users' className='group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-200'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
                                </svg>
                            </div>
                            <div>
                                <h3 className='text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors'>Manage Users</h3>
                                <p className='text-sm text-gray-500'>View and manage user accounts</p>
                            </div>
                            <svg className='w-5 h-5 text-gray-300 ml-auto group-hover:text-purple-400 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
