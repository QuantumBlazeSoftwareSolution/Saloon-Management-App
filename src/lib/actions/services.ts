'use server';

import { db } from '../db';
import { servicesCatalogTable, ServiceCatalogInsert } from '../db/schema/services-catalog';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export async function createService(data: ServiceCatalogInsert) {
  console.log(`[createService] Attempting to create service: ${data.name} for saloon: ${data.saloonId}`);
  try {
    const [service] = await db
      .insert(servicesCatalogTable)
      .values(data)
      .returning();
    console.log(`[createService] Success: created service ${service.id}`);
    revalidatePath('/owner/services');
    revalidatePath('/barber');
    return { success: true, data: service };
  } catch (error: any) {
    console.error(`[createService] Error: ${error.message}`);
    return { success: false, error: 'Failed to create service. Please try again.' };
  }
}

export async function updateService(id: string, data: Partial<ServiceCatalogInsert>) {
  console.log(`[updateService] Attempting to update service: ${id}`);
  try {
    const [service] = await db
      .update(servicesCatalogTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servicesCatalogTable.id, id))
      .returning();
    console.log(`[updateService] Success: updated service ${service.id}`);
    revalidatePath('/owner/services');
    revalidatePath('/barber');
    return { success: true, data: service };
  } catch (error: any) {
    console.error(`[updateService] Error: ${error.message}`);
    return { success: false, error: 'Failed to update service. Please try again.' };
  }
}

export async function getAllServices(onlyActive = true, saloonId?: string) {
  console.log(`[getAllServices] Fetching services (onlyActive: ${onlyActive}, saloonId: ${saloonId})`);
  try {
    if (!saloonId) {
      return { success: true, data: [] };
    }
    const cond = onlyActive 
      ? and(eq(servicesCatalogTable.active, true), eq(servicesCatalogTable.saloonId, saloonId))
      : eq(servicesCatalogTable.saloonId, saloonId);

    const services = await db
      .select()
      .from(servicesCatalogTable)
      .where(cond);

    console.log(`[getAllServices] Success: fetched ${services.length} services`);
    return { success: true, data: services };
  } catch (error: any) {
    console.error(`[getAllServices] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch services. Please try again.' };
  }
}

export async function getServiceById(id: string) {
  console.log(`[getServiceById] Fetching service: ${id}`);
  try {
    const [service] = await db
      .select()
      .from(servicesCatalogTable)
      .where(eq(servicesCatalogTable.id, id))
      .limit(1);
    console.log(`[getServiceById] Success: found service ${service?.name}`);
    return { success: true, data: service || null };
  } catch (error: any) {
    console.error(`[getServiceById] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch service. Please try again.' };
  }
}
