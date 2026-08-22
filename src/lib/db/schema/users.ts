import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";
import { roleEnum } from "./enum";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  profileId: uuid("profile_id")
    .references(() => profilesTable.id, { onDelete: "cascade" })
    .notNull(),
  otp: text("otp"),
  otpExpires: timestamp("otp_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserDb = typeof usersTable.$inferSelect;
export type UserDbInsert = typeof usersTable.$inferInsert;
