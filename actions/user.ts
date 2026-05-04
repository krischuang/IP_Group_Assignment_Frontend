"use server"

import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { normalizeMe } from '@/util/api/backend'

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
        const data = (await res.json()) as Record<string, unknown>
        return normalizeMe(data)
    } catch {
        return null
    }
}

/** OpenAPI: POST /auth/me — UpdateMeRequest: full_name?, bio?, image_address? */
export async function updateCurrentUser(updates: { full_name?: string; bio?: string; image_address?: string | null }) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null

        const body: Record<string, unknown> = {}
        if ('full_name' in updates && updates.full_name !== undefined) body.full_name = updates.full_name
        if ('bio' in updates && updates.bio !== undefined) body.bio = updates.bio
        if ('image_address' in updates && updates.image_address !== undefined) body.image_address = updates.image_address

        const res = await fetch(`${API_BASE}/auth/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })
        if (!res.ok) return null
        const data = (await res.json()) as Record<string, unknown>
        return normalizeMe(data)
    } catch {
        return null
    }
}
