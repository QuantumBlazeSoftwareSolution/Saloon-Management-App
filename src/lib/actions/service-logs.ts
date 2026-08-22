'use server';

import { insertServiceLog as dbInsertServiceLog, deleteServiceLog as dbDeleteServiceLog } from '../db/service-logs/write';
import { getServiceLogs, getTodayServiceLogs as dbGetTodayServiceLogs, getBarberLogs as dbGetBarberLogs } from '../db/service-logs/read';
import { ServiceLogInsert } from '../db/schema/service-logs';
import { revalidatePath } from 'next/cache';

export async function createServiceLog(data: ServiceLogInsert) {
  console.log(`[createServiceLog] Attempting to create log for barber: ${data.barberId}, service: ${data.serviceId}`);
  try {
    const log = await dbInsertServiceLog(data);
    console.log(`[createServiceLog] Success: created log ${log.id}`);
    revalidatePath('/barber');
    revalidatePath('/barber/history');
    revalidatePath('/barber/earnings');
    revalidatePath('/owner');
    revalidatePath('/owner/analytics');
    return { success: true, data: log };
  } catch (error: any) {
    console.error(`[createServiceLog] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to log service.' };
  }
}

export async function deleteServiceLog(id: string) {
  console.log(`[deleteServiceLog] Attempting to delete log: ${id}`);
  try {
    const log = await dbDeleteServiceLog(id);
    console.log(`[deleteServiceLog] Success: deleted log ${log.id}`);
    revalidatePath('/barber/history');
    revalidatePath('/barber/earnings');
    revalidatePath('/owner');
    revalidatePath('/owner/analytics');
    return { success: true, data: log };
  } catch (error: any) {
    console.error(`[deleteServiceLog] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to delete service log.' };
  }
}

export async function getTodayServiceLogs() {
  console.log(`[getTodayServiceLogs] Fetching today's service logs`);
  try {
    const logs = await dbGetTodayServiceLogs();
    console.log(`[getTodayServiceLogs] Success: fetched ${logs.length} logs`);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error(`[getTodayServiceLogs] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch today\'s logs.' };
  }
}

export async function getBarberLogs(barberId: string) {
  console.log(`[getBarberLogs] Fetching logs for barber: ${barberId}`);
  try {
    const logs = await dbGetBarberLogs(barberId);
    console.log(`[getBarberLogs] Success: fetched ${logs.length} logs`);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error(`[getBarberLogs] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch barber logs.' };
  }
}

export async function getAllServiceLogs() {
  console.log(`[getAllServiceLogs] Fetching all service logs`);
  try {
    const logs = await getServiceLogs();
    console.log(`[getAllServiceLogs] Success: fetched ${logs.length} logs`);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error(`[getAllServiceLogs] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch logs.' };
  }
}
