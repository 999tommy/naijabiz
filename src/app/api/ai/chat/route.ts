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

        const { businessId, messages } = await req.json()

        if (!businessId || !messages) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createServiceClient()

        // 1. Fetch Business Info & Check Limits
        const { data: business, error: userError } = await supabase
            .from('users')
            .select('*, products(name, price, description)')
            .eq('id', businessId)
            .single()

        if (userError || !business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }

        if (business.plan !== 'pro') {
            return NextResponse.json({ error: 'AI is a Pro feature' }, { status: 403 })
        }

        if (!business.ai_enabled) {
            return NextResponse.json({ error: 'AI is disabled' }, { status: 403 })
        }

        // Check Limit (100 per month)
        const limit = business.ai_usage_limit || 100
        const usage = business.ai_usage_count || 0

        if (usage >= limit) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }

        // 2. Increment Usage (Optimistic: Increment before calling AI to prevent easy bypass)
        // In a real high-scale app, use Redis or atomic increment. Here we use an RPC or simple update.
        // We already created 'increment_ai_usage' RPC, let's try to use it, or fallback to update.

        // Attempt RPC
        const { data: incrementSuccess, error: rpcError } = await supabase.rpc('increment_ai_usage', { user_id: businessId })

        // If RPC fails (maybe not migrated?), fallback to simple update logic (unsafe concurrency but okay for MVP)
        if (rpcError) {
            console.warn('RPC increment failed, falling back to manual increment', rpcError)
            await supabase
                .from('users')
                .update({ ai_usage_count: usage + 1 })
                .eq('id', businessId)
        } else if (incrementSuccess === false) {
            return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 429 })
        }


        // 3. Construct System Prompt
        const productsContext = business.products && business.products.length > 0
            ? `Here are the products we sell:\n${business.products.map((p: any) => `- ${p.name}: ₦${p.price} (${p.description || ''})`).join('\n')}`
            : "We haven't listed any products yet."

        const businessContext = `
    You are the helpful AI Sales Assistant for "${business.business_name}".
    
    BUSINESS INFO:
    - Location: ${business.location || 'Not specified'}
    - Description: ${business.description || ''}
    - Instructions from Owner: ${business.ai_instructions || 'Be polite and helpful.'}
    
    PRODUCTS:
    ${productsContext}
    
    YOUR GOAL:
    Answer the customer's question politely and briefly.
    If they ask to buy, tell them to click the WhatsApp button to chat with the owner.
    Do NOT make up prices.
    Keep responses as short as possible (under 3 sentences).
    Tone: Friendly, Nigerian, Professional.
    `

        // 4. Call OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3-8b-instruct:free", // Use free/cheap model
                "messages": [
                    { "role": "system", "content": businessContext },
                    ...messages
                ],
                "temperature": 0.7,
                "max_tokens": 150, // Keep answers short
            })
        });

        if (!response.ok) {
            console.error("OpenRouter Error", await response.text())
            return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 502 })
        }

        const aiData = await response.json()
        const aiReply = aiData.choices?.[0]?.message?.content || "I'm sorry, I couldn't understand that."

        return NextResponse.json({ reply: aiReply })

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
