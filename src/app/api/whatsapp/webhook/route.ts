/**
 * /api/whatsapp/webhook — Central Qriblo WhatsApp Number Handler
 *
 * HOW IT WORKS:
 * One Qriblo-owned WhatsApp number handles all vendors.
 * Buyers start a conversation and say the vendor's slug (e.g. "hi, tolas-kitchen")
 * or send it as their first message. The bot identifies the vendor and routes
 * all subsequent messages to that vendor's AI assistant.
 *
 * Session state is stored in `chat_sessions` table:
 *   - business_id links to the vendor
 *   - customer_phone identifies the buyer
 *   - messages stores full conversation history
 *   - A special `_current_business_slug` key in the first system message tracks routing
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateReply } from '@/lib/ai/generateReply'
import { qribloMasterReply } from '@/lib/ai/qribloMasterReply'
import { getDailyAiUsageState } from '@/lib/ai/usage'
import { normalizeCustomerConversation } from '@/lib/ai/customerConversation'
import { extractOrderSummary, stripOrderSummaries } from '@/lib/ai/orderSummary'

export const maxDuration = 30

const QRIBLO_WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const QRIBLO_WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const QRIBLO_WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

// ─── GET: Webhook verification by Meta ──────────────────────────────────────
export async function GET(req: Request) {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === QRIBLO_WA_VERIFY_TOKEN) {
        console.log('[WhatsApp Webhook] Verified successfully')
        return new NextResponse(challenge, { status: 200 })
    }
    console.error('[WhatsApp Webhook] Verification failed')
    return new NextResponse('Forbidden', { status: 403 })
}

// ─── POST: Handle incoming messages ─────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const body = await req.json()

        if (body.object !== 'whatsapp_business_account') {
            return new NextResponse('Not found', { status: 404 })
        }

        const entry = body.entry?.[0]
        const change = entry?.changes?.[0]?.value

        // Ignore status updates (read receipts, delivery notices)
        if (!change?.messages?.length) {
            return new NextResponse('OK', { status: 200 })
        }

        const message = change.messages[0]
        const customerPhone: string = message.from

        // Only handle text messages for now
        if (message.type !== 'text') {
            await sendWhatsAppMessage(customerPhone, "Sorry, I can only process text messages right now. Please type your request! 😊")
            return new NextResponse('OK', { status: 200 })
        }

        const incomingText: string = message.text.body.trim()
        const supabase = await createServiceClient()

        // ── Step 1: Find active session for this customer ────────────────────
        const { data: session } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('customer_phone', customerPhone)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single()

        let businessId: string | null = session?.business_id || null
        let messages: { role: 'user' | 'assistant', content: string }[] = session?.messages || []

        // ── Step 2: If no active session, route to Qriblo Master VA ───
        if (!businessId) {
            let aiReply: string
            try {
                aiReply = await qribloMasterReply([{ role: 'user', content: incomingText }])
            } catch (e: any) {
                console.error('[WhatsApp Master AI Error]', e)
                await sendWhatsAppMessage(customerPhone, "Sorry, I'm having trouble right now. Please try again! 😊")
                return new NextResponse('OK', { status: 200 })
            }

            // Check if Master VA wants to route to a vendor
            const routeMatch = aiReply.match(/\[(?:CONNECT_VENDOR|ROUTE_TO_VENDOR):\s*(.+?)\]/i)
            if (routeMatch) {
                const detectedName = routeMatch[1].trim()
                
                // First try exact slug match, then try ILIKE business_name
                let business = null
                const { data: bySlug } = await supabase
                    .from('users')
                    .select('id, business_name, plan, ai_welcome_msg, business_slug')
                    .eq('business_slug', detectedName)
                    .single()
                
                business = bySlug

                if (!business) {
                    const { data: byName } = await supabase
                        .from('users')
                        .select('id, business_name, plan, ai_welcome_msg, business_slug')
                        .ilike('business_name', `%${detectedName}%`)
                        .limit(1)
                        .single()
                    business = byName
                }

                if (!business) {
                    await sendWhatsAppMessage(
                        customerPhone,
                        `❌ I couldn't find a business called *${detectedName}* on Qriblo.\n\nPlease check the name and try again.`
                    )
                    return new NextResponse('OK', { status: 200 })
                }
                
                if (business.plan !== 'pro') {
                    await sendWhatsAppMessage(
                        customerPhone,
                        `Hi! 👋 *${business.business_name}* will get back to you shortly.\n\nIn the meantime, you can browse their catalog at: https://qriblo.com/${business.business_slug || detectedName}`
                    )
                    return new NextResponse('OK', { status: 200 })
                }

                // Start session with vendor
                businessId = business.id
                messages = []
                const welcome = business.ai_welcome_msg || `Hello! Welcome to *${business.business_name}*. How can I help you today?`
                
                // Strip the tag from the AI reply and prepend the switch message
                const cleanReply = aiReply.replace(/\[(?:CONNECT_VENDOR|ROUTE_TO_VENDOR):[\s\S]*?\]/gi, '').trim()
                let finalMsg = `🏪 Switched! You're now chatting with *${business.business_name}*.\n\n${welcome}`
                if (cleanReply) finalMsg = `${cleanReply}\n\n${finalMsg}`

                await sendWhatsAppMessage(customerPhone, finalMsg)

                await supabase.from('chat_sessions').upsert({
                    business_id: businessId,
                    customer_phone: customerPhone,
                    messages: [],
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'business_id,customer_phone' })

                return new NextResponse('OK', { status: 200 })
            }

            // No routing tag found, send the normal Master VA reply
            await sendWhatsAppMessage(customerPhone, aiReply)
            return new NextResponse('OK', { status: 200 })
        }

        // ── Step 3: Allow "switch vendor" command ────────────────────────────
        if (/^(switch|change|hi,?\s+|hello,?\s+)/i.test(incomingText)) {
            const newSlug = extractSlug(incomingText)
            if (newSlug && newSlug !== '') {
                const { data: newBusiness } = await supabase
                    .from('users')
                    .select('id, business_name, plan, ai_welcome_msg, business_slug')
                    .eq('business_slug', newSlug)
                    .single()

                if (newBusiness) {
                    if (newBusiness.plan === 'pro') {
                        businessId = newBusiness.id
                        messages = []
                        await supabase.from('chat_sessions').upsert({
                            business_id: businessId,
                            customer_phone: customerPhone,
                            messages: [],
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'business_id,customer_phone' })

                        const welcome = newBusiness.ai_welcome_msg || `Hello! Welcome to *${newBusiness.business_name}*. How can I help you today?`
                        await sendWhatsAppMessage(customerPhone, `🏪 Switched! You're now chatting with *${newBusiness.business_name}*.\n\n${welcome}`)
                        return new NextResponse('OK', { status: 200 })
                    } else {
                        await sendWhatsAppMessage(
                            customerPhone,
                            `Hi! 👋 *${newBusiness.business_name}* will get back to you shortly.\n\nIn the meantime, you can browse their catalog at: https://qriblo.com/${newBusiness.business_slug || newSlug}`
                        )
                        return new NextResponse('OK', { status: 200 })
                    }
                }
            }
        }

        // ── Step 4: Fetch the vendor's full profile + catalog ────────────────
        const { data: business } = await supabase
            .from('users')
            .select('*, products(id, name, price, description, is_active, in_stock, item_type)')
            .eq('id', businessId)
            .single()

        if (!business) {
            await sendWhatsAppMessage(customerPhone, `Sorry, this business is no longer available on WhatsApp. Please type a new business name to start over.`)
            await supabase.from('chat_sessions').delete().eq('business_id', businessId).eq('customer_phone', customerPhone)
            return new NextResponse('OK', { status: 200 })
        }

        if (business.plan !== 'pro') {
            await sendWhatsAppMessage(
                customerPhone,
                `Hi! 👋 *${business.business_name}* will get back to you shortly.\n\nIn the meantime, you can browse their catalog at: https://qriblo.com/${business.business_slug || 'dashboard'}`
            )
            return new NextResponse('OK', { status: 200 })
        }

        // ── Step 5: Rate limit check ─────────────────────────────────────────
        const usageState = getDailyAiUsageState(business)
        if (usageState.limitReached) {
            await sendWhatsAppMessage(customerPhone, `⚠️ ${business.business_name}'s AI assistant has reached today's chat limit. Please contact them directly at their Qriblo page.`)
            return new NextResponse('OK', { status: 200 })
        }

        // ── Step 6: Build message history + call AI ──────────────────────────
        messages.push({ role: 'user', content: incomingText })

        let aiReply: string
        let generatedReply = false
        try {
            aiReply = await generateReply(business, normalizeCustomerConversation(messages))
            generatedReply = true
        } catch (e: any) {
            console.error('[WhatsApp AI Error]', e)
            aiReply = "Sorry, I'm having trouble right now. Please try again in a moment! 🙏"
        }

        // A provider failure is not a customer conversation and must not use allowance.
        if (generatedReply) {
            await supabase
                .from('users')
                .update({
                    ai_usage_count: usageState.nextUsage,
                    ai_usage_limit: usageState.limit,
                    ai_last_reset_at: usageState.shouldReset ? usageState.nowIso : business.ai_last_reset_at,
                })
                .eq('id', businessId)
        }

        messages.push({ role: 'assistant', content: aiReply })

        // ── Step 7: Save updated session ─────────────────────────────────────
        await supabase.from('chat_sessions').upsert({
            business_id: businessId,
            customer_phone: customerPhone,
            messages,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id,customer_phone' })

        // ── Step 8: Parse ORDER_SUMMARY and save order ───────────────────────
        const orderSummary = extractOrderSummary(aiReply)
        if (orderSummary) {
            try {
                const orderData = orderSummary.value as Record<string, any>
                await supabase.from('orders').insert({
                    user_id: businessId,
                    customer_name: orderData.customer_name || 'WhatsApp Customer',
                    customer_contact: orderData.customer_contact || customerPhone,
                    items: orderData.items || [],
                    total_amount: orderData.total || 0,
                    order_method: 'whatsapp',
                    status: 'pending',
                    preferred_date: orderData.preferred_date || null,
                    preferred_time: orderData.preferred_time || null,
                })
                console.log(`[WhatsApp] Order saved for ${business.business_name}`)
            } catch (e) {
                console.error('[WhatsApp] Failed to parse order JSON', e)
            }
        }

        // Strip ORDER_SUMMARY tag from the message before sending to customer
        const cleanReply = stripOrderSummaries(aiReply)
        await sendWhatsAppMessage(customerPhone, cleanReply)

        return new NextResponse('OK', { status: 200 })

    } catch (e: any) {
        console.error('[WhatsApp Webhook Error]', e)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract a business slug from a message like:
 * "hi, tolas-kitchen" | "hello tolas-kitchen" | "tolas-kitchen" | "switch to musafix"
 */
function extractSlug(text: string): string | null {
    // Strip common greeting prefixes
    const cleaned = text
        .toLowerCase()
        .replace(/^(hi+|hello|hey|switch\s+to|change\s+to|connect\s+to|start)[,\s]+/i, '')
        .trim()

    // Match a slug pattern: lowercase letters, numbers, hyphens
    const match = cleaned.match(/^([a-z0-9][a-z0-9\-]{1,50})/)
    return match ? match[1] : null
}

/**
 * Send a WhatsApp text message via Meta Cloud API
 */
async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
    if (!QRIBLO_WA_TOKEN || !QRIBLO_WA_PHONE_ID) {
        console.error('[WhatsApp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID env vars')
        return
    }

    const url = `https://graph.facebook.com/v19.0/${QRIBLO_WA_PHONE_ID}/messages`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${QRIBLO_WA_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: false, body: text },
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        console.error('[WhatsApp Send Error]', err)
    }
}
