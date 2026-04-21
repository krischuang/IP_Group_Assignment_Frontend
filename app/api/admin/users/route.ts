import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase configuration')
    return createClient(url, key)
}

export async function GET() {
    try {
        const supabase = getAdminClient()
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json(data, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message ?? 'Unknown error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = getAdminClient()
        const body = await request.json()
        const { userId, ...updates } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message ?? 'Unknown error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = getAdminClient()
        const url = new URL(request.url)
        const userId = url.searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        const authResponse = await fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            }
        })

        if (!authResponse.ok) {
            throw new Error(`Failed to delete auth user: ${authResponse.statusText}`)
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message ?? 'Unknown error' }, { status: 500 })
    }
}
