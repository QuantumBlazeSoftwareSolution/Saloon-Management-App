'use server';

import { db } from '../db';
import { serviceLogsTable, ServiceLogInsert } from '../db/schema/service-logs';
import { servicesCatalogTable } from '../db/schema/services-catalog';
import { profilesTable } from '../db/schema/profiles';
import { revalidatePath } from 'next/cache';
import { eq, and, gte } from 'drizzle-orm';

export async function createServiceLog(data: ServiceLogInsert) {
  console.log(`[createServiceLog] Attempting to create log for barber: ${data.barberId}, service: ${data.serviceId}, saloon: ${data.saloonId}`);
  try {
    const [log] = await db
      .insert(serviceLogsTable)
      .values(data)
      .returning();
    console.log(`[createServiceLog] Success: created log ${log.id}`);
    revalidatePath('/barber');
    revalidatePath('/barber/history');
    revalidatePath('/barber/earnings');
    revalidatePath('/owner');
    revalidatePath('/owner/analytics');
    return { success: true, data: log };
  } catch (error: any) {
    console.error(`[createServiceLog] Error: ${error.message}`);
    return { success: false, error: 'Failed to log service. Please try again.' };
  }
}

export async function deleteServiceLog(id: string) {
  console.log(`[deleteServiceLog] Attempting to delete log: ${id}`);
  try {
    const [log] = await db
      .delete(serviceLogsTable)
      .where(eq(serviceLogsTable.id, id))
      .returning();
    console.log(`[deleteServiceLog] Success: deleted log ${log.id}`);
    revalidatePath('/barber/history');
    revalidatePath('/barber/earnings');
    revalidatePath('/owner');
    revalidatePath('/owner/analytics');
    return { success: true, data: log };
  } catch (error: any) {
    console.error(`[deleteServiceLog] Error: ${error.message}`);
    return { success: false, error: 'Failed to delete service log. Please try again.' };
  }
}

export async function getTodayServiceLogs(saloonId?: string) {
  console.log(`[getTodayServiceLogs] Fetching today's service logs for saloon: ${saloonId}`);
  try {
    if (!saloonId) return { success: true, data: [] };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await db
      .select({
        id: serviceLogsTable.id,
        barberId: serviceLogsTable.barberId,
        serviceId: serviceLogsTable.serviceId,
        priceAtTime: serviceLogsTable.priceAtTime,
        discountPct: serviceLogsTable.discountPct,
        commissionPct: serviceLogsTable.commissionPct,
        commissionAmount: serviceLogsTable.commissionAmount,
        netAmount: serviceLogsTable.netAmount,
        createdAt: serviceLogsTable.createdAt,
        updatedAt: serviceLogsTable.updatedAt,
        serviceName: servicesCatalogTable.name,
        barberName: profilesTable.fullName,
      })
      .from(serviceLogsTable)
      .leftJoin(servicesCatalogTable, eq(serviceLogsTable.serviceId, servicesCatalogTable.id))
      .leftJoin(profilesTable, eq(serviceLogsTable.barberId, profilesTable.id))
      .where(and(gte(serviceLogsTable.createdAt, today), eq(serviceLogsTable.saloonId, saloonId)));

    console.log(`[getTodayServiceLogs] Success: fetched ${logs.length} logs`);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error(`[getTodayServiceLogs] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch today\'s logs. Please try again.' };
  }
}

export async function getBarberLogs(barberId: string) {
  console.log(`[getBarberLogs] Fetching logs for barber: ${barberId}`);
  try {
    const logs = await db
      .select({
        id: serviceLogsTable.id,
        barberId: serviceLogsTable.barberId,
        serviceId: serviceLogsTable.serviceId,
        priceAtTime: serviceLogsTable.priceAtTime,
        discountPct: serviceLogsTable.discountPct,
        commissionPct: serviceLogsTable.commissionPct,
        commissionAmount: serviceLogsTable.commissionAmount,
        netAmount: serviceLogsTable.netAmount,
        createdAt: serviceLogsTable.createdAt,
        updatedAt: serviceLogsTable.updatedAt,
        serviceName: servicesCatalogTable.name,
        barberName: profilesTable.fullName,
      })
      .from(serviceLogsTable)
      .leftJoin(servicesCatalogTable, eq(serviceLogsTable.serviceId, servicesCatalogTable.id))
      .leftJoin(profilesTable, eq(serviceLogsTable.barberId, profilesTable.id))
      .where(eq(serviceLogsTable.barberId, barberId));

    console.log(`[getBarberLogs] Success: fetched ${logs.length} logs`);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error(`[getBarberLogs] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch barber logs. Please try again.' };
  }
}

export async function getAllServiceLogs(saloonId?: string) {
  console.log(`[getAllServiceLogs] Fetching all service logs for saloon: ${saloonId}`);
  try {
    if (!saloonId) return { success: true, data: [] };
    const logs = await db
      .select({
        id: serviceLogsTable.id,
        barberId: serviceLogsTable.barberId,
        serviceId: serviceLogsTable.serviceId,
        priceAtTime: serviceLogsTable.priceAtTime,
        discountPct: serviceLogsTable.discountPct,
        commissionPct: serviceLogsTable.commissionPct,
        commissionAmount: serviceLogsTable.commissionAmount,
        netAmount: serviceLogsTable.netAmount,
        createdAt: serviceLogsTable.createdAt,
        updatedAt: serviceLogsTable.updatedAt,
        serviceName: servicesCatalogTable.name,
        barberName: profilesTable.fullName,
      })
      .from(serviceLogsTable)
      .leftJoin(servicesCatalogTable, eq(serviceLogsTable.serviceId, servicesCatalogTable.id))
      .leftJoin(profilesTable, eq(serviceLogsTable.barberId, profilesTable.id))
      .where(eq(serviceLogsTable.saloonId, saloonId));

    console.log(`[getAllServiceLogs] Success: fetched ${logs.length} logs`);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error(`[getAllServiceLogs] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch logs. Please try again.' };
  }
}
