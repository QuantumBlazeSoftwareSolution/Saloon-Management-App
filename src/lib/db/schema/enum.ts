import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnumItem = ["owner", "barber"] as const;
export const roleEnum = pgEnum("role_enum", roleEnumItem);

export const appointmentStatusEnumItem = ["upcoming", "completed", "cancelled", "no_show"] as const;
export const appointmentStatusEnum = pgEnum("appointment_status_enum", appointmentStatusEnumItem);