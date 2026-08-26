import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { saloonsTable } from "./saloons";

export const saloonInvitationsTable = pgTable("saloon_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  saloonId: uuid("saloon_id")
    .references(() => saloonsTable.id, { onDelete: "cascade" }),
  saloonName: text("saloon_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SaloonInvitation = typeof saloonInvitationsTable.$inferSelect;
export type SaloonInvitationInsert = typeof saloonInvitationsTable.$inferInsert;
