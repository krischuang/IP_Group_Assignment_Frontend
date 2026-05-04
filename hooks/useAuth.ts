import { useEffect, useState, useCallback } from 'react'
import { getCurrentUser } from '@/actions/user'
import { signOut } from '@/actions/auth'

export interface User {
    id: string
    email: string
    full_name?: string
    role: string
    bio?: string
    avatar_url?: string
    created_at?: string
    updated_at?: string
}

export const useUser = () => {
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = useCallback(async () => {
        setLoading(true)
        const user = await getCurrentUser()
        setProfile(user ?? null)
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const logout = async () => {
        await signOut()
        setProfile(null)
        window.location.href = '/sign-in'
    }

    return {
        user: profile,
        profile,
        loading,
        logout,
        isAdmin: profile?.role?.toLowerCase() === 'admin',
        refetchUser: fetchUser,
    }
}
