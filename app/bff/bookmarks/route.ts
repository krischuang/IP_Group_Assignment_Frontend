import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'

export async function GET() {
    const jar = await cookies()
    const token = jar.get('auth_token')?.value
    if (!token) return NextResponse.json([])

    try {
        const res = await fetch(`${API_BASE}/bookmarks/`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await res.json().catch(() => [])
        if (!res.ok) return NextResponse.json([])
        return NextResponse.json(data)
    } catch {
        return NextResponse.json([])
    }
}
