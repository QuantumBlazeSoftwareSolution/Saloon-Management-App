'use server';

import { createSaloon, updateSaloonName } from '../db/saloons/write';
import { getSaloonById, getSaloonByOwnerId } from '../db/saloons/read';
import { SaloonInsert } from '../db/schema/saloons';
import { revalidatePath } from 'next/cache';

export async function createSaloonAction(data: SaloonInsert) {
  try {
    const saloon = await createSaloon(data);
    revalidatePath('/owner');
    return { success: true, data: saloon };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create saloon.' };
  }
}

export async function updateSaloonNameAction(id: string, name: string) {
  try {
    const saloon = await updateSaloonName(id, name);
    revalidatePath('/owner/settings');
    return { success: true, data: saloon };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update saloon name.' };
  }
}

export async function getSaloonByIdAction(id: string) {
  try {
    const saloon = await getSaloonById(id);
    return { success: true, data: saloon };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch saloon.' };
  }
}

export async function getSaloonByOwnerIdAction(ownerId: string) {
  try {
    const saloon = await getSaloonByOwnerId(ownerId);
    return { success: true, data: saloon };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch saloon by owner ID.' };
  }
}
