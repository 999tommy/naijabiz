import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naijabiz.org'
    const supabase = await createClient()

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/directory',
        '/pricing',
        '/login',
        '/signup',
        '/tolas-kitchen', // The example page
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Business Pages (Users)
    // Fetch all businesses that have a slug (publicly accessible)
    const { data: businesses } = await supabase
        .from('users')
        .select('business_slug, updated_at')
        .not('business_slug', 'is', null)

    const businessRoutes = businesses?.map((business) => ({
        url: `${baseUrl}/${business.business_slug}`,
        lastModified: new Date(business.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    })) || []

    return [...staticRoutes, ...businessRoutes]
}
