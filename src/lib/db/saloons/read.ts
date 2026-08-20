import { db } from '../index';
import { saloonsTable } from '../schema/saloons';
import { eq } from 'drizzle-orm';

export async function getSaloonById(id: string) {
  const result = await db
    .select()
    .from(saloonsTable)
    .where(eq(saloonsTable.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getSaloonByOwnerId(ownerId: string) {
  const result = await db
    .select()
    .from(saloonsTable)
    .where(eq(saloonsTable.ownerId, ownerId))
    .limit(1);
  return result[0] || null;
}
