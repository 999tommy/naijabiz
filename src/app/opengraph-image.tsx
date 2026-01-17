import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'NaijaBiz - AI Storefront for Nigerian Businesses'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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
                    padding: '60px',
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                {/* Background Decor */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

                {/* Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff7ed',
                        border: '2px solid #fed7aa',
                        borderRadius: '50px',
                        padding: '12px 32px',
                        marginBottom: '40px',
                        boxShadow: '0 4px 12px rgba(234,88,12,0.1)',
                    }}
                >
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>🤖</span>
                    <span
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#c2410c', // Orange-700
                        }}
                    >
                        New: AI Sales Assistant Included
                    </span>
                </div>

                {/* Headline */}
                <div
                    style={{
                        fontSize: '80px',
                        fontWeight: '800',
                        color: '#1a1a1a',
                        lineHeight: '1.1',
                        marginBottom: '24px',
                        letterSpacing: '-0.02em',
                        backgroundClip: 'text',
                    }}
                >
                    Your brand needs an <span style={{ color: '#ea580c' }}>AI-powered</span> online page.
                </div>

                {/* Subheadline */}
                <div
                    style={{
                        fontSize: '32px',
                        color: '#4b5563',
                        maxWidth: '900px',
                        lineHeight: '1.5',
                        marginBottom: '50px',
                    }}
                >
                    Create a free professional store for your Nigerian business.
                    <br />
                    Replies to WhatsApp customers while you sleep.
                </div>

                {/* URL */}
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        padding: '16px 40px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    naijabiz.org
                </div>
            </div>
        ),
        { ...size }
    )
}
