import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com').replace(/\/$/, '')
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/admin/', '/nimda', '/api/', '/agents/dashboard', '/herexcellence/dashboard'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
