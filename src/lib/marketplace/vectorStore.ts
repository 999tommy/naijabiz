import { createServiceClient } from '@/lib/supabase/server'
import { MarketplaceResult } from './search'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

/**
 * Generate a 1536-dimensional semantic vector embedding using text-embedding-3-small via OpenRouter
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    if (!OPENROUTER_API_KEY) {
        console.warn('[VectorStore] OPENROUTER_API_KEY is missing, skipping embedding generation')
        return null
    }

    try {
        const cleanText = text.replace(/\n+/g, ' ').trim().slice(0, 1000)
        const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/text-embedding-3-small',
                input: cleanText,
            }),
        })

        if (!res.ok) {
            console.error('[VectorStore] OpenRouter embedding error:', res.status, await res.text())
            return null
        }

        const data = await res.json()
        return data?.data?.[0]?.embedding || null
    } catch (err) {
        console.error('[VectorStore] Failed to generate embedding:', err)
        return null
    }
}

/**
 * Search the Supabase discovered_products vector database for semantically similar products
 */
export async function searchVectorProducts(
    query: string,
    matchThreshold: number = 0.65,
    limit: number = 6
): Promise<MarketplaceResult[]> {
    try {
        const queryEmbedding = await generateEmbedding(query)
        if (!queryEmbedding) return []

        const supabase = await createServiceClient()
        const { data, error } = await supabase.rpc('match_discovered_products', {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: limit,
        })

        if (error) {
            // Table or function might not exist yet if migration hasn't been run
            console.warn('[VectorStore] RPC match_discovered_products notice:', error.message)
            return []
        }

        if (!data || !Array.isArray(data)) return []

        return data.map((item: any) => ({
            title: item.title,
            price: item.price || null,
            source: item.source || 'Verified Storefront',
            link: item.url,
            snippet: item.description || '',
        }))
    } catch (err) {
        console.error('[VectorStore] Vector search error:', err)
        return []
    }
}

/**
 * Store discovered products and their embeddings into Supabase (fire-and-forget or awaitable)
 */
export async function saveDiscoveredProducts(products: MarketplaceResult[]): Promise<void> {
    if (!products || products.length === 0) return

    try {
        const supabase = await createServiceClient()

        // Deduplicate input by URL
        const uniqueProducts = Array.from(
            new Map(products.map((p) => [p.link, p])).values()
        ).slice(0, 10) // Limit batch size to 10 per search

        for (const prod of uniqueProducts) {
            if (!prod.link || !prod.title) continue

            const textToEmbed = `${prod.title} ${prod.snippet || ''} ${prod.source || ''}`
            const embedding = await generateEmbedding(textToEmbed)

            if (!embedding) continue

            const { error } = await supabase
                .from('discovered_products')
                .upsert(
                    {
                        title: prod.title,
                        price: prod.price || null,
                        url: prod.link,
                        source: prod.source,
                        description: prod.snippet || null,
                        embedding: embedding,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'url' }
                )

            if (error) {
                console.warn('[VectorStore] Error saving product to vector store:', error.message)
            }
        }
    } catch (err) {
        console.error('[VectorStore] Error in saveDiscoveredProducts:', err)
    }
}
