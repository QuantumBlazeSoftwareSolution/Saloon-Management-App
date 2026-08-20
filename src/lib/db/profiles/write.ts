import { db } from '../index';
import { profilesTable, ProfileInsert } from '../schema/profiles';
import { eq } from 'drizzle-orm';

export async function createProfile(data: ProfileInsert) {
  const result = await db
    .insert(profilesTable)
    .values(data)
    .returning();
  return result[0];
}

export async function updateProfile(id: string, data: Partial<ProfileInsert>) {
  const result = await db
    .update(profilesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profilesTable.id, id))
    .returning();
  return result[0];
}
