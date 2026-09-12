import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateReply } from '@/lib/ai/generateReply'
import { qribloMasterReply } from '@/lib/ai/qribloMasterReply'
import { getDailyAiUsageState } from '@/lib/ai/usage'
import { normalizeCustomerConversation } from '@/lib/ai/customerConversation'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { businessId, messages, isSandbox } = await req.json()

        const conversation = normalizeCustomerConversation(messages)
        if (conversation.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Handle Qriblo Master VA request
        if (!businessId || businessId === 'qriblo-master') {
            const reply = await qribloMasterReply(conversation)
            
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

        // Dashboard testing is free for the owner, but it is never a public quota bypass.
        if (isSandbox) {
            const authClient = await createClient()
            const { data: { user } } = await authClient.auth.getUser()
            if (!user || user.id !== businessId) {
                return NextResponse.json({ error: 'Unauthorized sandbox request' }, { status: 403 })
            }
        }

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
        if (!isSandbox && usageState.limitReached) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }

        const reply = await generateReply(business, conversation)

        // Do not charge a business for a failed provider call or an owner test.
        if (!isSandbox) {
            await supabase
                .from('users')
                .update({
                    ai_usage_count: usageState.nextUsage,
                    ai_usage_limit: usageState.limit,
                    ai_last_reset_at: usageState.shouldReset ? usageState.nowIso : business.ai_last_reset_at,
                })
                .eq('id', businessId)
        }
        return NextResponse.json({ reply })

    } catch (error: any) {
        console.error('[AI Chat Route]', error)
        if (error.message === 'AI Service Unavailable') {
            return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 502 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
