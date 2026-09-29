import { NextRequest, NextResponse } from 'next/server'
import { checkNimdaLockout, createNimdaPuzzlePass, getNimdaFingerprint, isNimdaConfigured, recordNimdaFailure } from '@/lib/nimda/auth'

export const runtime = 'nodejs'
function sameOrigin(request: NextRequest) { const origin=request.headers.get('origin'); return !!origin && new URL(origin).host===request.headers.get('host') }
export async function POST(request: NextRequest) {
    if (!sameOrigin(request)) return NextResponse.json({error:'Request not allowed.'},{status:403})
    let body: {answer?:string;company?:string}
    try { body=await request.json() } catch { return NextResponse.json({error:'Try again.'},{status:400}) }
    if (!isNimdaConfigured()) return NextResponse.json({error:'Admin sign-in is not configured.'},{status:503})
    const fingerprint=await getNimdaFingerprint()
    try {
        const lock=await checkNimdaLockout(fingerprint)
        if(lock.locked) return NextResponse.json({redirect:'/'},{status:423})
        if(body.company || body.answer!=='PREDESTINATION') {
            const result=await recordNimdaFailure(fingerprint)
            return result.locked ? NextResponse.json({redirect:'/'},{status:423}) : NextResponse.json({error:`That answer did not match. ${3-result.attempts} ${3-result.attempts===1?'try':'tries'} left.`},{status:401})
        }
        await createNimdaPuzzlePass()
        return NextResponse.json({puzzlePassed:true})
    } catch { return NextResponse.json({error:'Admin sign-in is temporarily unavailable.'},{status:503}) }
}
