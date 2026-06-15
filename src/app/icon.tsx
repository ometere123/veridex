import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #f6f1e9, #e6f0e8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(107, 142, 122, 0.18)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
          <path d="M28 10 40.5 17v14L28 46 15.5 31V17Z" stroke="#5E816E" strokeWidth="4" strokeLinejoin="round" />
          <path d="M19 31.5 25 25.5 29 29.5 37 21.5" stroke="#B8633F" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.5 17 28 24.5 40.5 17M15.5 31 28 24.5 40.5 31" stroke="#6B8E7A" strokeOpacity="0.34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="17" r="3.4" fill="#6B8E7A" />
          <circle cx="40.5" cy="17" r="3.4" fill="#6B8E7A" />
          <circle cx="40.5" cy="31" r="3.4" fill="#B8633F" />
          <circle cx="28" cy="46" r="3.4" fill="#6B8E7A" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
