import { NextRequest, NextResponse } from 'next/server'
import { clearNimdaFailures, clearNimdaPuzzlePass, checkNimdaLockout, createNimdaSession, getNimdaFingerprint, NIMDA_ALLOWED_EMAILS, recordNimdaFailure, verifyNimdaPassword, verifyNimdaPuzzlePass, isNimdaConfigured } from '@/lib/nimda/auth'

export const runtime = 'nodejs'

function sameOrigin(request: NextRequest) {
    const origin = request.headers.get('origin')
    return !!origin && new URL(origin).host === request.headers.get('host')
}

export async function POST(request: NextRequest) {
    if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
    let body: { answer?: string; email?: string; password?: string; company?: string }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Enter your details and try again.' }, { status: 400 }) }
    if (body.company) return NextResponse.json({ error: 'Request not allowed.' }, { status: 400 })
    if (!isNimdaConfigured()) return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
    if (!await verifyNimdaPuzzlePass()) return NextResponse.json({ error: 'Complete the first step before signing in.' }, { status: 401 })
    const fingerprint = await getNimdaFingerprint()
    let lock: { locked: boolean; attempts: number }
    try { lock = await checkNimdaLockout(fingerprint) } catch {
        return NextResponse.json({ error: 'Admin sign-in is temporarily unavailable.' }, { status: 503 })
    }
    if (lock.locked) return NextResponse.json({ redirect: '/' }, { status: 423 })

    const email = String(body.email || '').trim().toLowerCase()
    const valid = body.answer === 'PREDESTINATION'
        && NIMDA_ALLOWED_EMAILS.has(email)
        && verifyNimdaPassword(String(body.password || ''))

    if (!valid) {
        try {
            const result = await recordNimdaFailure(fingerprint)
            return result.locked
                ? NextResponse.json({ redirect: '/' }, { status: 423 })
                : NextResponse.json({ error: `Those details did not match. Try again. ${3 - result.attempts} ${3 - result.attempts === 1 ? 'try' : 'tries'} left.` }, { status: 401 })
        } catch {
            return NextResponse.json({ error: 'Admin sign-in is temporarily unavailable.' }, { status: 503 })
        }
    }

    try { await clearNimdaFailures(fingerprint) } catch {
        return NextResponse.json({ error: 'Admin sign-in is temporarily unavailable.' }, { status: 503 })
    }
    if (!await createNimdaSession(email)) return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
    await clearNimdaPuzzlePass()
    return NextResponse.json({ redirect: '/nimda' })
}
