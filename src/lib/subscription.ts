import { createServiceClient } from '@/lib/supabase/server'
import { User } from '@/lib/types'

export async function downgradeExpiredSubscriptions() {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
        .from('users')
        .update({
            plan: 'free',
            subscription_id: null,
            subscription_ends_at: null,
            is_verified: false,
            paystack_plan_code: null,
        })
        .eq('plan', 'pro')
        .not('subscription_ends_at', 'is', null)
        .lt('subscription_ends_at', new Date().toISOString())
        .select('id')

    if (error) {
        console.error('Error downgrading expired subscriptions:', error)
        return 0
    }

    return data?.length || 0
}

export async function downgradeUserToFree(userId: string) {
    const supabase = await createServiceClient()
    return supabase
        .from('users')
        .update({
            plan: 'free',
            subscription_id: null,
            subscription_ends_at: null,
            is_verified: false,
            paystack_plan_code: null,
        })
        .eq('id', userId)
}

export async function checkAndDowngradeUser(user: User): Promise<User> {
    if (user.plan === 'pro' && user.subscription_ends_at) {
        const endsAt = new Date(user.subscription_ends_at)
        const now = new Date()

        if (endsAt < now) {
            console.log(`Downgrading expired user: ${user.id}`)
            const { error } = await downgradeUserToFree(user.id)

            if (!error) {
                return {
                    ...user,
                    plan: 'free',
                    subscription_id: null,
                    subscription_ends_at: null,
                    is_verified: false,
                }
            } else {
                console.error(`Error downgrading user ${user.id}:`, error)
            }
        }
    }
    return user
}
