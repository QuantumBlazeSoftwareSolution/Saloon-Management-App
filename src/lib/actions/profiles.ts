'use server';

import { createProfile, updateProfile } from '../db/profiles/write';
import { getProfileById, getProfilesBySaloonId, authenticateProfile } from '../db/profiles/read';
import { ProfileInsert } from '../db/schema/profiles';
import { usersTable } from '../db/schema/users';
import { db } from '../db';
import { revalidatePath } from 'next/cache';
import { sendOtpEmail } from '../email';
import bcrypt from 'bcryptjs';

// Temporary in-memory OTP store for owners
const ownerOtpCache = new Map<string, { code: string; expires: number }>();

export async function createProfileAction(data: ProfileInsert) {
  try {
    const finalData = { ...data };
    
    // Generate random 4-digit PIN for barbers if not already specified
    if (finalData.role === 'barber' && !finalData.pin) {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      finalData.pin = generatedPin;
    }

    const profile = await createProfile(finalData);

    // Create corresponding user credentials record
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
    return { success: false, error: error.message || 'Failed to create profile.' };
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

// Generates and emails a 6-digit OTP code to the owner
export async function sendOwnerOtpAction(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Generate a 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store in cache
    ownerOtpCache.set(cleanEmail, { code: otp, expires: expiry });

    // Send email using Nodemailer utility
    await sendOtpEmail(cleanEmail, otp);

    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer OTP delivery failure:', error);
    return { success: false, error: error.message || 'Failed to send OTP email.' };
  }
}

// Verifies the owner's OTP code
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

    // Success - clear cache record
    ownerOtpCache.delete(cleanEmail);

    // Call authentication profile retrieval
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
