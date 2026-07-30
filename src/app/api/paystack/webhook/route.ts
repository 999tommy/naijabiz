import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { downgradeUserToFree } from '@/lib/subscription'

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

type BillingCycle = 'monthly' | 'quarterly' | 'biannual' | 'yearly'
type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord {
    return value && typeof value === 'object' ? value as UnknownRecord : {}
}

function getRecord(value: unknown, key: string) {
    return asRecord(asRecord(value)[key])
}

function getString(value: unknown, key: string) {
    const entry = asRecord(value)[key]
    return typeof entry === 'string' ? entry : undefined
}

function getBoolean(value: unknown, key: string) {
    const entry = asRecord(value)[key]
    return typeof entry === 'boolean' ? entry : undefined
}

function getNumber(value: unknown, key: string) {
    const entry = asRecord(value)[key]
    return typeof entry === 'number' ? entry : undefined
}

function isUniqueViolation(error: unknown) {
    return getString(error, 'code') === '23505'
}

const BILLING_CYCLES_BY_PLAN_ENV: Record<string, BillingCycle> = {
    PAYSTACK_PLAN_CODE_MONTHLY: 'monthly',
    PAYSTACK_PRO_QUARTERLY_PLAN: 'quarterly',
    PAYSTACK_PRO_BIANNUAL_PLAN: 'biannual',
    PAYSTACK_PLAN_CODE_YEARLY: 'yearly',
}

function normalizeBillingCycle(cycle?: string): BillingCycle {
    if (cycle === 'quarterly' || cycle === 'biannual' || cycle === 'yearly') {
        return cycle
    }
    return 'monthly'
}

function computeSubscriptionEndsAt(cycle: BillingCycle) {
    const d = new Date()
    if (cycle === 'yearly') {
        d.setFullYear(d.getFullYear() + 1)
    } else if (cycle === 'biannual') {
        d.setMonth(d.getMonth() + 6)
    } else if (cycle === 'quarterly') {
        d.setMonth(d.getMonth() + 3)
    } else {
        d.setMonth(d.getMonth() + 1)
    }
    return d
}

function cycleFromPlanCode(planCode?: string | null): BillingCycle | undefined {
    if (!planCode) return undefined

    for (const [envKey, cycle] of Object.entries(BILLING_CYCLES_BY_PLAN_ENV)) {
        if (process.env[envKey] && process.env[envKey] === planCode) {
            return cycle
        }
    }

    return undefined
}

