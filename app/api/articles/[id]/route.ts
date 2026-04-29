import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const res = await fetch(`${API_BASE}/articles/${id}`, { cache: 'no-store' })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const res = await fetch(`${API_BASE}/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
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
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
    }
}
