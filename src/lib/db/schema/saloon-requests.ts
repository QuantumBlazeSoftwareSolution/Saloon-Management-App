import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { reviewStatusEnum } from './enum';

export const saloonRequestsTable = pgTable('saloon_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  saloonName: text('saloon_name').notNull(),
  ownerEmail: text('owner_email').notNull(),
  ownerPhone: text('owner_phone').notNull(),
  status: reviewStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SaloonRequest = typeof saloonRequestsTable.$inferSelect;
export type SaloonRequestInsert = typeof saloonRequestsTable.$inferInsert;
