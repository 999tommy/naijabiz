import { ImageResponse } from 'next/og'
import { getWebsiteTheme } from '@/lib/website-theme'

export const runtime = 'edge'

export const alt = 'Business Page'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

type OgBusiness = {
    business_name: string
    business_slug?: string | null
    description?: string | null
    plan?: string | null
    business_type?: string | null
    category?: { name?: string | null; slug?: string | null } | Array<{ name?: string | null; slug?: string | null }>
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let business: OgBusiness | null = null

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/users?business_slug=eq.${encodeURIComponent(slug)}&select=business_name,business_slug,description,plan,business_type,category:categories(name,slug)`, {
            headers: {
                apikey: supabaseKey || '',
                Authorization: `Bearer ${supabaseKey}`,
            },
            next: { revalidate: 60 },
        })

        if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
                business = data[0]
            }
        }
    } catch (e) {
        console.error('Failed to fetch business for OG image', e)
    }

    if (!business) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#F0E68C',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif',
                        fontSize: 60,
                        fontWeight: 'bold',
                        color: '#36454F',
                    }}
                >
                    Qriblo
                </div>
            ),
            { ...size }
        )
    }

    const category = Array.isArray(business.category) ? business.category[0] : business.category
    const theme = getWebsiteTheme(category?.slug, category?.name, business.business_slug || slug, business.business_type)

    return new ImageResponse(
        (
            <div
                style={{
                    background: theme.heroBg,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    padding: '40px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '120px',
                        borderRadius: '24px',
                        backgroundColor: theme.cardBg,
                        marginBottom: '30px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
                        overflow: 'hidden',
                        border: `4px solid ${theme.logoRing}`,
                    }}
                >
                    <div style={{ fontSize: '60px', fontWeight: 'bold', color: theme.accent }}>
                        {(business.business_name || 'Q')[0].toUpperCase()}
                    </div>
                </div>

                <div
                    style={{
                        fontSize: '70px',
                        fontWeight: 'bold',
                        color: theme.heroText,
                        lineHeight: '1.1',
                        marginBottom: '20px',
                        maxWidth: '1000px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                    }}
                >
                    {business.business_name}
                </div>

                {business.plan === 'pro' && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: theme.ctaBg,
                            padding: '10px 24px',
                            borderRadius: '50px',
                            marginBottom: '30px',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={theme.ctaText} style={{ marginRight: '10px' }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: theme.ctaText,
                                letterSpacing: '0.05em',
                            }}
                        >
                            VERIFIED BRAND
                        </span>
                    </div>
                )}

                <div
                    style={{
                        fontSize: '32px',
                        color: theme.heroSubText,
                        maxWidth: '900px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '40px',
                    }}
                >
                    {business.description || `Order or book with ${business.business_name} on Qriblo.`}
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: theme.cardBg,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '100px',
                        padding: '10px 24px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: theme.accent,
                            marginRight: '12px',
                        }}
                    >
                        Powered by Qriblo
                    </div>
                    <div style={{ fontSize: '20px', color: theme.bodyText }}>
                        Create your own free page at <span style={{ fontWeight: 'bold', color: theme.headingText }}>qriblo.com</span>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
