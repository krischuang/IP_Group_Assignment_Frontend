"use server"

import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null

        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export async function updateCurrentUser(id: string | number, updates: Record<string, unknown>) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null

        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}
