import { NextResponse, type NextRequest } from 'next/server'
import { API_BASE } from '@/util/api/client'

const PUBLIC = [
    '/',
    '/home',
    '/articles',
    '/sign-in',
    '/sign-up',
    '/api',
    '/bff',
] as const

const ADMIN_ONLY = [
    '/admin',
] as const

function decodeJWTPayload(token: string): Record<string, any> | null {
    try {
        const [, payload] = token.split('.')
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    } catch {
        return null
    }
}

function isTokenExpired(payload: Record<string, any>): boolean {
    if (!payload.exp) return false
    return payload.exp < Math.floor(Date.now() / 1000)
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value

    const rawPath = request.nextUrl?.pathname ?? '/'
    const normPath = rawPath !== '/' && rawPath.endsWith('/')
        ? rawPath.slice(0, -1)
        : rawPath

    const isPublic = PUBLIC.some((base) => {
        if (base === '/') return normPath === '/'
        return normPath === base || normPath.startsWith(base + '/')
    })

    let payload: Record<string, any> | null = null
    let isAuthenticated = false

    if (token) {
        payload = decodeJWTPayload(token)
        isAuthenticated = !!payload && !isTokenExpired(payload)
    }

    if (!isPublic && !isAuthenticated) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('redirect', encodeURIComponent(rawPath + request.nextUrl.search))
        return NextResponse.redirect(url)
    }

    const requiresAdmin = ADMIN_ONLY.some((base) =>
        normPath === base || normPath.startsWith(base + '/')
    )

    if (requiresAdmin && isAuthenticated) {
        let role = payload?.role

        if (!role) {
            try {
                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const user = await res.json()
                    role = user.role
                }
            } catch {
                // if fetch fails, deny access
            }
        }

        if (role?.toLowerCase() !== 'admin') {
            return NextResponse.redirect(new URL('/home', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
