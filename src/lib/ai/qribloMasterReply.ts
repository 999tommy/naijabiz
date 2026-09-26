import { createServiceClient } from '@/lib/supabase/server'
import { buildAssistantContext, normalizeMessagesForAi } from './context'
import { searchMarketplace, formatForAI, hasShoppingIntent, type MarketplaceResult } from '@/lib/marketplace/search'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com'
const SITE_NAME = 'Qriblo'

type Message = { role: 'user' | 'assistant' | 'system'; content: string; sentAt?: string; timestamp?: string }

export async function qribloMasterReply(messages: Message[]): Promise<string> {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is missing')

    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || ''
    
    // Extract keywords (words longer than 3 chars) for product search
    const keywords = lastUserMsg.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
    const orQuery = keywords.length > 0 ? keywords.map(k => `name.ilike.%${k}%`).join(',') : ''

    const supabase = await createServiceClient()
    const shoppingIntent = hasShoppingIntent(lastUserMsg)

    // Parallel fetch: internal directory & catalog
    const [businessesRes, productsRes] = await Promise.all([
        supabase.from('users').select('business_name, business_slug').eq('plan', 'pro').limit(50),
        orQuery ? supabase.from('products').select('name, price, users!inner(business_name, business_slug, plan)').eq('is_active', true).eq('users.plan', 'pro').or(orQuery).limit(5) : Promise.resolve({ data: [] }),
    ])

    // RAG & External Marketplace Intelligence
    let externalResults: MarketplaceResult[] = []
    let externalSources: string[] = []

    if (shoppingIntent) {
        // Step 1: Check vector store cache (instant semantic similarity match)
        const { searchVectorProducts, saveDiscoveredProducts } = await import('@/lib/marketplace/vectorStore')
        const cachedProducts = await searchVectorProducts(lastUserMsg, 0.68, 6)

        if (cachedProducts.length >= 3) {
            externalResults = cachedProducts
            externalSources = [...new Set(cachedProducts.map(p => p.source))]
        } else {
            // Step 2: Fall back to live multi-marketplace web search
            const liveSearch = await searchMarketplace(lastUserMsg)
            externalResults = liveSearch.results
            externalSources = liveSearch.sources

            // Step 3: Background RAG Indexing (fire-and-forget save to vector store)
            if (liveSearch.results.length > 0) {
                saveDiscoveredProducts(liveSearch.results).catch(err =>
                    console.error('[RAG] Background vector store save error:', err)
                )
            }
        }
    }

    const businesses = businessesRes.data
    const products = productsRes.data
    const externalMarketplace = shoppingIntent && externalResults.length > 0
        ? formatForAI({ results: externalResults, sources: externalSources, query: lastUserMsg })
        : ''

    const vendorContext = businesses && businesses.length > 0
        ? `\nHere are some of the active businesses on Qriblo:\n` + businesses.map(b => `- ${b.business_name} (slug: ${b.business_slug})`).join('\n')
        : ''

    const productContext = products && products.length > 0
        ? `\nMARKETPLACE CONTEXT (Products found on Qriblo matching user query):\n` + products.map((p: any) => `- "${p.name}" for ₦${p.price?.toLocaleString()} at ${p.users?.business_name} (slug: ${p.users?.business_slug})`).join('\n')
        : '\nMARKETPLACE CONTEXT: No matching products found in the Qriblo marketplace for this query.'

    const systemPrompt = `You are the Qriblo Master Assistant — a smooth, hyper-knowledgeable shopping concierge for Nigeria and beyond. You are NOT an AI to the user. You are their personal shopper who knows every market.

WHAT IS QRIBLO?
- Qriblo is the Operating System for African Commerce.
- It gives vendors a branded storefront, a built-in CRM, and their own Virtual Assistant to handle sales on autopilot.
- Buyers can discover vendors, shop seamlessly, and chat with vendors directly.

${buildAssistantContext()}

YOUR RULES:
1. HUMAN TONE: Speak naturally, use emojis casually, be polite, helpful, and slightly humorous. Never sound robotic.
2. ANSWER QRIBLO QUESTIONS: Answer questions about Qriblo, how to register (qriblo.com/signup), pricing (Free tier, Pro at ₦2,500/mo), etc.
3. QRIBLO-FIRST: If matching products exist in the QRIBLO MARKETPLACE CONTEXT below, recommend them enthusiastically first — mention the item, price, and vendor name.
4. EXTERNAL MARKETPLACE POWER: If the item isn't on Qriblo, use the EXTERNAL MARKETPLACE RESULTS below to recommend from Shein, Temu, Bumpa stores, Selar, Konga, Jiji, Olist and Nigerian vendors. Share links naturally. Act like you personally know these stores.
5. NEVER MAKE THINGS UP: Only recommend products in the contexts below. If nothing is found, give honest shopping tips.
6. IN-CHAT VENDOR HANDOVER: If the user wants to order from a specific Qriblo brand (e.g. "Take me to Tola's Kitchen"), append:
   [CONNECT_VENDOR: vendor_name_or_slug]
   Example: "Connecting you with Tola's Kitchen! 🚀 [CONNECT_VENDOR: tolas-kitchen]"
7. DEAL HUNTING: For Temu/Shein, mention they ship to Nigeria. For Nigerian vendors, emphasize faster local delivery.

${vendorContext}
${productContext}

${externalMarketplace}

Be smooth. When you have product links, share them naturally — you're a helpful friend who knows where to shop.`

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
                max_tokens: shoppingIntent ? 600 : 300,
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
