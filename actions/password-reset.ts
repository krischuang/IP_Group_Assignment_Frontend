"use server"

import crypto from 'crypto'
import { API_BASE } from '@/util/api/client'

async function encryptPassword(password: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/public-key`)
    const j = await res.json()
    const public_key = typeof j.public_key === 'string' ? j.public_key : j.publicKey
    if (!public_key || typeof public_key !== 'string') throw new Error('Invalid public key response')
    const encrypted = crypto.publicEncrypt(
        { key: public_key, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(password)
    )
    return encrypted.toString('base64')
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
    const text = await res.text()
    try {
        const err = JSON.parse(text)
        if (Array.isArray(err.detail)) return err.detail.map((e: any) => e.msg).join(', ')
        if (err.detail) return err.detail
    } catch {}
    // Surface the HTTP status so it's easy to diagnose in dev
    return `${fallback} (HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ''})`
}

export async function forgotPassword(email: string) {
    try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        if (!res.ok) {
            return { success: false, error: await parseErrorMessage(res, 'Request failed') }
        }
        const data = await res.json()
        return { success: true, message: data.message as string }
    } catch (err: any) {
        return { success: false, error: err.message ?? 'Request failed' }
    }
}

export async function validateResetToken(email: string, token: string) {
    try {
        const res = await fetch(`${API_BASE}/auth/validate-reset-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token }),
        })
        if (!res.ok) {
            return { success: false, error: await parseErrorMessage(res, 'Invalid or expired code') }
        }
        const data = await res.json()
        return { success: true, valid: data.valid as boolean }
    } catch (err: any) {
        return { success: false, error: err.message ?? 'Request failed' }
    }
}

export async function resetPassword(email: string, newPassword: string) {
    try {
        const encryptedPassword = await encryptPassword(newPassword)
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, new_password: encryptedPassword }),
        })
        if (!res.ok) {
            return { success: false, error: await parseErrorMessage(res, 'Reset failed') }
        }
        const data = await res.json()
        return { success: true, message: data.message as string }
    } catch (err: any) {
        return { success: false, error: err.message ?? 'Reset failed' }
    }
}
