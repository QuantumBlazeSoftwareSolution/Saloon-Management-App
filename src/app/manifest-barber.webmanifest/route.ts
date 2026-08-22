import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'Sterling Groom - Barber Portal',
    short_name: 'Groom Barber',
    description: 'Log and track customer services in seconds.',
    start_url: '/barber',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#e5a93b',
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
