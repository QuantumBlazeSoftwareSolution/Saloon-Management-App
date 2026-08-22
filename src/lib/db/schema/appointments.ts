import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { profilesTable } from './profiles';
import { appointmentStatusEnum } from './enum';

export const appointmentsTable = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  barberId: uuid('barber_id')
    .references(() => profilesTable.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  serviceIds: jsonb('service_ids').notNull().$type<string[]>(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: appointmentStatusEnum('status').default('upcoming').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Appointment = typeof appointmentsTable.$inferSelect;
export type AppointmentInsert = typeof appointmentsTable.$inferInsert;
