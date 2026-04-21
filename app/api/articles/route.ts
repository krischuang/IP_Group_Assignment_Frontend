import { NextResponse } from 'next/server'
import { createClient } from '@/util/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const published = searchParams.get('published')

        let query = supabase
            .from('articles')
            .select('*, categories(name), users(full_name, email)')
            .order('created_at', { ascending: false })

        if (published === 'true') {
            query = query.eq('published', true)
        } else if (published === 'false') {
            query = query.eq('published', false)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
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
        const { title, content, summary, category_id, published } = body

        const { data, error } = await supabase
            .from('articles')
            .insert({
                title,
                content,
                summary,
                category_id,
                published: published ?? false,
                author_id: user.id,
            })
            .select('*, categories(name), users(full_name, email)')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Unknown error' },
            { status: 500 }
        )
    }
}
