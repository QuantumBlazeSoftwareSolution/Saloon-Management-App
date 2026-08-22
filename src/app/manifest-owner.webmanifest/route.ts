import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'Sterling Groom - Owner Dashboard',
    short_name: 'Groom Analytics',
    description: 'Track shop performance, revenue, and staff analytics in real-time.',
    start_url: '/owner',
    display: 'standalone',
    background_color: '#0e0e10',
    theme_color: '#d4af37',
    orientation: 'portrait',
    icons: [
      {
        src: '/black-white-barber-logo-design_712567-4529.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/black-white-barber-logo-design_712567-4529.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest);
}
