import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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
                customer_contact: customer_contact || 'Via virtual assistant chat',
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

export async function PATCH(req: Request) {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, status } = await req.json()
    if (!id || !['confirmed', 'completed', 'cancelled'].includes(status)) return NextResponse.json({ error: 'Invalid order update' }, { status: 400 })
    const supabase = await createServiceClient()
    const update = { status, ...(status === 'confirmed' ? { seller_responded_at: new Date().toISOString() } : {}) }
    const { data, error } = await supabase.from('orders').update(update).eq('id', id).eq('user_id', user.id).select('id, status').maybeSingle()
    if (error || !data) return NextResponse.json({ error: 'Could not update this order' }, { status: 404 })
    return NextResponse.json({ order: data })
}