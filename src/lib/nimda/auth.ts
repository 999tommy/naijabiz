import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

export const NIMDA_ALLOWED_EMAILS = new Set([
    'adegboyetommy@gmail.com',
    'amahiabethany13@gmail.com',
])
const COOKIE_NAME = 'nimda_admin_session'
const SESSION_SECONDS = 8 * 60 * 60

type AdminSession = { email: string; exp: number }

function secret(name: string): string | null {
    const value = process.env[name]
    return value && value.length >= 32 ? value : null
}

function sign(value: string, key: string): string {
    return createHmac('sha256', key).update(value).digest('base64url')
}

export function isNimdaConfigured(): boolean {
    const password = process.env.NIMDA_ADMIN_PASSWORD
    return !!password && password.length >= 8 && !!secret('NIMDA_SESSION_SECRET')
}

function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a)
    const right = Buffer.from(b)
    return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyNimdaPassword(password: string): boolean {
    const expected = process.env.NIMDA_ADMIN_PASSWORD
    if (!expected || expected.length < 8 || password.length > 256) return false
    return safeEqual(password, expected)
}

export async function createNimdaPuzzlePass(): Promise<void> {
    const key = secret('NIMDA_SESSION_SECRET')
    if (!key) throw new Error('Admin session signing is not configured')
    const value = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 300 })).toString('base64url')
    const cookieStore = await cookies()
    cookieStore.set('nimda_puzzle_pass', `${value}.${sign(`puzzle:${value}`, key)}`, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/nimda', maxAge: 300,
    })
}

export async function verifyNimdaPuzzlePass(): Promise<boolean> {
    const key = secret('NIMDA_SESSION_SECRET')
    if (!key) return false
    const cookieStore = await cookies()
    const token = cookieStore.get('nimda_puzzle_pass')?.value
    if (!token) return false
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra || !safeEqual(signature, sign(`puzzle:${payload}`, key))) return false
    try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Math.floor(Date.now()/1000) } catch { return false }
}

export async function clearNimdaPuzzlePass() {
    const cookieStore = await cookies()
    cookieStore.set('nimda_puzzle_pass', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/nimda', maxAge: 0 })
}

export async function createNimdaSession(email: string): Promise<boolean> {
    const key = secret('NIMDA_SESSION_SECRET')
    if (!key || !NIMDA_ALLOWED_EMAILS.has(email.toLowerCase())) return false
    const payload: AdminSession = { email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }
    const value = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, `${value}.${sign(value, key)}`, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
        path: '/nimda', maxAge: SESSION_SECONDS,
    })
    return true
}

export async function clearNimdaSession() {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/nimda', maxAge: 0 })
}

export async function getNimdaSession(): Promise<AdminSession | null> {
    const key = secret('NIMDA_SESSION_SECRET')
    if (!key) return null
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra || !safeEqual(signature, sign(payload, key))) return null
    try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AdminSession
        if (!NIMDA_ALLOWED_EMAILS.has(session.email) || session.exp <= Math.floor(Date.now() / 1000)) return null
        return session
    } catch {
        return null
    }
}

export async function getNimdaFingerprint(): Promise<string> {
    const requestHeaders = await headers()
    const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
    const ip = requestHeaders.get('x-real-ip') || forwarded || 'unknown-ip'
    const agent = requestHeaders.get('user-agent') || 'unknown-agent'
    return createHmac('sha256', secret('NIMDA_SESSION_SECRET') || 'missing-session-secret').update(`${ip}\n${agent}`).digest('hex')
}

export async function checkNimdaLockout(fingerprint: string): Promise<{ locked: boolean; attempts: number }> {
    const db = await createServiceClient()
    const { data, error } = await db.from('nimda_login_attempts').select('failed_attempts, locked_until').eq('fingerprint', fingerprint).maybeSingle()
    if (error) throw new Error('Admin lockout storage unavailable')
    const locked = !!data?.locked_until && new Date(data.locked_until).getTime() > Date.now()
    return { locked, attempts: Number(data?.failed_attempts || 0) }
}

export async function recordNimdaFailure(fingerprint: string): Promise<{ attempts: number; locked: boolean }> {
    const db = await createServiceClient()
    const { data, error } = await db.rpc('record_nimda_login_failure', { p_fingerprint: fingerprint })
    if (error) throw new Error('Admin lockout storage unavailable')
    const attempts = Number(data?.[0]?.failed_attempts ?? data?.failed_attempts ?? 0)
    return { attempts, locked: attempts >= 3 }
}

export async function clearNimdaFailures(fingerprint: string): Promise<void> {
    const db = await createServiceClient()
    const { error } = await db.from('nimda_login_attempts').delete().eq('fingerprint', fingerprint)
    if (error) throw new Error('Admin lockout storage unavailable')
}
