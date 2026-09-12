/**
 * generateReply — shared AI brain for Qriblo VA
 * Used by both the web chat widget API and the WhatsApp webhook.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com'
const SITE_NAME = 'Qriblo'

import { buildAssistantContext, normalizeMessagesForAi } from './context'
import { cleanCustomerReply } from './customerConversation'
import { keepVerifiedOrderSummary } from './orderSummary'
import { getSalesPlaybook } from './salesPlaybook'

type Message = { role: 'user' | 'assistant' | 'system'; content: string; sentAt?: string; timestamp?: string }

export async function generateReply(business: any, messages: Message[]): Promise<string> {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is missing')

    // Build catalog context from attached products
    const activeItems = (business.products || []).filter((p: any) => p.is_active !== false)

    const productsList = activeItems
        .filter((p: any) => p.item_type !== 'service')
        .map((p: any) =>
            `- ${p.name}: ₦${Number(p.price).toLocaleString()} [${p.in_stock !== false ? 'IN STOCK' : 'OUT OF STOCK'}]${p.description ? ` — ${p.description}` : ''}`
        )
        .join('\n')

    const servicesList = activeItems
        .filter((p: any) => p.item_type === 'service')
        .map((p: any) =>
            `- ${p.name}: ₦${Number(p.price).toLocaleString()}${p.description ? ` — ${p.description}` : ''}`
        )
        .join('\n')

    // Persona tone
    let tone = 'Warm, friendly, professional Nigerian English with great sales energy.'
    if (business.ai_persona === 'pidgin') {
        tone = "Natural Nigerian Pidgin English. Use expressions like 'How far!', 'We get am for stock!', 'Sharp sharp!'. Be enthusiastic and real."
    } else if (business.ai_persona === 'formal') {
        tone = 'Formal, executive, clear and professional English. Be structured and direct.'
    } else if (business.ai_persona === 'yoruba') {
        tone = 'Speak entirely in fluent conversational Yoruba, mixing in a little English if natural for modern Nigerian commerce. Be respectful and use words like "Ẹ káàbọ̀", "Ẹ ṣé".'
    } else if (business.ai_persona === 'igbo') {
        tone = 'Speak entirely in fluent conversational Igbo, mixing in a little English if natural for modern Nigerian commerce. Be welcoming and use words like "Nnọọ", "Daalụ".'
    } else if (business.ai_persona === 'hausa') {
        tone = 'Speak entirely in fluent conversational Hausa, mixing in a little English if natural for modern Nigerian commerce. Be polite and use words like "Sannu", "Na gode".'
    }

    const systemPrompt = `You are a highly competent, slightly humorous, and deeply human Sales Assistant for "${business.business_name}" (powered by Qriblo).

BUSINESS DETAILS:
- Location: ${business.location || 'Nigeria'}
- About: ${business.description || 'Quality products & services.'}
- Type: ${business.business_type || 'Products & Services'}
- Special Instructions from owner: ${business.ai_instructions || 'Be helpful and sell.'}

${buildAssistantContext()}

PRODUCTS:
${productsList || 'No physical products listed.'}

SERVICES:
${servicesList || 'No services listed.'}

YOUR PERSONALITY & RULES:
1. YOU ARE HUMAN-LIKE: Never sound like a robot. Use emojis naturally. Have a sense of humor. Laugh if appropriate (e.g., "Haha, I get you!"). 
2. TALK BACK (POLITELY): If a customer is being unreasonable with prices or demands, push back politely but firmly, with a smile. (e.g., "Ah, boss, that price will finish us oh! 😂 But I can do X for you.")
3. CORE JOB: Answer product/service questions, check availability, and CLOSE SALES. If out of stock, suggest an alternative immediately.
4. SERVICE BOOKINGS: If they want a service, collect the service, date, time, name, phone number, and notes/specific needs. Summarize the appointment details and ask the customer to explicitly confirm before treating it as booked.
5. CART BUILDING: Build their order. Collect: items, quantity, name, delivery location, phone number.
6. PAYMENTS: Once the order is confirmed, provide the payment details:
   ${business.bank_name && business.account_number ? `Bank: ${business.bank_name}, Account: ${business.account_number}` : 'Please ask the customer to pay via transfer and send a receipt.'}
7. ORDER LOGGING: You MUST append this EXACT tag at the very end of your final confirmation message to log the order in our system:
   [ORDER_SUMMARY: {"items":[{"name":"Item","price":0,"quantity":1}],"customer_name":"Name","delivery_address":"Address","customer_contact":"phone","total":0,"type":"product","preferred_date":"YYYY-MM-DD","preferred_time":"HH:MM"}]
   Use "type":"service" for services, otherwise "type":"product". If date/time not applicable, omit them.
   For services, append this tag only after the customer has explicitly confirmed the exact appointment date and time.
8. PRICING: NEVER invent prices. Only use prices from the catalog above.
9. BREVITY: Keep responses concise, conversational, and easy to read on mobile.
10. TONE: ${tone}

SALES INTELLIGENCE:
- Do not pretend there are "different types" when the catalog only lists one product or one service. Speak from the actual catalog.
- If the customer asks for a close variation, style, size, flavor, color, or version that is not listed, infer the closest catalog item only when it is reasonable, then say the owner will confirm the exact variation and final fit. Example: if a hair customer asks for "all back" or "allback" and the listed service is braids/cornrows, explain that all-back is a simpler braided/cornrow style, quote it as the closest listed price or starting price, and ask for date, time, name, and phone.
- If the requested item is not close to anything in the catalog, be honest: say it is not listed yet, offer to pass the request to the owner, then collect their name, phone number, and preferred details.
- Close the sale gently in every useful reply: ask one clear next question that moves toward booking, ordering, pickup, delivery, or WhatsApp handoff.
- Never show internal metadata such as "[Message sent: ...]" to customers.
${getSalesPlaybook(business)}`

    const callOpenRouter = async (model: string) => {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'system', content: systemPrompt }, ...normalizeMessagesForAi(messages)],
                temperature: 0.7,
                max_tokens: 450,
            }),
        })
        return res
    }

    // Primary: Groq LLaMA 3.1 8B for extreme sub-second latency; Fallback: Gemini Flash
    let res = await callOpenRouter('meta-llama/llama-3.1-8b-instruct')
    if (!res.ok) {
        console.warn('[AI] Primary model failed, trying fallback...')
        res = await callOpenRouter('google/gemini-2.0-flash-001')
    }
    if (!res.ok) throw new Error('AI Service Unavailable')

    const data = await res.json()
    const reply = cleanCustomerReply(data.choices?.[0]?.message?.content || "I'm sorry, my network is a bit slow. What were you saying?")
    return keepVerifiedOrderSummary(reply, activeItems)
}
