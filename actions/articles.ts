'use server'

import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { normalizeArticleResponse, toArticleCreateBody, toArticleUpdateBody } from '@/util/api/backend'
import { messageFromApiError } from '@/util/api/backendErrors'

async function bearerToken(): Promise<string | null> {
    const jar = await cookies()
    return jar.get('auth_token')?.value ?? null
}

export type ArticleMutationResult =
    | { ok: true; article: Record<string, unknown> }
    | { ok: false; error: string }

export async function createArticleAction(input: { title: string; content: string }): Promise<ArticleMutationResult> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const dto = toArticleCreateBody(input as Record<string, unknown>)
    if (!dto) return { ok: false, error: 'Title and content are required.' }

    const res = await fetch(`${API_BASE}/articles/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: messageFromApiError(data) }

    return { ok: true, article: normalizeArticleResponse(data as Record<string, unknown>) }
}

export async function updateArticleAction(
    id: string,
    input: Record<string, unknown>,
): Promise<ArticleMutationResult> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const mapped = toArticleUpdateBody(input)
    const keys = Object.keys(mapped).filter((k) => mapped[k as keyof typeof mapped] !== undefined)
    const payload = Object.fromEntries(keys.map((k) => [k, mapped[k as keyof typeof mapped]]))
    if (keys.length === 0) return { ok: false, error: 'No valid fields (title or content).' }

    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: messageFromApiError(data) }

    return { ok: true, article: normalizeArticleResponse(data as Record<string, unknown>) }
}

export async function deleteArticleAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = await bearerToken()
    if (!token) return { ok: false, error: 'Unauthorized' }

    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 204 || res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: messageFromApiError(data) }
}
