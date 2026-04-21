import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/util/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const PUBLIC = [
    '/',
    '/home',
    '/articles',
    '/sign-in',
    '/sign-up',
    '/api',
] as const

const ADMIN_ONLY = [
    '/admin',
] as const

export async function middleware(request: NextRequest) {
    let response = await updateSession(request)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (toSet) =>
                    toSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    ),
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const rawPath = request.nextUrl?.pathname ?? '/'
    const normPath = rawPath !== '/' && rawPath.endsWith('/')
        ? rawPath.slice(0, -1)
        : rawPath

    const isPublic = PUBLIC.some((base) => {
        if (base === '/') return normPath === '/'
        return normPath === base || normPath.startsWith(base + '/')
    })

    if (!isPublic && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('redirect', encodeURIComponent(rawPath + request.nextUrl.search))
        return NextResponse.redirect(url)
    }

    const requiresAdmin = ADMIN_ONLY.some((base) =>
        normPath === base || normPath.startsWith(base + '/')
    )

    if (requiresAdmin && user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
