import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnumItem = ["owner", "barber", "admin"] as const;
export const roleEnum = pgEnum("role_enum", roleEnumItem);

export const appointmentStatusEnumItem = ["upcoming", "completed", "cancelled", "no_show"] as const;
export const appointmentStatusEnum = pgEnum("appointment_status_enum", appointmentStatusEnumItem);

export const saloonStatusEnumItem = ["pending", "rejected", "active", "inactive"] as const;
export const saloonStatusEnum = pgEnum("saloon_status_enum", saloonStatusEnumItem);

export const reviewStatusEnumItem = ["pending", "approved", "rejected"] as const;
export const reviewStatusEnum = pgEnum("review_status_enum", reviewStatusEnumItem);