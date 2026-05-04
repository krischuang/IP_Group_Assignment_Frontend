import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { normalizeArticleResponse, toArticleUpdateBody } from '@/util/api/backend'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const res = await fetch(`${API_BASE}/articles/${id}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return NextResponse.json(data, { status: res.status })
        return NextResponse.json(normalizeArticleResponse(data as Record<string, unknown>), { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const bodyIn = (await request.json()) as Record<string, unknown>

        /** OpenAPI ArticleUpdate: optional title, content only */
        const mapped = toArticleUpdateBody(bodyIn)
        const keys = Object.keys(mapped).filter((k) => mapped[k as keyof typeof mapped] !== undefined)
        const payload = Object.fromEntries(keys.map((k) => [k, mapped[k as keyof typeof mapped]])) as Record<
            string,
            string | null
        >
        if (keys.length === 0) return NextResponse.json({ error: 'No valid fields (title or content)' }, { status: 400 })

        const res = await fetch(`${API_BASE}/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return NextResponse.json(data, { status: res.status })
        return NextResponse.json(normalizeArticleResponse(data as Record<string, unknown>), { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const res = await fetch(`${API_BASE}/articles/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 204) return NextResponse.json({ success: true }, { status: 200 })
        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
