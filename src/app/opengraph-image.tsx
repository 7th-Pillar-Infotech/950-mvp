import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '$950 MVP - From Idea to Product';
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
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(234, 88, 12, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px)',
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
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginBottom: '40px',
              fontFamily: 'Georgia, serif',
              fontSize: '72px',
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
            <span style={{ color: '#ffffff', marginLeft: '16px' }}>MVP</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '24px',
              maxWidth: '900px',
              lineHeight: 1.2,
            }}
          >
            From Idea to Product
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              maxWidth: '700px',
              lineHeight: 1.5,
            }}
          >
            Get a scalable, investor-ready MVP for $950 — web apps, AI chatbots, voice agents, and automation.
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '48px',
              padding: '16px 32px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '9999px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
              }}
            />
            <span style={{ color: '#fafafa', fontSize: '20px' }}>
              Built by 7th Pillar • 10+ years experience
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
