export const DAILY_AI_USAGE_LIMIT = 40
export const FREE_MONTHLY_AI_USAGE_LIMIT = 100

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
    const isFree = business.plan !== 'pro'
    const currentKey = isFree ? lagosDateKey(now).slice(0, 7) : lagosDateKey(now)
    const resetKey = lastReset ? lagosDateKey(lastReset).slice(0, isFree ? 7 : 10) : null
    const shouldReset = !lastReset || Number.isNaN(lastReset.getTime()) || resetKey !== currentKey
    const usage = shouldReset ? 0 : business.ai_usage_count || 0
    const limit = isFree ? FREE_MONTHLY_AI_USAGE_LIMIT : DAILY_AI_USAGE_LIMIT

    return {
        limit,
        usage,
        shouldReset,
        nextUsage: usage + 1,
        nowIso: now.toISOString(),
        limitReached: usage >= limit,
    }
}
