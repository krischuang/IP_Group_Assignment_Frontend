import { NextResponse } from 'next/server'
import { API_BASE } from '@/util/api/client'
import { normalizeArticlesList } from '@/util/api/backend'

/**
 * Browser-safe proxy: `/api/articles` is redirected to the Articles page on some hosts.
 * Call `/bff/articles` instead (same origin → Next → upstream `GET .../articles/`).
 */
export async function GET() {
    try {
        const res = await fetch(`${API_BASE}/articles/`, { cache: 'no-store' })
        const raw = await res.json().catch(() => null)
        if (!res.ok) return NextResponse.json(raw ?? { detail: 'Upstream error' }, { status: res.status })
        return NextResponse.json(normalizeArticlesList(raw))
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ detail: message }, { status: 500 })
    }
}
