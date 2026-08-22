'use server';

import { createProfile, updateProfile } from '../db/profiles/write';
import { getProfileById, getProfilesBySaloonId, authenticateProfile } from '../db/profiles/read';
import { profilesTable, ProfileInsert } from '../db/schema/profiles';
import { usersTable } from '../db/schema/users';
import { saloonsTable } from '../db/schema/saloons';
import { db } from '../db';
import { revalidatePath } from 'next/cache';
import { sendOtpEmail } from '../email';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const ownerOtpCache = new Map<string, { code: string; expires: number }>();

export async function createProfileAction(data: ProfileInsert) {
  try {
    const finalData = { ...data };
    
    if (finalData.role === 'barber' && !finalData.pin) {
      finalData.pin = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, finalData.phone))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'This phone number is already registered.' };
    }

    if (finalData.email) {
      const existingEmail = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, finalData.email))
        .limit(1);

      if (existingEmail.length > 0) {
        return { success: false, error: 'This email address is already registered.' };
      }
    }

    const profile = await createProfile(finalData);

    const pinToHash = finalData.pin || '1234';
    const passwordHash = await bcrypt.hash(pinToHash, 10);
    await db.insert(usersTable).values({
      phone: profile.phone,
      passwordHash,
      role: profile.role as 'owner' | 'barber',
      profileId: profile.id,
      email: profile.email || null,
    });

    revalidatePath('/owner/staff');
    return { success: true, data: profile };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: 'Failed to create staff profile.' };
  }
}

export async function updateProfileAction(id: string, data: Partial<ProfileInsert>) {
  try {
    const profile = await updateProfile(id, data);
    revalidatePath('/owner/staff');
    revalidatePath('/barber/profile');
    return { success: true, data: profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update profile.' };
  }
}

export async function authenticateProfileAction(role: 'barber' | 'owner', identifier: string, pin?: string) {
  try {
    const profile = await authenticateProfile(role, identifier, pin);
    return { success: true, data: profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'Authentication failed.' };
  }
}

export async function sendOwnerOtpAction(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    ownerOtpCache.set(cleanEmail, { code: otp, expires: expiry });

    await sendOtpEmail(cleanEmail, otp);

    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer OTP delivery failure:', error);
    return { success: false, error: error.message || 'Failed to send OTP email.' };
  }
}

export async function verifyOwnerOtpAction(email: string, code: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const record = ownerOtpCache.get(cleanEmail);

    if (!record) {
      return { success: false, error: 'OTP has not been requested or has expired.' };
    }

    if (Date.now() > record.expires) {
      ownerOtpCache.delete(cleanEmail);
      return { success: false, error: 'OTP verification code has expired.' };
    }

    if (record.code !== code.trim()) {
      return { success: false, error: 'Invalid verification code.' };
    }

    ownerOtpCache.delete(cleanEmail);

    const profile = await authenticateProfile('owner', cleanEmail);
    
    return { success: true, data: profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'OTP verification failed.' };
  }
}

export async function getProfilesBySaloonIdAction(saloonId: string) {
  try {
    const profiles = await getProfilesBySaloonId(saloonId);
    return { success: true, data: profiles };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profiles.' };
  }
}

export async function getProfileByIdAction(id: string) {
  try {
    const profile = await getProfileById(id);
    return { success: true, data: profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profile.' };
  }
}

export async function checkAndHealSaloonAction(profileId: string) {
  try {
    const profile = await getProfileById(profileId);
    if (!profile) return { success: false, error: 'Profile not found' };

    if (!profile.saloonId) {
      const existingSaloon = await db
        .select()
        .from(saloonsTable)
        .where(eq(saloonsTable.ownerId, profile.id))
        .limit(1);

      let saloonId = existingSaloon[0]?.id;

      if (!saloonId) {
        const [newSaloon] = await db
          .insert(saloonsTable)
          .values({
            name: `${profile.fullName}'s Saloon`,
            commissionDefaultPct: 50,
            ownerId: profile.id,
          })
          .returning();
        saloonId = newSaloon.id;
      }

      const updatedProfile = await db
        .update(profilesTable)
        .set({ saloonId })
        .where(eq(profilesTable.id, profile.id))
        .returning();

      return { success: true, profile: updatedProfile[0] };
    }

    return { success: true, profile };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
