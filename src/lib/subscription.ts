import { createServiceClient } from '@/lib/supabase/server'
import { User } from '@/lib/types'

export async function checkAndDowngradeUser(user: User): Promise<User> {
    if (user.plan === 'pro' && user.subscription_ends_at) {
        const endsAt = new Date(user.subscription_ends_at)
        const now = new Date()

        if (endsAt < now) {
            console.log(`Downgrading expired user: ${user.id}`)
            // Expired! Downgrade in DB using service client
            const supabase = await createServiceClient()
            const { error } = await supabase
                .from('users')
                .update({
                    plan: 'free',
                    subscription_id: null,
                    subscription_ends_at: null,
                    is_verified: false,
                })
                .eq('id', user.id)

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
