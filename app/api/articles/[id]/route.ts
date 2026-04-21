import { NextResponse } from 'next/server'
import { createClient } from '@/util/supabase/server'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('articles')
            .select('*, categories(name), users(full_name, email)')
            .eq('id', id)
            .single()

        if (error) {
            const status = error.code === 'PGRST116' ? 404 : 500
            return NextResponse.json({ error: error.message }, { status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const supabase = await createClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: dbUser, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || dbUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        const { data, error } = await supabase
            .from('articles')
            .update(body)
            .eq('id', id)
            .select('*, categories(name), users(full_name, email)')
            .single()

        if (error) {
            const status = error.code === 'PGRST116' ? 404 : 500
            return NextResponse.json({ error: error.message }, { status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const supabase = await createClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: dbUser, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || dbUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Unknown error' },
            { status: 500 }
        )
    }
}
