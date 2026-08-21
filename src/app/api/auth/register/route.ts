import { NextResponse } from 'next/server';
import { createProfile } from '@/lib/db/profiles/write';
import { authenticateProfile } from '@/lib/db/profiles/read';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.API_KEY || 'sterling-secret-key-101';

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized. Invalid API key.' }, { status: 401 });
    }

    const body = await request.json();
    const { role, fullName, phone, email, commissionPct, pin, saloonId } = body;

    if (!role || !fullName || !phone) {
      return NextResponse.json({ error: 'Missing required fields: role, fullName, phone' }, { status: 400 });
    }

    if (role !== 'barber' && role !== 'owner') {
      return NextResponse.json({ error: 'Invalid role. Must be owner or barber.' }, { status: 400 });
    }

    // Check if phone already registered
    const existing = await authenticateProfile(role, phone);
    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered.' }, { status: 400 });
    }

    const created = await createProfile({
      saloonId: saloonId || null,
      role,
      fullName,
      phone,
      email: email || null,
      commissionPct: commissionPct || (role === 'barber' ? 50 : 0),
      pin: pin || (role === 'barber' ? Math.floor(1000 + Math.random() * 9000).toString() : null),
      active: true,
    });

    return NextResponse.json({ success: true, profile: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
