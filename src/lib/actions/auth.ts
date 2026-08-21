'use server';

import { authenticateUser } from '../db/users/read';
import { getProfileById } from '../db/profiles/read';
import { sendOtpEmail } from '../email';
import bcrypt from 'bcryptjs';

const ownerOtpCache = new Map<string, { code: string; expires: number }>();

export async function loginBarberAction(phone: string, pinOrPassword: string) {
  try {
    const user = await authenticateUser(phone.trim());
    if (!user || user.role !== 'barber') {
      return { success: false, error: 'Invalid phone or PIN.' };
    }

    const isMatch = await bcrypt.compare(pinOrPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid phone or PIN.' };
    }

    const profile = await getProfileById(user.profileId);
    if (!profile || !profile.active) {
      return { success: false, error: 'Profile is inactive.' };
    }

    return { success: true, profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'Authentication failed.' };
  }
}

export async function loginOwnerAction(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await authenticateUser(cleanEmail);
    if (!user || user.role !== 'owner') {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Generate and send OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    ownerOtpCache.set(cleanEmail, { code: otp, expires: expiry });

    await sendOtpEmail(cleanEmail, otp);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Authentication failed.' };
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
      return { success: false, error: 'OTP expired.' };
    }

    if (record.code !== code.trim()) {
      return { success: false, error: 'Invalid OTP code.' };
    }

    ownerOtpCache.delete(cleanEmail);

    const user = await authenticateUser(cleanEmail);
    if (!user) {
      return { success: false, error: 'Owner account not found.' };
    }

    const profile = await getProfileById(user.profileId);
    return { success: true, profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'OTP verification failed.' };
  }
}
