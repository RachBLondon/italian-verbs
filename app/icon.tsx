import { ImageResponse } from 'next/server';

export const size = {
  width: 32,
  height: 32
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF'
        }}
      >
        <div style={{ fontSize: 26, lineHeight: 1, transform: 'translateY(1px)' }}>{'🇮🇹'}</div>
      </div>
    ),
    {
      ...size
    }
  );
}
