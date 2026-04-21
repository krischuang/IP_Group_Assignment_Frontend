'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useAuth'
import { updateUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'

export default function Profile() {
    const { user, profile, loading, isAdmin } = useUser()
    const router = useRouter()

    const [editing, setEditing] = useState(false)
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<string | null>(null)

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
        const result = await updateUser(profile.id, { full_name: fullName, bio })
        setSaving(false)

        if (result) {
            setToast('Profile updated successfully!')
            setEditing(false)
        } else {
            setToast('Failed to update profile. Please try again.')
        }
    }

    const handleCancel = () => {
        setFullName(profile?.full_name || '')
        setBio(profile?.bio || '')
        setEditing(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        )
    }

    if (!user || !profile) return null

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-3 text-sm font-medium text-gray-800 animate-fade-in">
                    {toast}
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div
                        className="px-8 py-10 text-white text-center"
                        style={{ background: 'linear-gradient(135deg, #D93C3E 0%, #a02d2f 100%)' }}
                    >
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-white/30">
                            {profile.full_name
                                ? profile.full_name.charAt(0).toUpperCase()
                                : user.email?.charAt(0).toUpperCase()}
                        </div>
                        <h1 className="text-2xl font-bold">
                            {profile.full_name || 'Your Profile'}
                        </h1>
                        <span
                            className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full ${
                                isAdmin
                                    ? 'bg-yellow-400 text-yellow-900'
                                    : 'bg-white/20 text-white'
                            }`}
                        >
                            {profile.role}
                        </span>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Email
                            </label>
                            <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                {user.email}
                            </p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Full Name
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                    {profile.full_name || 'Not provided'}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Bio
                            </label>
                            {editing ? (
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition resize-none"
                                    placeholder="Tell us about yourself"
                                />
                            ) : (
                                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 min-h-[4rem]">
                                    {profile.bio || 'No bio yet'}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            {editing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
