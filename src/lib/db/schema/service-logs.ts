import { pgTable, timestamp, uuid, real } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles';
import { servicesCatalogTable } from './services-catalog';

export const serviceLogsTable = pgTable('service_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  barberId: uuid('barber_id')
    .references(() => profilesTable.id, { onDelete: 'cascade' })
    .notNull(),
  serviceId: uuid('service_id')
    .references(() => servicesCatalogTable.id, { onDelete: 'cascade' })
    .notNull(),
  priceAtTime: real('price_at_time').notNull(),
  discountPct: real('discount_pct').default(0).notNull(),
  commissionPct: real('commission_pct').notNull(),
  commissionAmount: real('commission_amount').notNull(),
  netAmount: real('net_amount').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ServiceLog = typeof serviceLogsTable.$inferSelect;
export type ServiceLogInsert = typeof serviceLogsTable.$inferInsert;
