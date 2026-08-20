'use server';

import { createProfile, updateProfile } from '../db/profiles/write';
import { getProfileById, getProfilesBySaloonId, authenticateProfile } from '../db/profiles/read';
import { ProfileInsert } from '../db/schema/profiles';
import { revalidatePath } from 'next/cache';

export async function createProfileAction(data: ProfileInsert) {
  try {
    const profile = await createProfile(data);
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

export async function authenticateProfileAction(role: 'barber' | 'owner', identifier: string) {
  try {
    const profile = await authenticateProfile(role, identifier);
    return { success: true, data: profile };
  } catch (error: any) {
    return { success: false, error: error.message || 'Authentication failed.' };
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
