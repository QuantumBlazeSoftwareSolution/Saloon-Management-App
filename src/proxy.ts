import { NextRequest, NextResponse } from 'next/server';

function safeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  if (aBytes.length !== bBytes.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }

  return result === 0;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Validate API key for all routes starting with /api
  if (pathname.startsWith('/api')) {
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = process.env.API_KEY || 'sterling-secret-key-101';

    if (!apiKey || !safeCompare(apiKey, expectedKey)) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
