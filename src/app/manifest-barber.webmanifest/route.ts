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
        src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=192&auto=format&fit=crop&q=60',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
      {
        src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=512&auto=format&fit=crop&q=60',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };

  return NextResponse.json(manifest);
}
