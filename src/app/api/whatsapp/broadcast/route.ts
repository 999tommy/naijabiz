import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const QRIBLO_WA_TOKEN = process.env.QRIBLO_WA_ACCESS_TOKEN
const QRIBLO_WA_PHONE_ID = process.env.QRIBLO_WA_PHONE_NUMBER_ID

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { message, phones } = await req.json()

        if (!message || !phones || !Array.isArray(phones)) {
            return new NextResponse('Invalid input', { status: 400 })
        }

        // Fetch vendor info to prefix the message (since it's coming from central Qriblo number)
        const { data: vendor } = await supabase
            .from('users')
            .select('business_name')
            .eq('id', user.id)
            .single()
            
        const vendorName = vendor?.business_name || 'A Qriblo Vendor'
        const broadcastMsg = `[Broadcast from ${vendorName}]\n\n${message}`

        if (!QRIBLO_WA_TOKEN || !QRIBLO_WA_PHONE_ID) {
            console.warn('[WhatsApp Broadcast] Missing tokens. Pretending to send.')
            return new NextResponse(JSON.stringify({ success: true, fake: true }), { status: 200 })
        }

        let successCount = 0
        let failCount = 0

        for (const phone of phones) {
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
                    to: phone,
                    type: 'text',
                    text: { preview_url: false, body: broadcastMsg },
                }),
            })

            if (res.ok) {
                successCount++
            } else {
                failCount++
                console.error(`[WhatsApp Broadcast] Failed for ${phone}`, await res.text())
            }
        }

        return new NextResponse(JSON.stringify({ successCount, failCount }), { status: 200 })

    } catch (e: any) {
        console.error('[WhatsApp Broadcast Error]', e)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
