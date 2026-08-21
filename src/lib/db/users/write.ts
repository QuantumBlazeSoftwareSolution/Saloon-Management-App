import { db } from '../index';
import { usersTable, UserDbInsert } from '../schema/users';
import { eq } from 'drizzle-orm';

export async function createUser(data: UserDbInsert) {
  const result = await db
    .insert(usersTable)
    .values(data)
    .returning();
  return result[0];
}

export async function updateUserPassword(id: string, passwordHash: string) {
  const result = await db
    .update(usersTable)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return result[0];
}
