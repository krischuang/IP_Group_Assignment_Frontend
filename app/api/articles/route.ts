import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const published = searchParams.get('published')

        let url = `${API_BASE}/articles/`
        if (published !== null) url += `?published=${published}`

        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const res = await fetch(`${API_BASE}/articles/`, {
            method: 'POST',
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
