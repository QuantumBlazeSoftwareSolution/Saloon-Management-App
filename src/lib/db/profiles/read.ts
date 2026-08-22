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

export async function getProfiles() {
  return await db
    .select()
    .from(profilesTable);
}

export async function authenticateProfile(role: 'barber' | 'owner', identifier: string, pin?: string) {
  if (role === 'owner') {
    
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
    
    const conditions = [
      eq(profilesTable.role, 'barber'),
      eq(profilesTable.phone, identifier)
    ];
    if (pin) {
      conditions.push(eq(profilesTable.pin, pin));
    }
    
    const result = await db
      .select()
      .from(profilesTable)
      .where(and(...conditions))
      .limit(1);
    return result[0] || null;
  }
}
