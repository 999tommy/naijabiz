import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const { business_id, customer_name, customer_contact, items, total_amount, order_method } = await req.json()

        if (!business_id || !customer_name || !items || !total_amount) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
        }

        const supabase = await createServiceClient()

        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                user_id: business_id,
                customer_name,
                customer_contact: customer_contact || 'Via AI Chat',
                items,
                total_amount,
                order_method: order_method || 'whatsapp',
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            console.error('Order creation error:', error)
            return NextResponse.json({ error: 'Failed to record order' }, { status: 500 })
        }

        return NextResponse.json({ success: true, order })
    } catch (error: any) {
        console.error('API Order Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
