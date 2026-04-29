'use client'

import { useUser } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

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
            const res = await fetch('/api/admin/users')
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (err: any) {
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
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: roleValue }),
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to update role')
            }
            setMessage({ type: 'success', text: 'User role updated successfully.' })
            setEditingRole(null)
            fetchUsers()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update role.' })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (userId: string) => {
        setActionLoading(userId)
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to delete user')
            }
            setMessage({ type: 'success', text: 'User deleted successfully.' })
            setDeleteConfirm(null)
            fetchUsers()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to delete user.' })
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
            <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4' />
                    <p className='text-gray-600 font-medium'>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
            {/* Header */}
            <div className='bg-gradient-to-r from-red-600 to-red-700 text-white'>
                <div className='max-w-6xl mx-auto px-6 pt-20 md:pt-24 pb-10'>
                    <div className='flex items-center space-x-3 mb-2'>
                        <Link href='/admin' className='text-red-200 hover:text-white transition-colors text-sm'>
                            Dashboard
                        </Link>
                        <span className='text-red-300'>/</span>
                        <span className='text-sm'>Users</span>
                    </div>
                    <h1 className='text-3xl font-bold'>Manage Users</h1>
                    <p className='text-red-100 mt-1'>View and manage user accounts and roles</p>
                </div>
            </div>

            <div className='max-w-6xl mx-auto px-6 py-8'>
                {/* Toast Message */}
                {message && (
                    <div
                        className={`mb-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center justify-between ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} className='ml-4 opacity-60 hover:opacity-100'>
                            &times;
                        </button>
                    </div>
                )}

                {/* Search & Stats */}
                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
                    <div className='px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                        <h2 className='text-lg font-bold text-gray-800'>
                            All Users
                            {!usersLoading && (
                                <span className='ml-2 text-sm font-normal text-gray-500'>
                                    ({filteredUsers.length}{search.trim() ? ` of ${users.length}` : ''} total)
                                </span>
                            )}
                        </h2>
                        <div className='relative'>
                            <svg
                                className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                            <input
                                type='text'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder='Search by name, email, or role...'
                                className='pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all w-full sm:w-72 text-gray-900'
                            />
                        </div>
                    </div>

                    {usersLoading ? (
                        <div className='p-12 text-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3' />
                            <p className='text-gray-500 text-sm'>Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className='p-12 text-center'>
                            <svg className='w-12 h-12 text-gray-300 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
                            </svg>
                            <p className='text-gray-500 font-medium'>
                                {search.trim() ? 'No users match your search' : 'No users found'}
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-50 text-left'>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Name</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Email</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Role</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Created</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center space-x-3'>
                                                    <div className='w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0'>
                                                        {u.full_name
                                                            ? u.full_name
                                                                  .split(' ')
                                                                  .map((n) => n[0])
                                                                  .join('')
                                                                  .toUpperCase()
                                                                  .slice(0, 2)
                                                            : u.email?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className='font-medium text-gray-900'>
                                                        {u.full_name || 'No name'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-600'>{u.email}</td>
                                            <td className='px-6 py-4'>
                                                {editingRole === u.id ? (
                                                    <div className='flex items-center space-x-2'>
                                                        <select
                                                            value={roleValue}
                                                            onChange={(e) => setRoleValue(e.target.value)}
                                                            className='px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white'
                                                        >
                                                            <option value='user'>user</option>
                                                            <option value='admin'>admin</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleRoleUpdate(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            className='px-2.5 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50'
                                                        >
                                                            {actionLoading === u.id ? '...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingRole(null)}
                                                            className='px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                            u.role?.toLowerCase() === 'admin'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {u.role || 'user'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                {u.created_at
                                                    ? new Date(u.created_at).toLocaleDateString('en-AU', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center justify-end space-x-2'>
                                                    {editingRole !== u.id && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingRole(u.id)
                                                                setRoleValue(u.role || 'user')
                                                            }}
                                                            className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                                            title='Edit role'
                                                        >
                                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {deleteConfirm === u.id ? (
                                                        <div className='flex items-center space-x-1'>
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                disabled={actionLoading === u.id}
                                                                className='px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50'
                                                            >
                                                                {actionLoading === u.id ? '...' : 'Confirm'}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className='px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(u.id)}
                                                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                                            title='Delete user'
                                                        >
                                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
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
