import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateReply } from '@/lib/ai/generateReply'
import { qribloMasterReply } from '@/lib/ai/qribloMasterReply'
import { getDailyAiUsageState } from '@/lib/ai/usage'

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
                    .select('id, business_name, business_slug, plan, ai_welcome_msg, whatsapp_number')
                    .or(`business_slug.eq.${targetVendor},business_name.ilike.%${targetVendor}%`)
                    .limit(1)
                    .maybeSingle()

                if (vendor && vendor.plan === 'pro') {
                    return NextResponse.json({ 
                        reply: cleanReply || `Connecting you to ${vendor.business_name}...`,
                        vendorTakeover: {
                            id: vendor.id,
                            name: vendor.business_name,
                            slug: vendor.business_slug,
                            welcomeMsg: vendor.ai_welcome_msg,
                            whatsappNumber: vendor.whatsapp_number,
                        }
                    })
                }

                return NextResponse.json({
                    reply: cleanReply || `I could not find ${targetVendor} on Qriblo yet. Try the exact store name or ask me for similar vendors.`
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

        // Rate-limit check
        const usageState = getDailyAiUsageState(business)
        if (usageState.limitReached) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }

        await supabase
            .from('users')
            .update({
                ai_usage_count: usageState.nextUsage,
                ai_usage_limit: usageState.limit,
                ai_last_reset_at: usageState.shouldReset ? usageState.nowIso : business.ai_last_reset_at,
            })
            .eq('id', businessId)

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
