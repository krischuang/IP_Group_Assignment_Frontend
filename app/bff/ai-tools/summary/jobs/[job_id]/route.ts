import { NextResponse } from 'next/server'
import { API_BASE } from '@/util/api/client'

interface RouteContext {
    params: Promise<{ job_id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { job_id } = await context.params
        const res = await fetch(
            `${API_BASE}/ai-tools/summary/jobs/${encodeURIComponent(job_id)}`,
            { cache: 'no-store' },
        )
        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ detail: message }, { status: 500 })
    }
}
