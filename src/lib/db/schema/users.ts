import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
  phone: text('phone').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'owner' | 'barber'
  profileId: uuid('profile_id')
    .references(() => profilesTable.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserDb = typeof usersTable.$inferSelect;
export type UserDbInsert = typeof usersTable.$inferInsert;
