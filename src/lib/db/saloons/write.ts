import { db } from '../index';
import { saloonsTable, SaloonInsert } from '../schema/saloons';
import { eq } from 'drizzle-orm';

export async function createSaloon(data: SaloonInsert) {
  const result = await db
    .insert(saloonsTable)
    .values(data)
    .returning();
  return result[0];
}

export async function updateSaloonName(id: string, name: string) {
  const result = await db
    .update(saloonsTable)
    .set({ name, updatedAt: new Date() })
    .where(eq(saloonsTable.id, id))
    .returning();
  return result[0];
}
