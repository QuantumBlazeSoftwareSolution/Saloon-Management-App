'use server';

import { createService as dbCreateService, updateService as dbUpdateService } from '../db/services-catalog/write';
import { getServices, getServiceById as dbGetServiceById } from '../db/services-catalog/read';
import { ServiceCatalogInsert } from '../db/schema/services-catalog';
import { revalidatePath } from 'next/cache';

export async function createService(data: ServiceCatalogInsert) {
  console.log(`[createService] Attempting to create service: ${data.name}`);
  try {
    const service = await dbCreateService(data);
    console.log(`[createService] Success: created service ${service.id}`);
    revalidatePath('/owner/services');
    revalidatePath('/barber');
    return { success: true, data: service };
  } catch (error: any) {
    console.error(`[createService] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to create service.' };
  }
}

export async function updateService(id: string, data: Partial<ServiceCatalogInsert>) {
  console.log(`[updateService] Attempting to update service: ${id}`);
  try {
    const service = await dbUpdateService(id, data);
    console.log(`[updateService] Success: updated service ${service.id}`);
    revalidatePath('/owner/services');
    revalidatePath('/barber');
    return { success: true, data: service };
  } catch (error: any) {
    console.error(`[updateService] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to update service.' };
  }
}

export async function getAllServices(onlyActive = true) {
  console.log(`[getAllServices] Fetching services (onlyActive: ${onlyActive})`);
  try {
    const services = await getServices(onlyActive);
    console.log(`[getAllServices] Success: fetched ${services.length} services`);
    return { success: true, data: services };
  } catch (error: any) {
    console.error(`[getAllServices] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch services.' };
  }
}

export async function getServiceById(id: string) {
  console.log(`[getServiceById] Fetching service: ${id}`);
  try {
    const service = await dbGetServiceById(id);
    console.log(`[getServiceById] Success: found service ${service?.name}`);
    return { success: true, data: service };
  } catch (error: any) {
    console.error(`[getServiceById] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch service.' };
  }
}
