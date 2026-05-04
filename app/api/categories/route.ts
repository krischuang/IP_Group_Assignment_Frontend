import { NextResponse } from 'next/server'

/** OpenAPI exposes no `/categories` route — categories are unsupported by this backend. */
export async function GET() {
    return NextResponse.json([], { status: 200 })
}
