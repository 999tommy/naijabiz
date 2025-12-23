import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function verifyPaystackSignature(params: {
    payload: string
    signatureHeader: string | null
    secretKey: string
}) {
    const { payload, signatureHeader, secretKey } = params
    if (!signatureHeader) return false

    const computed = crypto.createHmac('sha512', secretKey).update(payload).digest('hex')

    const computedBuf = Buffer.from(computed, 'hex')
    const receivedBuf = Buffer.from(signatureHeader, 'hex')

    if (computedBuf.length !== receivedBuf.length) return false
    return crypto.timingSafeEqual(computedBuf, receivedBuf)
}

type BillingCycle = 'monthly' | 'yearly'

function computeSubscriptionEndsAt(cycle: BillingCycle) {
    const d = new Date()
    if (cycle === 'yearly') {
        d.setFullYear(d.getFullYear() + 1)
    } else {
        d.setMonth(d.getMonth() + 1)
    }
    return d
}

export async function POST(request: NextRequest) {
    try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY
        if (!secretKey) {
            console.error('Missing PAYSTACK_SECRET_KEY')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const payload = await request.text()
        const signatureHeader = request.headers.get('x-paystack-signature')

        if (!verifyPaystackSignature({ payload, signatureHeader, secretKey })) {
            console.error('Invalid Paystack signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(payload) as any

        if (!event?.event) {
            return NextResponse.json({ received: true })
        }

        // We handle charge.success for one-time payments and invoice.payment_failed/success for subscriptions if needed
        // For simplicity, charge.success covers valid payments for both one-time and initial subscription charges
        if (event.event !== 'charge.success' && event.event !== 'subscription.create') {
            return NextResponse.json({ received: true })
        }

        const data = event.data
        const reference: string | undefined = data?.reference
        const email: string | undefined = data?.customer?.email
        const customerCode: string | undefined = data?.customer?.customer_code
        const planCode: string | undefined = data?.plan?.plan_code || data?.plan
        const amount: number | undefined = data?.amount // in kobo

        const metadataUserId: string | undefined = data?.metadata?.user_id
        const metadataCycle: BillingCycle | undefined = data?.metadata?.billing_cycle
        const paymentType: 'subscription' | 'onetime' | undefined = data?.metadata?.payment_type

        const billingCycle: BillingCycle = metadataCycle === 'yearly' ? 'yearly' : 'monthly'

        const userLookupEmail = email || undefined
        const userId = metadataUserId || undefined

        if (!userId && !userLookupEmail) {
            console.error('Paystack webhook missing user identifier (user_id/email)')
            return NextResponse.json({ received: true })
        }

        if (!reference) {
            console.error('Paystack webhook missing reference')
            return NextResponse.json({ received: true })
        }

        const supabase = await createServiceClient()

        // Idempotency: skip if we already processed this reference
        const { data: existingTx, error: existingTxError } = await supabase
            .from('paystack_transactions')
            .select('id')
            .eq('reference', reference)
            .maybeSingle()

        if (existingTxError) {
            console.error('Failed to check paystack_transactions:', existingTxError)
            return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
        }

        if (existingTx) {
            return NextResponse.json({ received: true })
        }

        const { data: user } = await (async () => {
            if (userId) {
                return await supabase.from('users').select('id, email, plan').eq('id', userId).maybeSingle()
            }
            return await supabase.from('users').select('id, email, plan').eq('email', userLookupEmail!).maybeSingle()
        })()

        if (!user?.id) {
            console.error('Paystack webhook could not find user')
            // Still record tx to avoid re-processing storm if Paystack retries
            await supabase.from('paystack_transactions').insert({
                reference,
                status: 'ignored',
                event: event.event,
                customer_email: email || null,
                payload: event,
            })
            return NextResponse.json({ received: true })
        }

        // Verify amount for one-time payments if possible
        // const expectedAmount = AMOUNTS_KOBO[billingCycle];
        // if (paymentType === 'onetime' && amount !== expectedAmount) { ... }

        const subscriptionEndsAt = computeSubscriptionEndsAt(billingCycle)

        // Persist tx first (unique reference) then update user
        const { error: insertTxError } = await supabase.from('paystack_transactions').insert({
            reference,
            status: 'success',
            event: event.event,
            customer_email: email || null,
            plan_code: planCode || null,
            user_id: user.id,
            payload: event,
        })

        if (insertTxError) {
            // If unique constraint triggers due to race, treat as idempotent success
            if ((insertTxError as any)?.code !== '23505') {
                console.error('Failed to insert paystack transaction:', insertTxError)
                return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
            }
            return NextResponse.json({ received: true })
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                plan: 'pro',
                subscription_id: reference, // store reference as sub id for one-time
                subscription_ends_at: subscriptionEndsAt.toISOString(),
                is_verified: true,
                paystack_customer_code: customerCode || null,
                paystack_plan_code: planCode || null,
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Failed to update user after paystack webhook:', updateError)
            return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Paystack webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}


