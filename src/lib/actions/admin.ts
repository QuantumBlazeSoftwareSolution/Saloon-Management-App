'use server';

import { db } from '../db';
import { saloonsTable } from '../db/schema/saloons';
import { profilesTable } from '../db/schema/profiles';
import { usersTable } from '../db/schema/users';
import { sendSaloonSetupEmail } from '../email';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function getAllSaloons() {
  console.log(`[getAllSaloons] Fetching all saloons`);
  try {
    const result = await db
      .select({
        id: saloonsTable.id,
        name: saloonsTable.name,
        createdAt: saloonsTable.createdAt,
      })
      .from(saloonsTable);

    console.log(`[getAllSaloons] Success: fetched ${result.length} saloons`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[getAllSaloons] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch saloons. Please try again.' };
  }
}

export async function createSaloonAndOwner(
  saloonName: string,
  ownerName: string,
  ownerPhone: string,
  ownerEmail: string
) {
  console.log(`[createSaloonAndOwner] Creating saloon: ${saloonName}, owner: ${ownerName}`);
  try {
    const cleanEmail = ownerEmail.trim().toLowerCase();
    const cleanPhone = ownerPhone.trim();

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, cleanPhone))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'Phone number already registered.' };
    }

    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return { success: false, error: 'Email address already registered.' };
    }

    const [saloon] = await db
      .insert(saloonsTable)
      .values({ name: saloonName })
      .returning();

    const [profile] = await db
      .insert(profilesTable)
      .values({
        saloonId: saloon.id,
        role: 'owner',
        fullName: ownerName,
        phone: cleanPhone,
        email: cleanEmail,
        commissionPct: 100,
        active: true,
      })
      .returning();

    const placeholderHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await db
      .insert(usersTable)
      .values({
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash: placeholderHash,
        role: 'owner',
        profileId: profile.id,
        otp: token,
        otpExpires: tokenExpires,
      });

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const setupLink = `${origin}/auth/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${token}`;

    await sendSaloonSetupEmail(cleanEmail, saloonName, setupLink);

    console.log(`[createSaloonAndOwner] Success: created saloon ${saloon.id} and owner profile ${profile.id}`);
    return { success: true, data: { saloon, profile } };
  } catch (error: any) {
    console.error(`[createSaloonAndOwner] Error: ${error.message}`);
    return { success: false, error: 'Failed to create saloon and owner. Please try again.' };
  }
}

export async function requestSaloonSetup(
  saloonName: string,
  ownerEmail: string,
  ownerPhone: string
) {
  console.log(`[requestSaloonSetup] Saloon name: ${saloonName}, Owner email: ${ownerEmail}`);
  try {
    const [saloon] = await db
      .insert(saloonsTable)
      .values({
        name: saloonName,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerPhone: ownerPhone.trim(),
        status: 'pending',
      })
      .returning();

    console.log(`[requestSaloonSetup] Success: created pending saloon request ${saloon.id}`);
    return { success: true, data: saloon };
  } catch (error: any) {
    console.error(`[requestSaloonSetup] Error: ${error.message}`);
    return { success: false, error: 'Failed to register saloon request. Please try again.' };
  }
}
