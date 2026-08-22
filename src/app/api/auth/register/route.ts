import { NextResponse } from 'next/server';
import { createProfile } from '@/lib/db/profiles/write';
import { createUser } from '@/lib/db/users/write';
import { authenticateUser } from '@/lib/db/users/read';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {

    const body = await request.json();
    const { role, fullName, phone, email, password, commissionPct } = body;

    if (!role || !fullName || !phone || !password) {
      return NextResponse.json({ error: 'Missing role, fullName, phone, or password' }, { status: 400 });
    }

    const existingUser = await authenticateUser(phone);
    if (existingUser) {
      return NextResponse.json({ error: 'User phone number already registered' }, { status: 400 });
    }

    const profile = await createProfile({
      role,
      fullName,
      phone,
      email: email || null,
      commissionPct: commissionPct || (role === 'barber' ? 50 : 0),
      pin: null, 
      active: true,
    });

    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      email: email || null,
      phone,
      passwordHash,
      role,
      profileId: profile.id,
    });

    return NextResponse.json({
      success: true,
      profile,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileId: user.profileId,
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
