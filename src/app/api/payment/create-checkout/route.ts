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

        // Determine API URL based on environment or key
        // Fix: Default to LIVE unless explicitly using a test key or mode
        const isTest = process.env.DODOPAYMENT_MODE === 'test' || process.env.DODOPAYMENT_API_KEY?.startsWith('test_')
        const baseUrl = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com'

        console.log(`Using Dodo Payments Environment: ${isTest ? 'TEST' : 'LIVE'} (${baseUrl})`)

        // Create DodoPayment checkout session
        const response = await fetch(`${baseUrl}/checkouts`, {
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
                product_cart: [
                    {
                        product_id: productId,
                        quantity: 1,
                    }
                ],
                metadata: {
                    user_id: userId,
                    billing_cycle: isYearly ? 'yearly' : 'monthly',
                },
                payment_link: false,
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?upgraded=true`,
            }),
        })

        const rawResponse = await response.text()
        console.log('Dodo Payments Response:', rawResponse)

        let data
        try {
            data = rawResponse ? JSON.parse(rawResponse) : {}
        } catch (e) {
            console.error('Failed to parse Dodo response')
            return NextResponse.json({ error: 'Invalid response from payment provider' }, { status: 502 })
        }

        if (!response.ok) {
            console.error('DodoPayment error:', data)
            return NextResponse.json({ error: data.message || `Payment failed: ${response.statusText}` }, { status: response.status })
        }

        if (!data.payment_link) {
            // If using payment_link: false, the API might return differently.
            // Based on docs, it should return an object.
            // Let's ensure we find the URL.
        }

        // Check for url in different possible locations based on API variation
        const checkoutUrl = data.checkout_url || data.url || data.payment_link

        if (!checkoutUrl) {
            console.error('No checkout URL in response', data)
            return NextResponse.json({ error: 'Could not generate checkout URL' }, { status: 500 })
        }

        return NextResponse.json({ url: checkoutUrl })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
