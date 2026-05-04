import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { normalizeArticlesList, normalizeArticleResponse, toArticleCreateBody } from '@/util/api/backend'

export async function GET() {
    try {
        /** OpenAPI: GET /articles/ has no published filter */
        const res = await fetch(`${API_BASE}/articles/`, { cache: 'no-store' })
        const data = await res.json().catch(() => [])
        const list = normalizeArticlesList(data)
        return NextResponse.json(list, { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const bodyIn = await request.json()
        const dto = toArticleCreateBody(bodyIn as Record<string, unknown>)
        if (!dto)
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })

        const res = await fetch(`${API_BASE}/articles/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dto),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return NextResponse.json(data, { status: res.status })
        return NextResponse.json(normalizeArticleResponse(data as Record<string, unknown>), { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
