/**
 * Marketplace Search — Qriblo VA External Product Intelligence
 *
 * Uses Serper.dev (Google Search API) to search across:
 * - Shein (global fashion)
 * - Temu (global value marketplace)
 * - Nigerian storefronts: Bumpa, Selar, Flutterwave Store, Paystack Commerce,
 *   Olist, Konga, VConnect, Fashpa, Printivo, Jiji, OLX Nigeria, and many more
 *
 * Only fires when shopping intent is detected. Free tier = 2,500 searches/month.
 */

const SERPER_API_KEY = process.env.SERPER_API_KEY

export interface MarketplaceResult {
    title: string
    price: string | null
    source: string
    link: string
    snippet?: string
    imageUrl?: string
    rating?: number
}

export interface MarketplaceSearchResponse {
    results: MarketplaceResult[]
    sources: string[]
    query: string
}

// Shopping-intent detector
const SHOPPING_INTENT_KEYWORDS = [
    'buy', 'get', 'order', 'find', 'want', 'need', 'looking for',
    'where can i', 'how much', 'price', 'cost', 'sell', 'shop',
    'cheap', 'affordable', 'available', 'in stock', 'deliver', 'shipping',
    'wear', 'dress', 'shoe', 'bag', 'phone', 'laptop', 'food', 'fabric',
    'hair', 'wig', 'ankara', 'thrift', 'fairly used', 'tokunbo',
    'original', 'grade a', 'grade b', 'wholesale', 'bulk', 'per piece',
    'recommend', 'suggest', 'where to', 'which store', 'which shop',
]

export function hasShoppingIntent(text: string): boolean {
    const lower = text.toLowerCase()
    return SHOPPING_INTENT_KEYWORDS.some(kw => lower.includes(kw))
}

// Domain to human-readable source
function mapDomainToSource(domain: string): string {
    const map: Record<string, string> = {
        'shein.com': 'Shein',
        'temu.com': 'Temu',
        'bumpa.shop': 'Bumpa Store',
        'mybumpa.com': 'Bumpa Store',
        'selar.co': 'Selar',
        'selar.com': 'Selar',
        'flutterwave.com': 'Flutterwave Store',
        'paystack.com': 'Paystack Store',
        'olist.ng': 'Olist Nigeria',
        'konga.com': 'Konga',
        'fashpa.com': 'Fashpa',
        'printivo.com': 'Printivo',
        'vconnect.com': 'VConnect',
        'businesslist.com.ng': 'BusinessList NG',
        'jiji.ng': 'Jiji Nigeria',
        'olx.com.ng': 'OLX Nigeria',
        'nairaland.com': 'Nairaland',
        'payporte.com': 'PayPorte',
        'afrimall.com': 'Afrimall',
        'slot.ng': 'Slot Nigeria',
        'kara.com.ng': 'Kara',
        'fouani.com': 'Fouani',
        'pointek.com': 'Pointek',
        'supermart.ng': 'Supermart',
        'market.ng': 'Market NG',
        'dealdey.com': 'DealDey',
        'buyam.ng': 'Buyam',
        'chowdeck.com': 'Chowdeck',
        'spar.com.ng': 'Spar Nigeria',
    }
    for (const [key, value] of Object.entries(map)) {
        if (domain.includes(key)) return value
    }
    return 'Nigerian Store'
}

function getDomain(url: string): string {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
}

// Serper helpers
async function serperShopping(query: string, num = 4): Promise<any[]> {
    if (!SERPER_API_KEY) return []
    try {
        const res = await fetch('https://google.serper.dev/shopping', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query, gl: 'ng', hl: 'en', num }),
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.shopping || []
    } catch { return [] }
}

async function serperSearch(query: string, num = 5): Promise<any[]> {
    if (!SERPER_API_KEY) return []
    try {
        const res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query, gl: 'ng', hl: 'en', num }),
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.organic || []
    } catch { return [] }
}

// Shein search
async function searchShein(query: string): Promise<MarketplaceResult[]> {
    const items = await serperShopping(`${query} site:shein.com`, 3)
    return items.map((item: any) => ({
        title: item.title,
        price: item.price || null,
        source: 'Shein',
        link: item.link || `https://www.shein.com/search?q=${encodeURIComponent(query)}`,
        imageUrl: item.imageUrl,
        rating: item.rating,
    }))
}

// Temu search
async function searchTemu(query: string): Promise<MarketplaceResult[]> {
    const items = await serperShopping(`${query} site:temu.com`, 3)
    return items.map((item: any) => ({
        title: item.title,
        price: item.price || null,
        source: 'Temu',
        link: item.link || `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(query)}`,
        imageUrl: item.imageUrl,
        rating: item.rating,
    }))
}

// Nigerian storefronts
const NIGERIAN_SITES = [
    'site:bumpa.shop', 'site:mybumpa.com', 'site:selar.co',
    'site:olist.ng', 'site:konga.com', 'site:fashpa.com',
    'site:jiji.ng', 'site:olx.com.ng', 'site:payporte.com',
    'site:market.ng', 'site:supermart.ng', 'site:afrimall.com',
    'site:vconnect.com', 'site:businesslist.com.ng', 'site:buyam.ng',
].join(' OR ')

async function searchNigerianVendors(query: string): Promise<MarketplaceResult[]> {
    const [organic, shopping] = await Promise.all([
        serperSearch(`${query} (${NIGERIAN_SITES})`, 6),
        serperShopping(`${query} buy Nigeria`, 5),
    ])
    const results: MarketplaceResult[] = []
    const seen = new Set<string>()

    for (const item of organic) {
        if (!item.link || seen.has(item.link)) continue
        seen.add(item.link)
        results.push({
            title: item.title,
            price: null,
            source: mapDomainToSource(getDomain(item.link)),
            link: item.link,
            snippet: item.snippet?.slice(0, 100),
        })
    }

    for (const item of shopping) {
        if (!item.link || seen.has(item.link)) continue
        const domain = getDomain(item.link)
        if (domain.includes('shein') || domain.includes('temu')) continue
        seen.add(item.link)
        results.push({
            title: item.title,
            price: item.price || null,
            source: mapDomainToSource(domain),
            link: item.link,
            imageUrl: item.imageUrl,
        })
    }

    return results.slice(0, 6)
}

// Master search
export async function searchMarketplace(query: string): Promise<MarketplaceSearchResponse> {
    if (!SERPER_API_KEY) {
        console.warn('[Marketplace] SERPER_API_KEY not configured')
        return { results: [], sources: [], query }
    }

    const [shein, temu, nigerian] = await Promise.all([
        searchShein(query),
        searchTemu(query),
        searchNigerianVendors(query),
    ])

    const all = [...shein, ...temu, ...nigerian]
    const sources = [...new Set(all.map(r => r.source))]
    return { results: all, sources, query }
}

// Format for AI context
export function formatForAI(response: MarketplaceSearchResponse): string {
    if (response.results.length === 0) {
        return `EXTERNAL MARKETPLACE: No listings found for "${response.query}". Give general advice only.`
    }
    const lines = response.results.map(r => {
        const price = r.price ? ` — ${r.price}` : ''
        const extra = r.snippet ? ` (${r.snippet})` : ''
        return `• ${r.title}${price} [${r.source}] → ${r.link}${extra}`
    })
    return [
        `EXTERNAL MARKETPLACE RESULTS for "${response.query}" (checked: ${response.sources.join(', ')}):`,
        lines.join('\n'),
        `\nWhen recommending these, share the link naturally. Act like you know these stores. Never say you "searched Google".`,
    ].join('\n')
}
