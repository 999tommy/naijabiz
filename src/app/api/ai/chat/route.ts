import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 30 // Allow longer timeout for AI

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://naijabiz.org'
const SITE_NAME = 'NaijaBiz'

export async function POST(req: Request) {
    try {
        if (!OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY is missing')
            return NextResponse.json({ error: 'AI Service Config Error' }, { status: 500 })
        }

        const { businessId, messages, isSandbox } = await req.json()

        if (!businessId || !messages) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createServiceClient()

        // 1. Fetch Business Info & Products/Services
        const { data: business, error: userError } = await supabase
            .from('users')
            .select('*, products(id, name, price, description, is_active, in_stock, item_type)')
            .eq('id', businessId)
            .single()

        if (userError || !business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }

        if (!isSandbox && business.plan !== 'pro') {
            return NextResponse.json({ error: 'AI is a Pro feature' }, { status: 403 })
        }

        if (!isSandbox && !business.ai_enabled) {
            return NextResponse.json({ error: 'AI is disabled' }, { status: 403 })
        }

        // Check Limit (100 per month default)
        const limit = business.ai_usage_limit || 100
        const usage = business.ai_usage_count || 0

        if (usage >= limit) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }

        // Increment usage
        const { data: incrementSuccess, error: rpcError } = await supabase.rpc('increment_ai_usage', { user_id: businessId })

        if (rpcError) {
            await supabase
                .from('users')
                .update({ ai_usage_count: usage + 1 })
                .eq('id', businessId)
        } else if (incrementSuccess === false) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }

        // 2. Build Catalog Context (Products & Services with Stock Status)
        const activeItems = (business.products || []).filter((p: any) => p.is_active !== false)

        const productsList = activeItems
            .filter((p: any) => p.item_type !== 'service')
            .map((p: any) => `- ${p.name}: ₦${Number(p.price).toLocaleString()} [${p.in_stock !== false ? 'IN STOCK' : 'OUT OF STOCK'}] (${p.description || 'No description'})`)
            .join('\n')

        const servicesList = activeItems
            .filter((p: any) => p.item_type === 'service')
            .map((p: any) => `- ${p.name}: ₦${Number(p.price).toLocaleString()} (${p.description || 'Service details'})`)
            .join('\n')

        const catalogContext = `
PRODUCTS CATALOG:
${productsList || 'No physical products currently listed.'}

SERVICES CATALOG:
${servicesList || 'No services currently listed.'}
`

        // Persona Guidelines
        let personaInstruction = "Tone: Warm, friendly, professional Nigerian English."
        if (business.ai_persona === 'pidgin') {
            personaInstruction = "Tone: Natural Nigerian Pidgin English (e.g. 'How far!', 'Welcome to our shop!', 'We get am for stock!'). Be enthusiastic, respectful, and sharp."
        } else if (business.ai_persona === 'formal') {
            personaInstruction = "Tone: Executive, polite, clear, and professional."
        }

        const businessContext = `
You are the dedicated AI Sales Assistant & Order Closer for "${business.business_name}".

BUSINESS DETAILS:
- Location: ${business.location || 'Nigeria'}
- About: ${business.description || 'Quality products & services.'}
- Business Type: ${business.business_type || 'Products & Services'}
- Owner's Special Directives: ${business.ai_instructions || 'Be helpful, answer questions accurately, and help customers place orders or book services.'}

${catalogContext}

YOUR MISSION & RULES:
1. Greets buyers warmly and answer inquiries about products, services, prices, and location.
2. Check Stock: If an item is [OUT OF STOCK], state politely that it is currently unavailable and suggest an [IN STOCK] alternative item.
3. Service Bookings: If the customer asks about a service, ask for their preferred date, time, and specific requirements.
4. Smart Upsell: When appropriate, politely suggest a complementary item or service (e.g., "Would you also like to add X?").
5. Order & Booking Capture:
   - When a buyer is ready to order or book, collect their item details, quantity/date, customer name, and delivery location/contact.
   - At the very end of your response when order details are clear, append a structured JSON order tag in this exact format:
     [ORDER_SUMMARY: {"items":[{"name":"Item Name","price":1000,"quantity":1}],"customer_name":"Buyer Name","delivery_address":"Lekki, Lagos","total":1000,"type":"product"}]
   - For services, set "type":"service" and place booking details inside delivery_address or notes.
6. Never make up prices that are not listed in the catalog.
7. Keep conversation turns concise (2-4 sentences max per message).
${personaInstruction}
`

        // 3. Call OpenRouter API with Gemini / High Performance model
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "system", "content": businessContext },
                    ...messages
                ],
                "temperature": 0.7,
                "max_tokens": 400
            })
        })

        if (!openRouterResponse.ok) {
            // Fallback to Llama 3.3 70B if Gemini flash is unavailable
            console.warn("Primary model failed, attempting fallback model...")
            const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_NAME,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "meta-llama/llama-3.3-70b-instruct",
                    "messages": [
                        { "role": "system", "content": businessContext },
                        ...messages
                    ],
                    "temperature": 0.7,
                    "max_tokens": 400
                })
            })

            if (!fallbackResponse.ok) {
                console.error("AI Fallback Error", await fallbackResponse.text())
                return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 502 })
            }

            const fallbackData = await fallbackResponse.json()
            const aiReply = fallbackData.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request."
            return NextResponse.json({ reply: aiReply })
        }

        const aiData = await openRouterResponse.json()
        const aiReply = aiData.choices?.[0]?.message?.content || "I'm sorry, I couldn't understand that."

        return NextResponse.json({ reply: aiReply })

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
