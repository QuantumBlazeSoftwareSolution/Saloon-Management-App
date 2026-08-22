'use server';

import { authenticateUser } from '../db/users/read';
import { getProfileById } from '../db/profiles/read';
import { sendOtpEmail } from '../email';
import { db } from '../db';
import { usersTable } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    
    await db
      .update(usersTable)
      .set({ otp, otpExpires: expiry })
      .where(eq(usersTable.id, user.id));

    await sendOtpEmail(cleanEmail, otp);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Authentication failed.' };
  }
}

export async function verifyOwnerOtpAction(email: string, code: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await authenticateUser(cleanEmail);
    if (!user || user.role !== 'owner') {
      return { success: false, error: 'Owner account not found.' };
    }

    if (!user.otp || !user.otpExpires) {
      return { success: false, error: 'OTP has not been requested.' };
    }

    if (new Date() > new Date(user.otpExpires)) {
      return { success: false, error: 'OTP expired.' };
    }

    if (user.otp !== code.trim()) {
      return { success: false, error: 'Invalid OTP code.' };
    }

    
    await db
      .update(usersTable)
      .set({ otp: null, otpExpires: null })
      .where(eq(usersTable.id, user.id));

    const profile = await getProfileById(user.profileId);
    return { success: true, profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'OTP verification failed.' };
  }
}
