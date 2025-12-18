import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-dodo-signature')

        // Verify webhook signature
        if (process.env.DODOPAYMENT_WEBHOOK_SECRET) {
            const expectedSignature = crypto
                .createHmac('sha256', process.env.DODOPAYMENT_WEBHOOK_SECRET)
                .update(body)
                .digest('hex')

            if (signature !== expectedSignature) {
                console.error('Invalid webhook signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        }

        const event = JSON.parse(body)
        console.log('DodoPayment webhook:', event.type)

        const supabase = await createServiceClient()

        switch (event.type) {
            case 'subscription.active':
            case 'payment.succeeded': {
                const userId = event.data?.metadata?.user_id
                const subscriptionId = event.data?.subscription_id || event.data?.id

                if (!userId) {
                    console.error('No user_id in metadata')
                    break
                }

                // Calculate subscription end date (1 month from now)
                const subscriptionEndsAt = new Date()
                subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1)

                // Update user to Pro
                const { error } = await supabase
                    .from('users')
                    .update({
                        plan: 'pro',
                        subscription_id: subscriptionId,
                        subscription_ends_at: subscriptionEndsAt.toISOString(),
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
                const userId = event.data?.metadata?.user_id

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
                console.log('Payment failed for:', event.data?.metadata?.user_id)
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

// Disable body parsing for webhook signature verification
export const config = {
    api: {
        bodyParser: false,
    },
}