function parseProviderDate(value: unknown) {
    if (!value || typeof value !== 'string') return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getSubscriptionCode(data: unknown) {
    return getString(getRecord(data, 'subscription'), 'subscription_code') ||
        getString(data, 'subscription_code') ||
        getString(getRecord(data, 'authorization'), 'authorization_code')
}

function getUserIdentifier(data: unknown) {
    return {
        userId: getString(getRecord(data, 'metadata'), 'user_id') ||
            getString(getRecord(getRecord(data, 'subscription'), 'metadata'), 'user_id'),
        email: getString(getRecord(data, 'customer'), 'email') ||
            getString(getRecord(getRecord(data, 'subscription'), 'customer'), 'email'),
    }
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

        const event = JSON.parse(payload) as { event?: string; data?: unknown }

        if (!event?.event) {
            return NextResponse.json({ received: true })
        }

        const handledEvents = new Set([
            'charge.success',
            'invoice.create',
            'invoice.update',
            'subscription.create',
            'subscription.enable',
            'subscription.disable',
            'subscription.not_renew',
            'invoice.payment_failed',
        ])

        if (!handledEvents.has(event.event)) {
            return NextResponse.json({ received: true })
        }

        const data = asRecord(event.data)
        if (
            (event.event === 'invoice.create' || event.event === 'invoice.update') &&
            getBoolean(data, 'paid') !== true &&
            getString(data, 'status') !== 'success'
        ) {
            return NextResponse.json({ received: true })
        }

        const reference = getString(data, 'reference')
        const { userId, email } = getUserIdentifier(data)
        const customerCode = getString(getRecord(data, 'customer'), 'customer_code')
        const planValue = asRecord(data).plan
        const planCode = getString(planValue, 'plan_code') || (typeof planValue === 'string' ? planValue : undefined)
        const metadata = getRecord(data, 'metadata')
        const metadataCycle = getString(metadata, 'billing_cycle')

        const billingCycle = cycleFromPlanCode(planCode) || normalizeBillingCycle(metadataCycle)

        const userLookupEmail = email || undefined

        if (!userId && !userLookupEmail) {
            console.error('Paystack webhook missing user identifier (user_id/email)')
            return NextResponse.json({ received: true })
        }

        const eventReference = reference ||
            getString(data, 'invoice_code') ||
            getString(data, 'subscription_code') ||
            `${event.event}-${getString(data, 'id') || getNumber(data, 'id') || crypto.randomUUID()}`

        if (!eventReference) {
            console.error('Paystack webhook missing reference')
            return NextResponse.json({ received: true })
        }

        const supabase = await createServiceClient()

        // Idempotency: skip if we already processed this reference
        const { data: existingTx, error: existingTxError } = await supabase
            .from('paystack_transactions')
            .select('id')
            .eq('reference', eventReference)
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
                return await supabase.from('users').select('id, email, plan, subscription_ends_at').eq('id', userId).maybeSingle()
            }
            return await supabase.from('users').select('id, email, plan, subscription_ends_at').eq('email', userLookupEmail!).maybeSingle()
        })()

        if (!user?.id) {
            console.error('Paystack webhook could not find user')
            // Still record tx to avoid re-processing storm if Paystack retries
            await supabase.from('paystack_transactions').insert({
                reference: eventReference,
                status: 'ignored',
                event: event.event,
                customer_email: email || null,
                payload: event,
            })
            return NextResponse.json({ received: true })
        }

        if (event.event === 'subscription.disable' || event.event === 'subscription.not_renew') {
            const { error: insertTxError } = await supabase.from('paystack_transactions').insert({
                reference: eventReference,
                status: 'cancelled',
                event: event.event,
                customer_email: email || null,
                plan_code: planCode || null,
                user_id: user.id,
                payload: event,
            })

            if (insertTxError && !isUniqueViolation(insertTxError)) {
                console.error('Failed to insert paystack cancellation transaction:', insertTxError)
                return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
            }

            const { error: downgradeError } = await downgradeUserToFree(user.id)
            if (downgradeError) {
                console.error('Failed to downgrade user after Paystack cancellation:', downgradeError)
                return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
            }

            return NextResponse.json({ received: true })
        }

        if (event.event === 'invoice.payment_failed') {
            const { error: insertTxError } = await supabase.from('paystack_transactions').insert({
                reference: eventReference,
                status: 'failed',
                event: event.event,
                customer_email: email || null,
                plan_code: planCode || null,
                user_id: user.id,
                payload: event,
            })

            if (insertTxError && !isUniqueViolation(insertTxError)) {
                console.error('Failed to insert paystack failed transaction:', insertTxError)
                return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
            }

            if (user.subscription_ends_at && new Date(user.subscription_ends_at) < new Date()) {
                const { error: downgradeError } = await downgradeUserToFree(user.id)
                if (downgradeError) {
                    console.error('Failed to downgrade expired user after failed renewal:', downgradeError)
                    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
                }
            }

            return NextResponse.json({ received: true })
        }

        const providerEndsAt =
            parseProviderDate(getString(data, 'paid_at')) ||
            parseProviderDate(getString(data, 'period_end')) ||
            parseProviderDate(getString(getRecord(data, 'subscription'), 'next_payment_date')) ||
            parseProviderDate(getString(getRecord(data, 'subscription'), 'next_charge_date'))

        const subscriptionEndsAt = providerEndsAt || computeSubscriptionEndsAt(billingCycle)
        if (providerEndsAt && providerEndsAt < new Date()) {
            subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + (billingCycle === 'monthly' ? 1 : billingCycle === 'quarterly' ? 3 : billingCycle === 'biannual' ? 6 : 12))
        }

        // Persist tx first (unique reference) then update user
        const { error: insertTxError } = await supabase.from('paystack_transactions').insert({
            reference: eventReference,
            status: 'success',
            event: event.event,
            customer_email: email || null,
            plan_code: planCode || null,
            user_id: user.id,
            payload: event,
        })

        if (insertTxError) {
            // If unique constraint triggers due to race, treat as idempotent success
            if (!isUniqueViolation(insertTxError)) {
                console.error('Failed to insert paystack transaction:', insertTxError)
                return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
            }
            return NextResponse.json({ received: true })
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                plan: 'pro',
                subscription_id: getSubscriptionCode(data) || reference || eventReference,
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


