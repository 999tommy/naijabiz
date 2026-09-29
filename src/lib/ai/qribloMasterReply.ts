import { createServiceClient } from '@/lib/supabase/server'
import { buildAssistantContext, normalizeMessagesForAi } from './context'
import { searchMarketplace, formatForAI, hasShoppingIntent, type MarketplaceResult } from '@/lib/marketplace/search'
import type { ProductRecommendation } from './types'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com'
const SITE_NAME = 'Qriblo'

type Message = { role: 'user' | 'assistant' | 'system'; content: string; sentAt?: string; timestamp?: string }
export type MasterAssistantResponse = { reply: string; recommendations: ProductRecommendation[] }

export async function qribloMasterResponse(messages: Message[]): Promise<MasterAssistantResponse> {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is missing')

    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || ''
    
    // Extract keywords (words longer than 3 chars) for product search
    const searchStopWords = new Set(['about', 'after', 'also', 'around', 'available', 'below', 'budget', 'buy', 'find', 'for', 'from', 'have', 'help', 'less', 'looking', 'maximum', 'million', 'more', 'need', 'not', 'order', 'please', 'price', 'recommend', 'that', 'than', 'this', 'thousand', 'under', 'up', 'want', 'with', 'where'])
    const keywords = lastUserMsg.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).map(word => word.toLowerCase()).filter(word => word.length > 2 && /[a-z]/.test(word) && !searchStopWords.has(word))
    const budgetCap = extractBudgetCap(lastUserMsg)
    const orQuery = keywords.length > 0 ? keywords.flatMap(k => [`name.ilike.%${k}%`, `description.ilike.%${k}%`]).join(',') : ''

    const supabase = await createServiceClient()
    const intent = await classifyIntent(lastUserMsg)
    const shoppingIntent = intent === 'shopping' || intent === 'booking'

    // Parallel fetch: internal directory & catalog
    const [businessesRes, productsRes] = await Promise.all([
        supabase.from('users').select('business_name, business_slug, location, service_area, payment_methods').eq('plan', 'pro').limit(50),
        orQuery ? supabase.from('products').select('id, name, price, description, image_url, in_stock, item_type, updated_at, users!inner(id, business_name, business_slug, whatsapp_number, location, service_area, payment_methods)').eq('is_active', true).or(orQuery).order('updated_at', { ascending: false }).limit(10) : Promise.resolve({ data: [] }),
    ])

    const fetchedProducts = productsRes.data || []
    const products: any[] = (budgetCap == null ? fetchedProducts : fetchedProducts.filter((product: any) => Number(product.price) <= budgetCap)).map((product: any) => ({ ...product, seller: Array.isArray(product.users) ? product.users[0] : product.users }))

    // RAG & External Marketplace Intelligence
    let externalResults: MarketplaceResult[] = []
    let externalSources: string[] = []

    const sellerIds = [...new Set(products.map((product: any) => product.seller?.id).filter(Boolean))]
    const sellerOrderStats = new Map<string, { medianResponseHours?: number; completedRate?: number; sampleSize: number }>()
    if (sellerIds.length) {
        const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        const { data: sellerOrders } = await supabase.from('orders').select('user_id, status, created_at, seller_responded_at').in('user_id', sellerIds).gte('created_at', since).limit(1000)
        const accumulators = new Map<string, { responseHours: number[]; completed: number; resolved: number }>()
        for (const order of sellerOrders || []) {
            const current = accumulators.get(order.user_id) || { responseHours: [], completed: 0, resolved: 0 }
            if (order.seller_responded_at) current.responseHours.push(Math.max(0, (new Date(order.seller_responded_at).getTime() - new Date(order.created_at).getTime()) / 3600000))
            if (order.status === 'completed' || order.status === 'cancelled') current.resolved++
            if (order.status === 'completed') current.completed++
            accumulators.set(order.user_id, current)
        }
        for (const [sellerId, stats] of accumulators) {
            const sortedHours = stats.responseHours.sort((a, b) => a - b)
            sellerOrderStats.set(sellerId, {
                medianResponseHours: sortedHours.length >= 3 ? Math.round(sortedHours[Math.floor(sortedHours.length / 2)] * 10) / 10 : undefined,
                completedRate: stats.resolved >= 5 ? Math.round(stats.completed / stats.resolved * 100) : undefined,
                sampleSize: stats.resolved,
            })
        }
    }
    const productRelevance = (product: any) => keywords.reduce((score, keyword) => {
        const name = String(product.name || '').toLowerCase()
        const description = String(product.description || '').toLowerCase()
        return score + (name.includes(keyword) ? 3 : description.includes(keyword) ? 1 : 0)
    }, 0)
    const byRelevanceAndResponse = (a: any, b: any) => {
        const relevanceOrder = productRelevance(b) - productRelevance(a)
        if (relevanceOrder) return relevanceOrder
        const aHours = sellerOrderStats.get(a.seller?.id)?.medianResponseHours
        const bHours = sellerOrderStats.get(b.seller?.id)?.medianResponseHours
        return aHours != null && bHours != null ? aHours - bHours : 0
    }
    const availableQribloProducts = products.filter((product: any) => product.in_stock === true).sort(byRelevanceAndResponse)
    const unknownStockQribloProducts = products.filter((product: any) => product.in_stock == null).sort(byRelevanceAndResponse)
    const unavailableQribloProducts = products.filter((product: any) => product.in_stock === false).sort(byRelevanceAndResponse)
    const inStockQribloProducts = availableQribloProducts
    const rankedQribloProducts = [...availableQribloProducts, ...unknownStockQribloProducts, ...unavailableQribloProducts]

    // Use external marketplaces only when Qriblo has no active, available seller match.
    if (intent === 'shopping' && inStockQribloProducts.length === 0) {
        // Step 1: Check vector store cache (instant semantic similarity match)
        const { searchVectorProducts, saveDiscoveredProducts } = await import('@/lib/marketplace/vectorStore')
        const cachedProducts = await searchVectorProducts(lastUserMsg, 0.68, 6)

        const freshCachedProducts = cachedProducts.filter(isFreshExternalListing)
        if (freshCachedProducts.length >= 3) {
            externalResults = freshCachedProducts
            externalSources = [...new Set(freshCachedProducts.map(p => p.source))]
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

    // Respect an explicit Naira budget when an external listing clearly states a Naira price.
    // Unknown currency/price stays discoverable, but is clearly marked as unverified against budget.
    if (budgetCap != null) {
        externalResults = externalResults.filter(product => {
            const nairaPrice = parseExplicitNairaPrice(product.price)
            return nairaPrice == null || nairaPrice <= budgetCap
        })
        externalSources = [...new Set(externalResults.map(product => product.source))]
    }

    const businesses = businessesRes.data
    const externalMarketplace = shoppingIntent && externalResults.length > 0
        ? formatForAI({ results: externalResults, sources: externalSources, query: lastUserMsg })
        : ''

    const vendorContext = businesses && businesses.length > 0
        ? `\nHere are some of the active businesses on Qriblo:\n` + businesses.map(b => `- ${b.business_name} (slug: ${b.business_slug}; service area: ${b.service_area || b.location || 'not provided'}; accepted payments: ${b.payment_methods?.join(', ') || 'ask seller'})`).join('\n')
        : ''

    const productContext = rankedQribloProducts.length > 0
        ? `\nMARKETPLACE CONTEXT (Products found on Qriblo matching user query):\n` + rankedQribloProducts.slice(0, 8).map((p: any) => `- "${p.name}" for ₦${p.price?.toLocaleString()} at ${p.seller?.business_name} (slug: ${p.seller?.business_slug}; availability: ${p.in_stock === true ? 'in stock' : p.in_stock === false ? 'out of stock' : 'not provided; ask seller'}; service area: ${p.seller?.service_area || p.seller?.location || 'not provided'}; payment methods: ${p.seller?.payment_methods?.join(', ') || 'ask seller'})`).join('\n')
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
3. QRIBLO-FIRST: Prioritize the most relevant Qriblo seller listings, ranked by catalog match, seller-marked stock status, and seller response/fulfillment history when there is enough history. Treat Qriblo listings marked in stock as available until the seller changes that status; do not ask the customer or seller to reconfirm. Mention price, seller, service area, and accepted payments only when listed.
4. EXTERNAL MARKETPLACE DISCOVERY: Qriblo's active seller catalog is the source of truth and must be checked first. Only if it has no suitable match may you use the EXTERNAL MARKETPLACE RESULTS below. Keep outside listings secondary and say their stock and prices can change and are not verified by Qriblo. If a customer gave a budget, only say a listing fits when its explicit Naira price is within budget; for unknown or foreign currency prices, say the budget fit is unverified.
5. NEVER MAKE THINGS UP: Only recommend products in the contexts below. If nothing is found, give honest shopping tips.
   For Qriblo listings, trust the seller’s in-stock or out-of-stock setting until it changes. If stock status is unknown, ask the seller. Never promise delivery coverage, fees, dates, or payment methods beyond the seller-provided context. If the customer has not shared a decision-critical detail (such as size, area, quantity, budget, or preferred appointment time), ask one concise follow-up.
   Understand Nigerian shopping language: tokunbo/fairly used means pre-owned, 'original' means the customer cares about authenticity, and '20k' means a ₦20,000 budget cap unless context says otherwise. Do not claim authenticity or condition unless the seller listed it. Ask location before promising coverage.
6. IN-CHAT VENDOR HANDOVER: If the user wants to order from a specific Qriblo brand (e.g. "Take me to Tola's Kitchen"), append:
   [CONNECT_VENDOR: vendor_name_or_slug]
   Example: "Connecting you with Tola's Kitchen! 🚀 [CONNECT_VENDOR: tolas-kitchen]"
7. DEAL HUNTING: For Temu/Shein, mention they ship to Nigeria. For Nigerian vendors, emphasize faster local delivery.

${vendorContext}
${productContext}

${externalMarketplace}

Be clear about which information came from Qriblo seller profiles and which comes from outside listings. Never imply an outside listing is verified by Qriblo.`

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
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I didn't quite catch that. Could you repeat it? 😅"
    const recommendations: ProductRecommendation[] = []
    if (shoppingIntent) {
        for (const p of rankedQribloProducts.slice(0, 5)) {
            const slug = p.seller?.business_slug
            if (!slug) continue
            const itemType = p.item_type === 'service' ? 'service' : 'product'
            recommendations.push({
                id: `qriblo-${p.id}`, title: p.name, price: p.price == null ? null : `₦${Number(p.price).toLocaleString()}`,
                source: p.seller?.business_name || 'Qriblo seller', link: `/${slug}`, imageUrl: p.image_url || undefined,
                snippet: p.description || undefined,
                availability: p.in_stock === true ? 'in_stock' : p.in_stock === false ? 'out_of_stock' : 'unknown', external: false,
                sellerSlug: slug, sellerWhatsapp: normalizeNigerianWhatsApp(p.seller?.whatsapp_number),
                serviceArea: p.seller?.service_area || p.seller?.location || undefined,
                paymentMethods: p.seller?.payment_methods || [], itemType, updatedAt: p.updated_at || undefined,
                sellerMedianResponseHours: sellerOrderStats.get(p.seller?.id)?.medianResponseHours,
                sellerCompletedRate: sellerOrderStats.get(p.seller?.id)?.completedRate,
                sellerOrderSampleSize: sellerOrderStats.get(p.seller?.id)?.sampleSize,
            })
        }
        for (const p of (intent === 'shopping' && inStockQribloProducts.length === 0 ? externalResults.slice(0, 3) : [])) {
            let url: URL
            try { url = new URL(p.link) } catch { continue }
            if (url.protocol !== 'https:') continue
            recommendations.push({
                id: `external-${recommendations.length}-${url.hostname}-${p.title.slice(0, 24)}`,
                title: p.title, price: p.price, source: p.source, link: url.toString(),
                imageUrl: isSafeHttpsUrl(p.imageUrl) ? p.imageUrl : undefined,
                snippet: p.snippet, availability: 'unknown', external: true, updatedAt: p.updatedAt,
            })
        }
    }
    const unique = recommendations.filter((item, index, all) => all.findIndex(other => other.link === item.link && other.title === item.title) === index).slice(0, 8)
    return { reply, recommendations: unique }
}

type QribloIntent = 'shopping' | 'booking' | 'support' | 'general'

async function classifyIntent(message: string): Promise<QribloIntent> {
    if (/\b(book|booking|appointment|available slot|schedule)\b/i.test(message)) return 'booking'
    if (hasShoppingIntent(message)) return 'shopping'
    if (process.env.JEV_ENABLED === 'true' && OPENROUTER_API_KEY && message.trim()) {
        try {
            // Only pass this one message and remove obvious contact details before routing classification.
            const state = message.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]').replace(/(?:\+?\d[\d\s()-]{7,}\d)/g, '[phone]').slice(0, 1200)
            const response = await fetch('https://openrouter.ai/api/alpha/decisions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'typesafe/jev-1.13', state,
                    questions: { intent: { type: 'choice', instructions: 'Choose the main task the customer wants next.', criteria: {
                        shopping: 'Find, compare, or buy a physical product or goods.',
                        booking: 'Request or discuss a service, appointment, or available time.',
                        support: 'Get human help, ask about an existing order, payment, delivery, or seller-specific issue.',
                        general: 'Ask about Qriblo or have a general conversation without a product purchase or service booking.'
                    } } }
                }),
                signal: AbortSignal.timeout(1800),
            })
            if (response.ok) {
                const data = await response.json()
                const answer = data.answers?.intent
                if (answer?.confidence >= 0.78 && ['shopping', 'booking', 'support', 'general'].includes(answer.choice)) return answer.choice
            }
        } catch (error) {
            console.warn('[Jev] Intent classification unavailable; using fallback', error)
        }
    }
    return 'general'
}

function extractBudgetCap(text: string): number | null {
    const cue = text.match(/(?:under|below|less than|up to|within|budget(?: of)?|maximum|max(?:imum)?|not more than)\s*₦?\s*([\d,]+(?:\.\d+)?)\s*(k|m|thousand|million)?\b/i)
    const shorthand = text.match(/\b([\d,.]+)\s*(k|thousand|m|million)\b/i)
    const raw = cue || shorthand
    if (!raw) return null
    const amount = Number(raw[1].replace(/,/g, ''))
    if (!Number.isFinite(amount) || amount <= 0) return null
    const suffix = (raw[2] || '').toLowerCase()
    const multiplier = suffix === 'k' || suffix === 'thousand' ? 1000 : suffix === 'm' || suffix === 'million' ? 1000000 : 1
    const cap = amount * multiplier
    return cap <= 1000000000 ? cap : null
}

function parseExplicitNairaPrice(value: string | null | undefined): number | null {
    if (!value || /[$€£]|\b(?:USD|EUR|GBP)\b/i.test(value)) return null
    const match = value.match(/(?:₦|\bNGN\b)\s*([\d,]+(?:\.\d+)?)\s*(k|m|thousand|million)?\b/i)
    if (!match) return null
    const amount = Number(match[1].replace(/,/g, ''))
    if (!Number.isFinite(amount) || amount <= 0) return null
    const suffix = (match[2] || '').toLowerCase()
    const multiplier = suffix === 'k' || suffix === 'thousand' ? 1000 : suffix === 'm' || suffix === 'million' ? 1000000 : 1
    const price = amount * multiplier
    return price <= 1000000000 ? price : null
}

function normalizeNigerianWhatsApp(value?: string | null): string | undefined {
    if (!value) return undefined
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('234')) return digits
    if (digits.startsWith('0')) return `234${digits.slice(1)}`
    if (digits.length === 10) return `234${digits}`
    return digits || undefined
}

function isFreshExternalListing(product: MarketplaceResult): boolean {
    if (!product.updatedAt) return false
    const updatedAt = new Date(product.updatedAt).getTime()
    return Number.isFinite(updatedAt) && Date.now() - updatedAt <= 7 * 24 * 60 * 60 * 1000
}
export async function qribloMasterReply(messages: Message[]): Promise<string> {
    return (await qribloMasterResponse(messages)).reply
}

function isSafeHttpsUrl(value?: string): value is string {
    if (!value) return false
    try { return new URL(value).protocol === 'https:' } catch { return false }
}
