import { db } from '../index';
import { servicesCatalogTable, ServiceCatalogInsert } from '../schema/services-catalog';
import { eq } from 'drizzle-orm';

export async function createService(data: ServiceCatalogInsert) {
  const result = await db
    .insert(servicesCatalogTable)
    .values(data)
    .returning();
  return result[0];
}

export async function updateService(id: string, data: Partial<ServiceCatalogInsert>) {
  const result = await db
    .update(servicesCatalogTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(servicesCatalogTable.id, id))
    .returning();
  return result[0];
}
