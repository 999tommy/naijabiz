import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type BillingCycle = 'monthly' | 'yearly'

const AMOUNTS_KOBO: Record<BillingCycle, number> = {
    monthly: 1500 * 100,
    yearly: 7500 * 100,
}

export async function POST(request: NextRequest) {
    try {
        const { userId, billing, type = 'subscription' } = (await request.json()) as {
            userId?: string
            billing?: BillingCycle
            type?: 'subscription' | 'onetime'
        }

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const billingCycle: BillingCycle = billing === 'yearly' ? 'yearly' : 'monthly'

        const secretKey = process.env.PAYSTACK_SECRET_KEY
        if (!secretKey) {
            console.error('Missing PAYSTACK_SECRET_KEY')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        let planCode: string | undefined

        // Only require plan code if it's a subscription
        if (type === 'subscription') {
            planCode =
                billingCycle === 'yearly'
                    ? process.env.PAYSTACK_PLAN_CODE_YEARLY
                    : process.env.PAYSTACK_PLAN_CODE_MONTHLY

            if (!planCode) {
                console.error('Missing Paystack plan code for billing:', billingCycle)
                return NextResponse.json({ error: 'Plan not available' }, { status: 400 })
            }
        }

        const supabase = await createServiceClient()
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.email) {
            return NextResponse.json({ error: 'User email is required for payment' }, { status: 400 })
        }

        const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?upgraded=true`

        const payload: any = {
            email: user.email,
            amount: AMOUNTS_KOBO[billingCycle],
            callback_url: callbackUrl,
            channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
            metadata: {
                user_id: userId,
                billing_cycle: billingCycle,
                payment_type: type, // distinct metadata to identify standard vs sub
            },
        }

        // Only add plan if it's a subscription
        if (type === 'subscription' && planCode) {
            payload.plan = planCode
        }

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${secretKey}`,
            },
            body: JSON.stringify(payload),
        })

        const raw = await response.text()
        let data: any
        try {
            data = raw ? JSON.parse(raw) : {}
        } catch {
            return NextResponse.json({ error: 'Invalid response from payment provider' }, { status: 502 })
        }

        if (!response.ok) {
            console.error('Paystack initialize error:', data)
            return NextResponse.json(
                { error: data?.message || `Payment failed: ${response.statusText}` },
                { status: response.status }
            )
        }

        const url = data?.data?.authorization_url
        const reference = data?.data?.reference

        if (!url) {
            console.error('No authorization_url in Paystack response', data)
            return NextResponse.json({ error: 'Could not generate checkout URL' }, { status: 500 })
        }

        return NextResponse.json({ url, reference })
    } catch (error) {
        console.error('Paystack initialize error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
