import { NextResponse } from 'next/server'
import { API_BASE } from '@/util/api/client'

export async function GET() {
    try {
        const res = await fetch(`${API_BASE}/categories/`, { cache: 'no-store' })
        if (!res.ok) return NextResponse.json([], { status: 200 })
        const data = await res.json()
        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json([], { status: 200 })
    }
}
