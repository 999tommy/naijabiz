export const DAILY_AI_USAGE_LIMIT = 40

const LAGOS_UTC_OFFSET_MS = 60 * 60 * 1000

type UsageTrackedBusiness = {
    ai_usage_count?: number | null
    ai_usage_limit?: number | null
    ai_last_reset_at?: string | null
}

function lagosDateKey(date: Date) {
    return new Date(date.getTime() + LAGOS_UTC_OFFSET_MS).toISOString().slice(0, 10)
}

export function getDailyAiUsageState(business: UsageTrackedBusiness, now = new Date()) {
    const lastReset = business.ai_last_reset_at ? new Date(business.ai_last_reset_at) : null
    const shouldReset = !lastReset || Number.isNaN(lastReset.getTime()) || lagosDateKey(lastReset) !== lagosDateKey(now)
    const usage = shouldReset ? 0 : business.ai_usage_count || 0

    return {
        limit: DAILY_AI_USAGE_LIMIT,
        usage,
        shouldReset,
        nextUsage: usage + 1,
        nowIso: now.toISOString(),
        limitReached: usage >= DAILY_AI_USAGE_LIMIT,
    }
}
