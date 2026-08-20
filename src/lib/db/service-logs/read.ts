import { db } from '../index';
import { serviceLogsTable } from '../schema/service-logs';
import { eq, and, gte } from 'drizzle-orm';

export async function getServiceLogsBySaloonId(saloonId: string) {
  return await db
    .select()
    .from(serviceLogsTable)
    .where(eq(serviceLogsTable.saloonId, saloonId));
}

export async function getTodayServiceLogs(saloonId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await db
    .select()
    .from(serviceLogsTable)
    .where(
      and(
        eq(serviceLogsTable.saloonId, saloonId),
        gte(serviceLogsTable.createdAt, today)
      )
    );
}

export async function getBarberLogs(barberId: string) {
  return await db
    .select()
    .from(serviceLogsTable)
    .where(eq(serviceLogsTable.barberId, barberId));
}
