import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get('auth_token')?.value ?? null
}

export async function GET() {
    try {
        const token = await getToken()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const token = await getToken()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { userId, ...updates } = body
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const token = await getToken()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const url = new URL(request.url)
        const userId = url.searchParams.get('userId')
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
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
