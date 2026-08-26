import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'Fade Master - Owner Dashboard',
    short_name: 'Fade Owner',
    description: 'Track shop performance, revenue, and staff analytics in real-time.',
    start_url: '/owner',
    display: 'standalone',
    background_color: '#0e0e10',
    theme_color: '#d4af37',
    orientation: 'portrait',
    icons: [
      {
        src: '/fade-master-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/fade-master-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest);
}
