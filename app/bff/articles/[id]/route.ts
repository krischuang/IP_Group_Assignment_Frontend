import { NextResponse } from 'next/server'
import { API_BASE } from '@/util/api/client'
import { normalizeArticleResponse } from '@/util/api/backend'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return NextResponse.json(data, { status: res.status })
        return NextResponse.json(normalizeArticleResponse(data as Record<string, unknown>), { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ detail: message }, { status: 500 })
    }
}
