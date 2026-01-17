import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Business Page'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
    const { slug } = await params // Await params in Next.js 15

    // Fetch business data directly via fetch API to avoid cookie/server client issues in Edge
    // encoding the slug is important
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let business = null

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/users?business_slug=eq.${encodeURIComponent(slug)}&select=business_name,description,location,is_verified,logo_url`, {
            headers: {
                'apikey': supabaseKey || '',
                'Authorization': `Bearer ${supabaseKey}`,
            },
            next: { revalidate: 60 } // Cache for 60 seconds
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

    // Fallback if not found
    if (!business) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#faf8f3',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif',
                        fontSize: 60,
                        fontWeight: 'bold',
                        color: '#333',
                    }}
                >
                    NaijaBiz
                </div>
            ),
            { ...size }
        )
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #faf8f3, #ffffff)',
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
                {/* Logo or Initial */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '120px',
                        borderRadius: '24px',
                        backgroundColor: '#fff',
                        marginBottom: '30px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        border: '1px solid #eee',
                    }}
                >
                    {/* Note: Loading external images in OG generation can be flaky depending on host permissions. 
                      Ideally we use the logo, but for reliability we default to a styled initial if fetching image is complex.
                      For this demo we will use a nice initial. */}
                    <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#ea580c' }}>
                        {(business.business_name || 'N')[0].toUpperCase()}
                    </div>
                </div>

                {/* Business Name */}
                <div
                    style={{
                        fontSize: '70px',
                        fontWeight: 'bold',
                        color: '#1a1a1a',
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

                {/* Verified Badge */}
                {business.is_verified && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#dcfce7', // Green-100
                            padding: '10px 24px',
                            borderRadius: '50px',
                            marginBottom: '30px',
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="#16a34a"
                            style={{ marginRight: '10px' }}
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#15803d', // Green-700
                                letterSpacing: '0.05em',
                            }}
                        >
                            VERIFIED VENDOR
                        </span>
                    </div>
                )}

                {/* Description */}
                <div
                    style={{
                        fontSize: '32px',
                        color: '#4b5563',
                        maxWidth: '900px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '40px',
                    }}
                >
                    {business.description || `Order from ${business.business_name} on NaijaBiz.`}
                </div>

                {/* Footer with AI Hook */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff7ed', // Orange-50
                        border: '1px solid #fed7aa', // Orange-200
                        borderRadius: '100px',
                        padding: '8px 20px',
                    }}>
                        <div style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#ea580c', // Orange-600
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '12px',
                        }}>
                            ⚡ Powered by NaijaBiz AI
                        </div>
                        <div style={{
                            fontSize: '20px',
                            color: '#6b7280', // Gray-500
                        }}>
                            Create your own free page at <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>naijabiz.org</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
