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
            
            // Check for in-chat vendor takeover tag
            const vendorTagMatch = reply.match(/\[(?:CONNECT_VENDOR|ROUTE_TO_VENDOR):\s*(.+?)\]/i)
            if (vendorTagMatch) {
                const targetVendor = vendorTagMatch[1].trim()
                const cleanReply = reply.replace(/\[(?:CONNECT_VENDOR|ROUTE_TO_VENDOR):[\s\S]*?\]/gi, '').trim()

                const supabase = await createServiceClient()
                const { data: vendor } = await supabase
                    .from('users')
                    .select('id, business_name, business_slug, plan, ai_welcome_msg')
                    .or(`business_slug.eq.${targetVendor},business_name.ilike.%${targetVendor}%`)
                    .limit(1)
                    .maybeSingle()

                if (vendor) {
                    return NextResponse.json({ 
                        reply: cleanReply || `Connecting you to ${vendor.business_name}...`,
                        vendorTakeover: {
                            id: vendor.id,
                            name: vendor.business_name,
                            slug: vendor.business_slug,
                            welcomeMsg: vendor.ai_welcome_msg
                        }
                    })
                }

                return NextResponse.json({ 
                    reply: cleanReply,
                    vendorTakeover: {
                        id: targetVendor,
                        name: targetVendor,
                        slug: targetVendor.toLowerCase().replace(/\s+/g, '-')
                    }
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
