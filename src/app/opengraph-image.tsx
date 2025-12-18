import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'NaijaBiz - Verified Vendor Directory'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
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
                }}
            >
                {/* Branding Container */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '40px',
                    }}
                >
                    {/* Shield Icon Representation */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px',
                            height: '120px',
                            backgroundColor: '#16a34a', // Green-600
                            borderRadius: '24px',
                            marginRight: '30px',
                            boxShadow: '0 8px 30px rgba(22, 163, 74, 0.3)',
                        }}
                    >
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        </svg>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                fontSize: '80px',
                                fontWeight: 'bold',
                                color: '#1a1a1a',
                                lineHeight: '1',
                                marginBottom: '10px',
                            }}
                        >
                            NaijaBiz
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#dcfce7', // Green-100
                                padding: '8px 20px',
                                borderRadius: '50px',
                                width: 'fit-content',
                            }}
                        >
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: '#16a34a', // Green-600
                                    marginRight: '10px',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#15803d', // Green-700
                                    letterSpacing: '0.05em',
                                }}
                            >
                                VERIFIED BUSINESS
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontSize: '40px',
                        color: '#4b5563',
                        textAlign: 'center',
                        maxWidth: '800px',
                        fontWeight: 'normal',
                        lineHeight: '1.4',
                    }}
                >
                    Your simple online page for{' '}
                    <span style={{ color: '#ea580c', fontWeight: 'bold' }}>WhatsApp</span> &{' '}
                    <span style={{ color: '#ea580c', fontWeight: 'bold' }}>Instagram</span> sales
                </div>

                {/* Footer/URL */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        fontSize: '24px',
                        color: '#9ca3af',
                        fontWeight: 'bold',
                    }}
                >
                    naijabiz.org
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
