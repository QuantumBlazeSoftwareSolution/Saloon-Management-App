'use server';

import { authenticateUser } from '../db/users/read';
import { getProfileById } from '../db/profiles/read';
import { sendOtpEmail } from '../email';
import { db } from '../db';
import { usersTable } from '../db/schema/users';
import { profilesTable } from '../db/schema/profiles';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function loginBarberAction(phone: string, pinOrPassword: string) {
  try {
    const user = await authenticateUser(phone.trim());
    if (!user || user.role !== 'barber') {
      return { success: false, error: 'Invalid phone or PIN.' };
    }

    if (!user.passwordHash) {
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
    console.error(`[loginBarberAction] Error: ${error.message}`);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
}

export async function loginOwnerAction(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await authenticateUser(cleanEmail);
    if (!user || user.role !== 'owner') {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (!user.passwordHash) {
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
    console.error(`[loginOwnerAction] Error: ${error.message}`);
    return { success: false, error: 'Authentication failed. Please try again.' };
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
    console.error(`[verifyOwnerOtpAction] Error: ${error.message}`);
    return { success: false, error: 'OTP verification failed. Please try again.' };
  }
}

export async function loginAdminAction(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await authenticateUser(cleanEmail);
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Invalid credentials or access denied.' };
    }

    if (!user.passwordHash) {
      return { success: false, error: 'Invalid credentials or access denied.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid credentials or access denied.' };
    }

    const profile = await getProfileById(user.profileId);
    if (!profile) {
      return { success: false, error: 'Admin profile not found.' };
    }

    return { success: true, profile };
  } catch (error: any) {
    console.error(`[loginAdminAction] Error: ${error.message}`);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
}

export async function resetPasswordAction(token: string, email: string, newPassword: string) {
  console.log(`[resetPasswordAction] Resetting password for: ${email}`);
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await authenticateUser(cleanEmail);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (!user.otp || !user.otpExpires) {
      return { success: false, error: 'No active password setup request found.' };
    }

    if (new Date() > new Date(user.otpExpires)) {
      return { success: false, error: 'Setup link/OTP has expired.' };
    }

    if (user.otp !== token.trim()) {
      return { success: false, error: 'Invalid setup token/OTP.' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ passwordHash: newHash, otp: null, otpExpires: null })
      .where(eq(usersTable.id, user.id));

    console.log(`[resetPasswordAction] Success: updated password for ${user.id}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[resetPasswordAction] Error: ${error.message}`);
    return { success: false, error: 'Failed to reset password. Please try again.' };
  }
}
