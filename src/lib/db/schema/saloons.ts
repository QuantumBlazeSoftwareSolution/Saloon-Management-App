import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const saloonsTable = pgTable('saloons', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Saloon = typeof saloonsTable.$inferSelect;
export type SaloonInsert = typeof saloonsTable.$inferInsert;
