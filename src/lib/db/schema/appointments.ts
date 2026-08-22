import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles';
import { servicesCatalogTable } from './services-catalog';

export const appointmentsTable = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  barberId: uuid('barber_id')
    .references(() => profilesTable.id, { onDelete: 'cascade' })
    .notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  serviceId: uuid('service_id')
    .references(() => servicesCatalogTable.id, { onDelete: 'cascade' })
    .notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: text('status').default('upcoming').notNull(), 
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Appointment = typeof appointmentsTable.$inferSelect;
export type AppointmentInsert = typeof appointmentsTable.$inferInsert;
