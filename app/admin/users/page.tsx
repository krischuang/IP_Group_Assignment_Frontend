'use client'

import { useUser } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { deleteAdminUserAction, listAdminUsersAction, updateAdminUserAction } from '@/actions/admin'

interface UserRecord {
    id: string
    email: string
    full_name?: string
    role: string
    created_at?: string
}

export default function AdminUsers() {
    const { user, profile, loading, isAdmin } = useUser()
    const router = useRouter()

    const [users, setUsers] = useState<UserRecord[]>([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [editingRole, setEditingRole] = useState<string | null>(null)
    const [roleValue, setRoleValue] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/sign-in')
            return
        }
        if (!loading && user && !isAdmin) {
            router.push('/')
            return
        }
    }, [user, loading, isAdmin, router])

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true)
        try {
            const data = await listAdminUsersAction()
            if (data === null) throw new Error('Unauthorized')
            setUsers(data as unknown as UserRecord[])
        } catch (err: unknown) {
            console.error('Error fetching users:', err)
            setMessage({ type: 'error', text: 'Failed to load users.' })
        } finally {
            setUsersLoading(false)
        }
    }, [])

    useEffect(() => {
        if (user && isAdmin) {
            fetchUsers()
        }
    }, [user, isAdmin, fetchUsers])

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [message])

    const handleRoleUpdate = async (userId: string) => {
        setActionLoading(userId)
        try {
            const res = await updateAdminUserAction({ userId, role: roleValue })
            if (!res.ok) throw new Error(res.error)
            setMessage({ type: 'success', text: 'User role updated successfully.' })
            setEditingRole(null)
            fetchUsers()
        } catch (err: unknown) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Failed to update role.',
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (userId: string) => {
        setActionLoading(userId)
        try {
            const res = await deleteAdminUserAction(userId)
            if (!res.ok) throw new Error(res.error)
            setMessage({ type: 'success', text: 'User deleted successfully.' })
            setDeleteConfirm(null)
            fetchUsers()
        } catch (err: unknown) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Failed to delete user.',
            })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter((u) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            u.email?.toLowerCase().includes(q) ||
            u.full_name?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
    })

    if (loading || !user || !isAdmin) {
        return (
            <div className="flex min-h-[calc(100vh-68px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                    <p className="font-medium text-ink-500">Loading…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="relative overflow-hidden bg-brand-gradient text-white">
                <div className="absolute inset-0 bg-grid opacity-[0.1] pointer-events-none" aria-hidden="true" />
                <div className="section-shell relative py-10">
                    <nav className="mb-2 flex items-center gap-2 text-sm text-white/75" aria-label="Breadcrumb">
                        <Link href="/admin" className="transition-colors hover:text-white">Dashboard</Link>
                        <span className="text-white/50">/</span>
                        <span className="font-medium">Users</span>
                    </nav>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                    <p className="mt-1 text-white/85">View and manage user accounts and roles</p>
                </div>
            </div>

            <div className="section-shell py-8">
                {message && (
                    <div
                        role="alert"
                        className={`mb-6 flex items-center justify-between rounded-xl border px-5 py-3.5 text-sm font-medium shadow-soft animate-fade-in ${
                            message.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            {message.type === 'success' ? (
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
                            {message.text}
                        </span>
                        <button onClick={() => setMessage(null)} className="ml-4 opacity-60 transition-opacity hover:opacity-100" aria-label="Dismiss">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="card overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-ink-300/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base font-bold text-ink-900">
                            All users
                            {!usersLoading && (
                                <span className="ml-2 text-sm font-normal text-ink-500">
                                    ({filteredUsers.length}{search.trim() ? ` of ${users.length}` : ''} total)
                                </span>
                            )}
                        </h2>
                        <div className="relative w-full sm:w-80">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, or role…"
                                className="field-input pl-10"
                                aria-label="Search users"
                            />
                        </div>
                    </div>

                    {usersLoading ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                            <p className="text-sm text-ink-500">Loading users…</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="mt-4 font-semibold text-ink-900">
                                {search.trim() ? 'No users match your search' : 'No users found'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-ink-300/30 bg-surface-subtle text-left">
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Name</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Email</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Role</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Created</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-300/20">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="transition-colors hover:bg-surface-muted">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold uppercase text-brand-700">
                                                        {u.full_name
                                                            ? u.full_name
                                                                  .split(' ')
                                                                  .map((n) => n[0])
                                                                  .join('')
                                                                  .toUpperCase()
                                                                  .slice(0, 2)
                                                            : u.email?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="font-medium text-ink-900">
                                                        {u.full_name || <span className="text-ink-500">No name</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink-700">{u.email}</td>
                                            <td className="px-6 py-4">
                                                {editingRole === u.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={roleValue}
                                                            onChange={(e) => setRoleValue(e.target.value)}
                                                            className="rounded-lg border border-ink-300/60 bg-white px-2 py-1.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                                                        >
                                                            <option value="user">user</option>
                                                            <option value="admin">admin</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleRoleUpdate(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            {actionLoading === u.id ? '…' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingRole(null)}
                                                            className="rounded-lg bg-ink-300/30 px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-300/50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                            u.role?.toLowerCase() === 'admin'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-ink-300/20 text-ink-700'
                                                        }`}
                                                    >
                                                        {u.role?.toLowerCase() === 'admin' && (
                                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                        )}
                                                        {u.role || 'user'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink-500">
                                                {u.created_at
                                                    ? new Date(u.created_at).toLocaleDateString('en-AU', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {editingRole !== u.id && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingRole(u.id)
                                                                setRoleValue(u.role || 'user')
                                                            }}
                                                            className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                                                            title="Edit role"
                                                        >
                                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {deleteConfirm === u.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                disabled={actionLoading === u.id}
                                                                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                                            >
                                                                {actionLoading === u.id ? '…' : 'Confirm'}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="rounded-lg bg-ink-300/30 px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-300/50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(u.id)}
                                                            className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Delete user"
                                                        >
                                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                <line x1="10" y1="11" x2="10" y2="17" />
                                                                <line x1="14" y1="11" x2="14" y2="17" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
