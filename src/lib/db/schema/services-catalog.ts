import { pgTable, text, timestamp, uuid, real, boolean, index } from 'drizzle-orm/pg-core';
import { saloonsTable } from './saloons';

export const servicesCatalogTable = pgTable('services_catalog', {
  id: uuid('id').defaultRandom().primaryKey(),
  saloonId: uuid('saloon_id')
    .references(() => saloonsTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  basePrice: real('base_price').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => ({
  saloonIdx: index('services_catalog_saloon_id_idx').on(table.saloonId),
}));

export type ServiceCatalog = typeof servicesCatalogTable.$inferSelect;
export type ServiceCatalogInsert = typeof servicesCatalogTable.$inferInsert;
