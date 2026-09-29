import { NextRequest, NextResponse } from 'next/server'
import { clearNimdaSession } from '@/lib/nimda/auth'

export async function POST(request: NextRequest) {
    const origin = request.headers.get('origin')
    if (!origin || new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
    await clearNimdaSession()
    return NextResponse.json({ redirect: '/' })
}
