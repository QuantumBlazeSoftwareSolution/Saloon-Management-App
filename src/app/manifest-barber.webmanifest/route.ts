import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'Fade Master - Barber Portal',
    short_name: 'Fade Barber',
    description: 'Log and track customer services in seconds.',
    start_url: '/barber',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#e5a93b',
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
