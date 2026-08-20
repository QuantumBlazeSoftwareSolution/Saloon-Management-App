import { db } from '../index';
import { serviceLogsTable, ServiceLogInsert } from '../schema/service-logs';
import { eq } from 'drizzle-orm';

export async function insertServiceLog(data: ServiceLogInsert) {
  const result = await db
    .insert(serviceLogsTable)
    .values(data)
    .returning();
  return result[0];
}

export async function deleteServiceLog(id: string) {
  const result = await db
    .delete(serviceLogsTable)
    .where(eq(serviceLogsTable.id, id))
    .returning();
  return result[0] || null;
}
