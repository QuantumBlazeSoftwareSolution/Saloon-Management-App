import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnumItem = ["owner", "barber"] as const;
export const roleEnum = pgEnum("role_enum", roleEnumItem);