import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles';
import { appointmentStatusEnum } from './enum';
import { saloonsTable } from './saloons';

export const appointmentsTable = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  saloonId: uuid('saloon_id')
    .references(() => saloonsTable.id, { onDelete: 'cascade' })
    .notNull(),
  barberId: uuid('barber_id')
    .references(() => profilesTable.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  serviceIds: jsonb('service_ids').notNull().$type<string[]>(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: appointmentStatusEnum('status').default('upcoming').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  saloonIdx: index('appointments_saloon_id_idx').on(table.saloonId),
}));

export type Appointment = typeof appointmentsTable.$inferSelect;
export type AppointmentInsert = typeof appointmentsTable.$inferInsert;
