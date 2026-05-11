'use server'

import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { messageFromApiError } from '@/util/api/backendErrors'

async function bearerToken(): Promise<string | null> {
    const jar = await cookies()
    return jar.get('auth_token')?.value ?? null
}

export interface BookmarkItem {
    article_id: number
    note: string | null
    created_at: string
    article_title: string
}

export async function listBookmarksAction(): Promise<BookmarkItem[] | null> {
    const token = await bearerToken()
    if (!token) return null

    const res = await fetch(`${API_BASE}/bookmarks/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !Array.isArray(data)) return null
    return data as BookmarkItem[]
}

export async function createBookmarkAction(
    articleId: number,
    note?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const res = await fetch(`${API_BASE}/bookmarks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ article_id: articleId, note: note ?? null }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: messageFromApiError(data) }
    return { ok: true }
}

export async function updateBookmarkAction(
    articleId: number,
    note: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const res = await fetch(`${API_BASE}/bookmarks/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: messageFromApiError(data) }
    return { ok: true }
}

export async function deleteBookmarkAction(
    articleId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const res = await fetch(`${API_BASE}/bookmarks/${articleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 204 || res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: messageFromApiError(data) }
}
