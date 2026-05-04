"use server"

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { API_BASE } from '@/util/api/client'

async function encryptPassword(password: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/public-key`)
    const j = await res.json()
    const public_key = typeof j.public_key === 'string' ? j.public_key : j.publicKey
    if (!public_key || typeof public_key !== 'string') throw new Error('Invalid public key response')
    const encrypted = crypto.publicEncrypt(
        {
            key: public_key,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(password)
    )
    return encrypted.toString('base64')
}

export async function signUpWithEmail(email: string, password: string, fullName: string, turnstileToken: string) {
    try {
        const encryptedPassword = await encryptPassword(password)
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: encryptedPassword, full_name: fullName, turnstile_token: turnstileToken }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Registration failed' }))
            const message = Array.isArray(err.detail)
                ? err.detail.map((e: any) => e.msg).join(', ')
                : err.detail ?? 'Registration failed'
            return { success: false, error: message }
        }
        const data = await res.json()
        return { success: true, data }
    } catch (err: any) {
        return { success: false, error: err.message ?? 'Registration failed' }
    }
}

export async function signInWithPassword(email: string, password: string, turnstileToken: string) {
    try {
        const encryptedPassword = await encryptPassword(password)
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: encryptedPassword, turnstile_token: turnstileToken }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Login failed' }))
            const message = Array.isArray(err.detail)
                ? err.detail.map((e: any) => e.msg).join(', ')
                : err.detail ?? 'Invalid email or password'
            return { success: false, error: message }
        }
        const data = await res.json()
        const cookieStore = await cookies()
        cookieStore.set('auth_token', data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        })
        return { success: true, data }
    } catch (err: any) {
        return { success: false, error: err.message ?? 'Login failed' }
    }
}

export async function signOut() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
}
