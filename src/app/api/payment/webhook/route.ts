import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signatureHeader = request.headers.get('webhook-signature')
        const webhookId = request.headers.get('webhook-id')
        const webhookTimestamp = request.headers.get('webhook-timestamp')

        // Verify webhook signature
        const webhookSecret =
            process.env.DODOPAYMENT_WEBHOOK_SECRET ||
            process.env.DODO_PAYMENTS_WEBHOOK_KEY ||
            process.env.DODOPAYMENT_WEBHOOK_KEY

        if (webhookSecret) {
            if (!signatureHeader || !webhookId || !webhookTimestamp) {
                console.error('Missing webhook signature headers')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }

            const signedMessage = `${webhookId}.${webhookTimestamp}.${body}`
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(signedMessage)
                .digest('base64')

            const receivedSignature = (() => {
                const raw = signatureHeader.trim()
                if (raw.includes('v1=')) {
                    return raw.split('v1=').pop()?.trim()
                }
                if (raw.includes(',')) {
                    return raw.split(',').pop()?.trim()
                }
                return raw
            })()

            if (!receivedSignature) {
                console.error('Invalid webhook signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }

            const expectedBuf = Buffer.from(expectedSignature, 'base64')
            const receivedBuf = Buffer.from(receivedSignature, 'base64')

            if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
                console.error('Invalid webhook signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        }

        const event = JSON.parse(body)
        console.log('DodoPayment webhook:', event.type)

        const supabase = await createServiceClient()

        switch (event.type) {
            case 'subscription.active':
            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.renewed':
            case 'payment.succeeded':
            case 'checkout.succeeded': {
                const metadata =
                    event.data?.metadata ||
                    event.data?.payload?.metadata ||
                    event.data?.payment?.metadata ||
                    event.data?.subscription?.metadata ||
                    event.data?.checkout?.metadata

                const userId = metadata?.user_id
                const cycle = metadata?.billing_cycle || 'monthly'
                const subscriptionId =
                    event.data?.subscription_id ||
                    event.data?.id ||
                    event.data?.payment?.id ||
                    event.data?.subscription?.id ||
                    event.data?.checkout?.id

                if (!userId) {
                    console.error('No user_id in metadata')
                    break
                }

                // Calculate subscription end date based on cycle
                const providerEndsAtRaw =
                    event.data?.next_billing_date ||
                    event.data?.expires_at ||
                    event.data?.subscription?.next_billing_date ||
                    event.data?.subscription?.expires_at

                let subscriptionEndsAt = providerEndsAtRaw ? new Date(providerEndsAtRaw) : new Date('')

                if (Number.isNaN(subscriptionEndsAt.getTime())) {
                    subscriptionEndsAt = new Date()
                    if (cycle === 'yearly') {
                        subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1)
                    } else {
                        subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1)
                    }
                }

                console.log(`Upgrading user ${userId} to Pro (${cycle} plan)`)

                // Update user to Pro
                const { error } = await supabase
                    .from('users')
                    .update({
                        plan: 'pro',
                        subscription_id: subscriptionId,
                        subscription_ends_at: subscriptionEndsAt.toISOString(),
                        is_verified: true, // Auto-verify on purchase
                    })
                    .eq('id', userId)

                if (error) {
                    console.error('Failed to update user:', error)
                } else {
                    console.log('User upgraded to Pro:', userId)
                }
                break
            }

            case 'subscription.cancelled':
            case 'subscription.expired': {
                const metadata =
                    event.data?.metadata ||
                    event.data?.payload?.metadata ||
                    event.data?.payment?.metadata ||
                    event.data?.subscription?.metadata ||
                    event.data?.checkout?.metadata

                const userId = metadata?.user_id

                if (!userId) break

                // Downgrade user to Free
                const { error } = await supabase
                    .from('users')
                    .update({
                        plan: 'free',
                        subscription_id: null,
                        subscription_ends_at: null,
                        is_verified: false, // Remove verified status
                    })
                    .eq('id', userId)

                if (error) {
                    console.error('Failed to downgrade user:', error)
                } else {
                    console.log('User downgraded to Free:', userId)
                }
                break
            }

            case 'payment.failed': {
                const metadata =
                    event.data?.metadata ||
                    event.data?.payload?.metadata ||
                    event.data?.payment?.metadata ||
                    event.data?.subscription?.metadata ||
                    event.data?.checkout?.metadata
                console.log('Payment failed for:', metadata?.user_id)
                break
            }

            default:
                console.log('Unhandled event type:', event.type)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}


