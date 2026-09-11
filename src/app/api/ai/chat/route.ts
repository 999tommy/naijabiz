import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateReply } from '@/lib/ai/generateReply'
import { qribloMasterReply } from '@/lib/ai/qribloMasterReply'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { businessId, messages, isSandbox } = await req.json()

        if (!messages) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Handle Qriblo Master VA request
        if (!businessId || businessId === 'qriblo-master') {
            const reply = await qribloMasterReply(messages)
            
            // Check for routing tag to handle in the frontend
            const routeMatch = reply.match(/\[ROUTE_TO_VENDOR:\s*(.+?)\]/i)
            if (routeMatch) {
                return NextResponse.json({ 
                    reply: reply.replace(/\[ROUTE_TO_VENDOR:[\s\S]*?\]/gi, '').trim() || `Routing you to ${routeMatch[1]}...`,
                    routeToVendor: routeMatch[1].trim() 
                })
            }
            return NextResponse.json({ reply })
        }

        const supabase = await createServiceClient()

        // Fetch business + product catalog
        const { data: business, error: userError } = await supabase
            .from('users')
            .select('*, products(id, name, price, description, is_active, in_stock, item_type)')
            .eq('id', businessId)
            .single()

        if (userError || !business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }

        // Gate checks (sandbox bypasses plan checks for testing)
        if (!isSandbox && business.plan !== 'pro') {
            return NextResponse.json({ error: 'AI is a Pro feature' }, { status: 403 })
        }

        // Rate-limit check
        const limit = business.ai_usage_limit || 100
        const usage = business.ai_usage_count || 0
        if (usage >= limit) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }

        // Increment usage counter
        const { data: incOk, error: rpcError } = await supabase.rpc('increment_ai_usage', { user_id: businessId })
        if (rpcError || incOk === false) {
            await supabase.from('users').update({ ai_usage_count: usage + 1 }).eq('id', businessId)
        }

        const reply = await generateReply(business, messages)
        return NextResponse.json({ reply })

    } catch (error: any) {
        console.error('[AI Chat Route]', error)
        if (error.message === 'AI Service Unavailable') {
            return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 502 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
