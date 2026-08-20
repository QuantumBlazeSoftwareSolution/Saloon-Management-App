import { db } from '../index';
import { profilesTable } from '../schema/profiles';
import { eq, and } from 'drizzle-orm';

export async function getProfileById(id: string) {
  const result = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getProfilesBySaloonId(saloonId: string) {
  return await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.saloonId, saloonId));
}

export async function authenticateProfile(role: 'barber' | 'owner', identifier: string) {
  if (role === 'owner') {
    // Owner signs in via email or phone
    const result = await db
      .select()
      .from(profilesTable)
      .where(
        and(
          eq(profilesTable.role, 'owner'),
          eq(profilesTable.email, identifier)
        )
      )
      .limit(1);
    return result[0] || null;
  } else {
    // Barber signs in via phone
    const result = await db
      .select()
      .from(profilesTable)
      .where(
        and(
          eq(profilesTable.role, 'barber'),
          eq(profilesTable.phone, identifier)
        )
      )
      .limit(1);
    return result[0] || null;
  }
}
