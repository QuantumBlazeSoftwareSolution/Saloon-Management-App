import { db } from '../index';
import { servicesCatalogTable } from '../schema/services-catalog';
import { eq, and } from 'drizzle-orm';

export async function getServices(onlyActive = true) {
  if (onlyActive) {
    return await db
      .select()
      .from(servicesCatalogTable)
      .where(eq(servicesCatalogTable.active, true));
  }
  return await db
    .select()
    .from(servicesCatalogTable);
}

export async function getServiceById(id: string) {
  const result = await db
    .select()
    .from(servicesCatalogTable)
    .where(eq(servicesCatalogTable.id, id))
    .limit(1);
  return result[0] || null;
}
