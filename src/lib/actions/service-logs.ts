'use server';

import { insertServiceLog, deleteServiceLog } from '../db/service-logs/write';
import { getServiceLogsBySaloonId, getTodayServiceLogs, getBarberLogs } from '../db/service-logs/read';
import { ServiceLogInsert } from '../db/schema/service-logs';
import { revalidatePath } from 'next/cache';

export async function insertServiceLogAction(data: ServiceLogInsert) {
  try {
    const log = await insertServiceLog(data);
    revalidatePath('/barber');
    revalidatePath('/barber/history');
    revalidatePath('/barber/earnings');
    revalidatePath('/owner');
    revalidatePath('/owner/analytics');
    return { success: true, data: log };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to log service.' };
  }
}

export async function deleteServiceLogAction(id: string) {
  try {
    const log = await deleteServiceLog(id);
    revalidatePath('/barber/history');
    revalidatePath('/barber/earnings');
    revalidatePath('/owner');
    revalidatePath('/owner/analytics');
    return { success: true, data: log };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete service log.' };
  }
}

export async function getTodayServiceLogsAction(saloonId: string) {
  try {
    const logs = await getTodayServiceLogs(saloonId);
    return { success: true, data: logs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch today\'s logs.' };
  }
}

export async function getBarberLogsAction(barberId: string) {
  try {
    const logs = await getBarberLogs(barberId);
    return { success: true, data: logs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch barber logs.' };
  }
}

export async function getServiceLogsBySaloonIdAction(saloonId: string) {
  try {
    const logs = await getServiceLogsBySaloonId(saloonId);
    return { success: true, data: logs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch saloon logs.' };
  }
}
