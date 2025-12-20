import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { userId, billing } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const isYearly = billing === 'yearly'
        const productId = isYearly
            ? process.env.DODOPAYMENT_PRODUCT_ID_YEARLY
            : process.env.DODOPAYMENT_PRODUCT_ID

        if (!process.env.DODOPAYMENT_API_KEY) {
            console.error('Missing DODOPAYMENT_API_KEY')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        if (!productId) {
            console.error('Missing Product ID for billing:', billing)
            return NextResponse.json({ error: 'Product not available' }, { status: 400 })
        }


        // Get user
        const supabase = await createServiceClient()
        const { data: user } = await supabase
            .from('users')
            .select('email, phone, business_name')
            .eq('id', userId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create DodoPayment checkout session
        const response = await fetch('https://api.dodopayments.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DODOPAYMENT_API_KEY}`,
            },
            body: JSON.stringify({
                customer: {
                    email: user.email || undefined,
                    phone: user.phone || undefined,
                    name: user.business_name || 'Customer',
                },
                billing: {
                    city: 'Lagos',
                    country: 'NG',
                    state: 'Lagos',
                    street: 'N/A',
                    zipcode: '100001',
                },
                product_id: productId,
                quantity: 1,
                metadata: {
                    user_id: userId,
                    billing_cycle: isYearly ? 'yearly' : 'monthly',
                },
                payment_link: false,
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?upgraded=true`,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('DodoPayment error:', data)
            return NextResponse.json({ error: data.message || 'Payment failed' }, { status: 400 })
        }

        return NextResponse.json({ url: data.url })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
