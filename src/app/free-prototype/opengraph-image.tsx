import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Free Prototype - $950 MVP';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          {/* Free Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '32px',
              padding: '12px 24px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '9999px',
            }}
          >
            <span style={{ color: '#10b981', fontSize: '28px', fontWeight: 700 }}>
              FREE
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '24px',
              maxWidth: '900px',
              lineHeight: 1.2,
            }}
          >
            Get a Working Prototype
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              maxWidth: '800px',
              lineHeight: 1.4,
              marginBottom: '40px',
            }}
          >
            Real screens. Real code. Delivered in 24-48 hours. No strings attached.
          </div>

          {/* What you get */}
          <div
            style={{
              display: 'flex',
              gap: '32px',
              marginTop: '16px',
            }}
          >
            {['3-5 Clickable Screens', 'Landing Page', 'Live URL'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ color: '#f59e0b', fontSize: '20px' }}>✓</span>
                <span style={{ color: '#fafafa', fontSize: '18px' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginTop: '48px',
              fontFamily: 'Georgia, serif',
              fontSize: '32px',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              $950
            </span>
            <span style={{ color: '#a1a1aa', marginLeft: '8px' }}>MVP</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
