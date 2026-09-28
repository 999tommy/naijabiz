import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com').replace(/\/$/, '')
    const supabase = await createServiceClient()

    // 1. Static Routes
    const staticRoutes = [
        { route: '', priority: 1, changeFrequency: 'weekly' as const },
        { route: '/directory', priority: 0.9, changeFrequency: 'daily' as const },
        { route: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
        { route: '/agents', priority: 0.6, changeFrequency: 'monthly' as const },
        { route: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
        { route: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
        { route: '/tolas-kitchen', priority: 0.6, changeFrequency: 'weekly' as const },
        { route: '/musafix-electricals', priority: 0.6, changeFrequency: 'weekly' as const },
    ].map(({ route, priority, changeFrequency }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }))

    // 2. Business Pages (Users)
    // Fetch all businesses that have a slug (publicly accessible)
    const { data: businesses } = await supabase
        .from('users')
        .select('business_slug, business_name, updated_at, plan')
        .not('business_slug', 'is', null)
        .not('business_name', 'is', null)
        .limit(50000)

    const reservedSlugs = new Set(['tolas-kitchen', 'musafix-electricals'])
    const businessRoutes = businesses?.filter((business) => business.business_slug && !reservedSlugs.has(business.business_slug)).map((business) => {
        const isPro = business.plan === 'pro';
        return {
            url: `${baseUrl}/${business.business_slug}`,
            lastModified: new Date(business.updated_at || Date.now()),
            changeFrequency: isPro ? 'daily' as const : 'weekly' as const,
            priority: isPro ? 1.0 : 0.7,
        }
    }) || []

    return [...staticRoutes, ...businessRoutes]
}
