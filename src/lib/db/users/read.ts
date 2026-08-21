import { db } from '../index';
import { usersTable } from '../schema/users';
import { eq, or } from 'drizzle-orm';

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return result[0] || null;
}

export async function getUserByPhone(phone: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);
  return result[0] || null;
}

export async function authenticateUser(identifier: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.email, identifier),
        eq(usersTable.phone, identifier)
      )
    )
    .limit(1);
  return result[0] || null;
}
