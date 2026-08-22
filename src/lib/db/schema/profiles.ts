import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { saloonsTable } from './saloons';

export const profilesTable = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  saloonId: uuid('saloon_id')
    .references(() => saloonsTable.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), 
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  commissionPct: integer('commission_pct').default(50).notNull(),
  pin: text('pin'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profilesTable.$inferSelect;
export type ProfileInsert = typeof profilesTable.$inferInsert;
