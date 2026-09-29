import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Qriblo — a professional home for your brand'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '58px 72px',
        overflow: 'hidden',
        color: '#fff4e6',
        background: 'linear-gradient(135deg, #66351f 0%, #3a2028 100%)',
        fontFamily: 'Georgia, serif',
      }}>
        <div style={{ position: 'absolute', top: '-270px', right: '-70px', width: '620px', height: '620px', border: '1px solid rgba(244,199,161,.24)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '-220px', right: '-20px', width: '520px', height: '520px', border: '1px solid rgba(244,199,161,.17)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: '140px', bottom: '60px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(244,199,161,.06)' }} />
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '29px', letterSpacing: '-1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', color: '#66351f', background: '#f4c7a1', fontSize: '23px' }}>Q</div>
          Qriblo
        </div>
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', maxWidth: '920px' }}>
          <div style={{ marginBottom: '22px', color: '#f4c7a1', fontFamily: 'Arial, sans-serif', fontSize: '15px', fontWeight: 700, letterSpacing: '3px' }}>YOUR BRAND, A LITTLE CLOSER</div>
          <div style={{ fontSize: '65px', lineHeight: 1.08, letterSpacing: '-2px' }}>Delivering customers<br />to your doorstep.</div>
          <div style={{ maxWidth: '760px', marginTop: '22px', color: 'rgba(255,244,230,.76)', fontFamily: 'Arial, sans-serif', fontSize: '23px', lineHeight: 1.45 }}>Handle inquiries, showcase products or services, and receive orders on WhatsApp.</div>
        </div>
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid rgba(255,244,230,.18)', color: 'rgba(255,244,230,.7)', fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
          <span>Made for the brands bringing us closer.</span>
          <span style={{ color: '#f4c7a1', fontWeight: 700, letterSpacing: '1px' }}>QRIBLO.COM</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
