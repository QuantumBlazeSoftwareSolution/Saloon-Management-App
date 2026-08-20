'use server';

import { createService, updateService } from '../db/services-catalog/write';
import { getServicesBySaloonId, getServiceById } from '../db/services-catalog/read';
import { ServiceCatalogInsert } from '../db/schema/services-catalog';
import { revalidatePath } from 'next/cache';

export async function createServiceAction(data: ServiceCatalogInsert) {
  try {
    const service = await createService(data);
    revalidatePath('/owner/services');
    revalidatePath('/barber');
    return { success: true, data: service };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create service catalog entry.' };
  }
}

export async function updateServiceAction(id: string, data: Partial<ServiceCatalogInsert>) {
  try {
    const service = await updateService(id, data);
    revalidatePath('/owner/services');
    revalidatePath('/barber');
    return { success: true, data: service };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update service.' };
  }
}

export async function getServicesBySaloonIdAction(saloonId: string, onlyActive = true) {
  try {
    const services = await getServicesBySaloonId(saloonId, onlyActive);
    return { success: true, data: services };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch services.' };
  }
}

export async function getServiceByIdAction(id: string) {
  try {
    const service = await getServiceById(id);
    return { success: true, data: service };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch service details.' };
  }
}
