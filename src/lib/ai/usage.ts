export const PRO_MONTHLY_AI_USAGE_LIMIT = 500

const LAGOS_UTC_OFFSET_MS = 60 * 60 * 1000

type UsageTrackedBusiness = {
    plan?: 'free' | 'pro' | string | null
    ai_usage_count?: number | null
    ai_usage_limit?: number | null
    ai_last_reset_at?: string | null
}

function lagosDateKey(date: Date) {
    return new Date(date.getTime() + LAGOS_UTC_OFFSET_MS).toISOString().slice(0, 10)
}

export function getDailyAiUsageState(business: UsageTrackedBusiness, now = new Date()) {
    const lastReset = business.ai_last_reset_at ? new Date(business.ai_last_reset_at) : null
    
    // Monthly reset logic for Pro users (YYYY-MM)
    const currentKey = lagosDateKey(now).slice(0, 7) 
    const resetKey = lastReset ? lagosDateKey(lastReset).slice(0, 7) : null
    
    const shouldReset = !lastReset || Number.isNaN(lastReset.getTime()) || resetKey !== currentKey
    const usage = shouldReset ? 0 : business.ai_usage_count || 0
    const limit = PRO_MONTHLY_AI_USAGE_LIMIT

    return {
        limit,
        usage,
        shouldReset,
        nextUsage: usage + 1,
        nowIso: now.toISOString(),
        limitReached: usage >= limit,
    }
}
