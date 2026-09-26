import { NextResponse } from "next/server"
import { searchMarketplace, formatForAI, hasShoppingIntent } from "@/lib/marketplace/search"

export const maxDuration = 20

export async function POST(req: Request) {
    try {
        const { query } = await req.json()
        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Missing query" }, { status: 400 })
        }
        if (!hasShoppingIntent(query)) {
            return NextResponse.json({ results: [], sources: [], formatted: "", hasIntent: false })
        }
        const response = await searchMarketplace(query)
        return NextResponse.json({
            ...response,
            formatted: formatForAI(response),
            hasIntent: true,
        })
    } catch (e: any) {
        console.error("[Marketplace Search]", e)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const query = searchParams.get('q') || 'white sneakers'

        const { searchVectorProducts, saveDiscoveredProducts } = await import('@/lib/marketplace/vectorStore')
        const cached = await searchVectorProducts(query, 0.65, 6)

        if (cached.length > 0) {
            return NextResponse.json({
                mode: 'vector_store_rag_cache',
                cached: true,
                results: cached,
                count: cached.length,
            })
        }

        const live = await searchMarketplace(query)
        if (live.results.length > 0) {
            saveDiscoveredProducts(live.results).catch(() => {})
        }

        return NextResponse.json({
            mode: 'live_web_search',
            cached: false,
            results: live.results,
            sources: live.sources,
            count: live.results.length,
        })
    } catch (e: any) {
        console.error('[Marketplace Search GET]', e)
        return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 })
    }
}

