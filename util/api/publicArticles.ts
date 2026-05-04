/**
 * Use same-origin `/bff/articles` proxies (Next route handlers).
 * Relative `/api/articles` is rewritten to the Articles HTML page on some nginx setups;
 * `/bff/*` stays on Next and forwards to `${API_BASE}/articles/`.
 */
import { normalizeArticleResponse } from '@/util/api/backend'
import { messageFromApiError } from '@/util/api/backendErrors'

export async function fetchPublicArticlesList(): Promise<Record<string, unknown>[]> {
    const res = await fetch(`/bff/articles`, { cache: 'no-store' })
    const raw = await res.json().catch(() => null)
    if (!res.ok) throw new Error(messageFromApiError(raw))
    if (!Array.isArray(raw))
        throw new Error(typeof raw === 'object' && raw !== null ? messageFromApiError(raw) : 'Invalid response.')
    /** BFF already returns normalized shapes */
    return raw as Record<string, unknown>[]
}

export async function fetchPublicArticleById(
    id: string,
): Promise<Record<string, unknown> | null> {
    const res = await fetch(`/bff/articles/${encodeURIComponent(id)}`, { cache: 'no-store' })
    const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null
    if (res.status === 404) return null
    if (!res.ok || !raw) throw new Error(messageFromApiError(raw))
    /** BFF normalizes already; normalize again is idempotent enough for shapes we spread */
    return normalizeArticleResponse(raw)
}
