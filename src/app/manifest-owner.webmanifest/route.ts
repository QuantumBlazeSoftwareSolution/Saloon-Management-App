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
        src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=192&auto=format&fit=crop&q=60',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
      {
        src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=512&auto=format&fit=crop&q=60',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };

  return NextResponse.json(manifest);
}
