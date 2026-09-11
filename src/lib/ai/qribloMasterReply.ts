import { createServiceClient } from '@/lib/supabase/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com'
const SITE_NAME = 'Qriblo'

type Message = { role: 'user' | 'assistant' | 'system'; content: string }

export async function qribloMasterReply(messages: Message[]): Promise<string> {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is missing')

    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || ''
    
    // Extract keywords (words longer than 3 chars) for product search
    const keywords = lastUserMsg.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
    const orQuery = keywords.length > 0 ? keywords.map(k => `name.ilike.%${k}%`).join(',') : ''

    const supabase = await createServiceClient()
    
    // Run both queries in parallel
    const [businessesRes, productsRes] = await Promise.all([
        supabase.from('users').select('business_name, business_slug').eq('plan', 'pro').limit(50),
        orQuery ? supabase.from('products').select('name, price, users!inner(business_name, business_slug, plan)').eq('is_active', true).eq('users.plan', 'pro').or(orQuery).limit(5) : Promise.resolve({ data: [] })
    ])

    const businesses = businessesRes.data
    const products = productsRes.data

    const vendorContext = businesses && businesses.length > 0
        ? `\nHere are some of the active businesses on Qriblo:\n` + businesses.map(b => `- ${b.business_name} (slug: ${b.business_slug})`).join('\n')
        : ''

    const productContext = products && products.length > 0
        ? `\nMARKETPLACE CONTEXT (Products found on Qriblo matching user query):\n` + products.map((p: any) => `- "${p.name}" for ₦${p.price?.toLocaleString()} at ${p.users?.business_name} (slug: ${p.users?.business_slug})`).join('\n')
        : '\nMARKETPLACE CONTEXT: No matching products found in the Qriblo marketplace for this query.'

    const systemPrompt = `You are the Qriblo Master Assistant. You are incredibly smooth, fast, and human-like. NO ONE MUST EVER THINK YOU ARE AN AI. You are a highly intelligent concierge for Qriblo.

WHAT IS QRIBLO?
- Qriblo is the Operating System for African Commerce.
- It gives vendors a branded storefront, a built-in CRM, advanced analytics, and their own Virtual Assistant to handle sales on autopilot.
- Buyers can discover vendors, shop seamlessly, and chat with vendors directly.

YOUR RULES:
1. HUMAN TONE: Speak naturally, use emojis casually, be extremely polite, helpful, and slightly humorous. If asked how you are, reply naturally like a human.
2. ANSWER QRIBLO QUESTIONS: Answer questions about Qriblo, how to register (go to qriblo.com/signup), how to login, what the features are, pricing (Free tier, and Pro tier at ₦2,500/mo), etc.
3. BE A GLOBAL SHOPPING ASSISTANT: If the user wants to buy something or asks for recommendations:
   - Check the "MARKETPLACE CONTEXT" below first. If a matching product exists on Qriblo, enthusiastically recommend it! Mention the vendor's name and price.
   - If no products match in Qriblo, DO NOT say "I can't help". Instead, use your vast general knowledge to suggest popular real-world brands, general price estimates, or advice on where to buy it outside of Qriblo. But make it clear they are general recommendations outside Qriblo.
4. ROUTING TO VENDORS (CRITICAL): If the user's message indicates they want to talk to, shop from, or find a specific vendor/brand, OR if you are recommending a product found in the MARKETPLACE CONTEXT, YOU MUST NOT try to act as that vendor. 
   Instead, you MUST append the following exact tag at the very end of your message:
   [ROUTE_TO_VENDOR: vendor_name]
   
   Replace "vendor_name" with the exact name or slug of the business.
   If you output this tag, keep the rest of your message extremely brief, e.g., "Connecting you to them right away! 🚀 [ROUTE_TO_VENDOR: Tolas Kitchen]"

${vendorContext}
${productContext}

Remember: Be smooth, natural, recommend products intelligently, and route users accurately!`

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
                messages: [{ role: 'system', content: systemPrompt }, ...messages],
                temperature: 0.7,
                max_tokens: 300,
            }),
        })
        return res
    }

    let res = await callOpenRouter('meta-llama/llama-3.1-8b-instruct')
    if (!res.ok) {
        console.warn('[AI] Primary model failed, trying fallback...')
        res = await callOpenRouter('google/gemini-2.0-flash-001')
    }
    if (!res.ok) throw new Error('AI Service Unavailable')

    const data = await res.json()
    return data.choices?.[0]?.message?.content || "I'm sorry, I didn't quite catch that. Could you repeat it? 😅"
}
