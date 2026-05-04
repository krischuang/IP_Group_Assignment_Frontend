'use server'

import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { normalizeAdminUsersPayload, normalizeUserSummary, toApiRole } from '@/util/api/backend'
import { messageFromApiError } from '@/util/api/backendErrors'

async function bearerToken(): Promise<string | null> {
    const jar = await cookies()
    return jar.get('auth_token')?.value ?? null
}

export async function getAdminStatsAction(): Promise<{ total_users: number } | null> {
    const token = await bearerToken()
    if (!token) return null

    const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data || typeof data !== 'object') return null
    const tu = (data as { total_users?: unknown }).total_users
    return typeof tu === 'number' ? { total_users: tu } : null
}

export async function listAdminUsersAction(search?: string): Promise<Record<string, unknown>[] | null> {
    const token = await bearerToken()
    if (!token) return null

    let url = `${API_BASE}/admin/users`
    if (search?.trim()) url += `?search=${encodeURIComponent(search.trim())}`
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) return null
    return normalizeAdminUsersPayload(data)
}

export async function updateAdminUserAction(body: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const userId = body.userId ?? body.user_id
    if (userId == null || userId === '') return { ok: false, error: 'User ID is required' }

    const upstream: Record<string, unknown> = {}
    const roleMapped = body.role !== undefined ? toApiRole(body.role) : undefined
    if (roleMapped !== undefined) upstream.role = roleMapped
    if (typeof body.full_name === 'string') upstream.full_name = body.full_name
    if (typeof body.email === 'string') upstream.email = body.email
    if (typeof body.bio === 'string' || body.bio === null) upstream.bio = body.bio
    if (typeof body.image_address === 'string' || body.image_address === null) upstream.image_address = body.image_address

    if (Object.keys(upstream).length === 0) return { ok: false, error: 'Nothing to update' }

    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(upstream),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: messageFromApiError(data) }
    normalizeUserSummary(data as Record<string, unknown>)
    return { ok: true }
}

export async function deleteAdminUserAction(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 204 || res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: messageFromApiError(data) }
}
