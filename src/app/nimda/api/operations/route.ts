import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getNimdaSession } from '@/lib/nimda/auth'

export const runtime='nodejs'
export async function PATCH(request: NextRequest) {
    const origin=request.headers.get('origin')
    if(!origin || new URL(origin).host!==request.headers.get('host')) return NextResponse.json({error:'Request not allowed.'},{status:403})
    const admin=await getNimdaSession()
    if(!admin) return NextResponse.json({error:'Sign in again to continue.'},{status:401})
    let body:{kind?:string;id?:string;status?:string}
    try {body=await request.json()} catch {return NextResponse.json({error:'Invalid request.'},{status:400})}
    if(!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) return NextResponse.json({error:'Invalid item.'},{status:400})
    const db=await createServiceClient()
    let result:any
    let action=''
    if(body.kind==='verification' && ['approved','rejected'].includes(body.status||'')) {
        result=await db.from('users').update({verification_status:body.status,is_verified:body.status==='approved'}).eq('id',body.id).select('id').maybeSingle()
        action=body.status==='approved'?'seller_verification_approved':'seller_verification_rejected'
    } else if(body.kind==='feedback' && ['reviewed','resolved','ignored'].includes(body.status||'')) {
        result=await db.from('feedback').update({status:body.status}).eq('id',body.id).select('id').maybeSingle()
        action=`feedback_${body.status}`
    } else return NextResponse.json({error:'That action is not available.'},{status:400})
    if(result.error) return NextResponse.json({error:'Could not save this change.'},{status:500})
    if(!result.data) return NextResponse.json({error:'This item could not be found.'},{status:404})
    const audit=await db.from('nimda_admin_audit').insert({admin_email:admin.email,action,subject_id:body.id,details:{kind:body.kind,status:body.status}})
    if(audit.error) return NextResponse.json({error:'Saved, but the audit record failed. Contact support before continuing.'},{status:500})
    return NextResponse.json({ok:true})
}
