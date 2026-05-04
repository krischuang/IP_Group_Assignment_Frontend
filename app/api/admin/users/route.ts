import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'
import { normalizeUserSummary, normalizeAdminUsersPayload, toApiRole } from '@/util/api/backend'

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get('auth_token')?.value ?? null
}

export async function GET(request: Request) {
    try {
        const token = await getToken()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const url = new URL(request.url)
        const searchParam = url.searchParams.get('search')
        /** OpenAPI GET /admin/users?search= */
        let backendUrl = `${API_BASE}/admin/users`
        if (searchParam && searchParam.trim()) backendUrl += `?search=${encodeURIComponent(searchParam.trim())}`

        const res = await fetch(backendUrl, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return NextResponse.json(data, { status: res.status })

        /** Return flat array so existing admin UI stays stable */
        const list = normalizeAdminUsersPayload(data)
        return NextResponse.json(list, { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

/** UpdateUserRequest OpenAPI — map role casing for enum Admin | User */
export async function PUT(request: Request) {
    try {
        const token = await getToken()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = (await request.json()) as Record<string, unknown>
        const userId = body.userId ?? body.user_id
        if (userId == null || userId === '') return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

        const upstream: Record<string, unknown> = {}

        const roleMapped = body.role !== undefined ? toApiRole(body.role) : undefined
        if (roleMapped !== undefined) upstream.role = roleMapped

        if (typeof body.full_name === 'string') upstream.full_name = body.full_name
        if (typeof body.email === 'string') upstream.email = body.email
        if (typeof body.bio === 'string' || body.bio === null) upstream.bio = body.bio
        if (typeof body.image_address === 'string' || body.image_address === null) upstream.image_address = body.image_address

        if (Object.keys(upstream).length === 0)
            return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(upstream),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return NextResponse.json(data, { status: res.status })
        return NextResponse.json(normalizeUserSummary(data as Record<string, unknown>), { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const token = await getToken()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const reqUrl = new URL(request.url)
        const userId = reqUrl.searchParams.get('userId')
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
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
