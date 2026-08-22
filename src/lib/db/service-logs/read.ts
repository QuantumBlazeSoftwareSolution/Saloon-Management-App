import { db } from '../index';
import { serviceLogsTable } from '../schema/service-logs';
import { servicesCatalogTable } from '../schema/services-catalog';
import { profilesTable } from '../schema/profiles';
import { eq, and, gte } from 'drizzle-orm';

export async function getServiceLogsBySaloonId(saloonId: string) {
  return await db
    .select({
      id: serviceLogsTable.id,
      saloonId: serviceLogsTable.saloonId,
      barberId: serviceLogsTable.barberId,
      serviceId: serviceLogsTable.serviceId,
      priceAtTime: serviceLogsTable.priceAtTime,
      discountPct: serviceLogsTable.discountPct,
      commissionPct: serviceLogsTable.commissionPct,
      commissionAmount: serviceLogsTable.commissionAmount,
      netAmount: serviceLogsTable.netAmount,
      createdAt: serviceLogsTable.createdAt,
      updatedAt: serviceLogsTable.updatedAt,
      serviceName: servicesCatalogTable.name,
      barberName: profilesTable.fullName,
    })
    .from(serviceLogsTable)
    .leftJoin(servicesCatalogTable, eq(serviceLogsTable.serviceId, servicesCatalogTable.id))
    .leftJoin(profilesTable, eq(serviceLogsTable.barberId, profilesTable.id))
    .where(eq(serviceLogsTable.saloonId, saloonId));
}

export async function getTodayServiceLogs(saloonId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await db
    .select({
      id: serviceLogsTable.id,
      saloonId: serviceLogsTable.saloonId,
      barberId: serviceLogsTable.barberId,
      serviceId: serviceLogsTable.serviceId,
      priceAtTime: serviceLogsTable.priceAtTime,
      discountPct: serviceLogsTable.discountPct,
      commissionPct: serviceLogsTable.commissionPct,
      commissionAmount: serviceLogsTable.commissionAmount,
      netAmount: serviceLogsTable.netAmount,
      createdAt: serviceLogsTable.createdAt,
      updatedAt: serviceLogsTable.updatedAt,
      serviceName: servicesCatalogTable.name,
      barberName: profilesTable.fullName,
    })
    .from(serviceLogsTable)
    .leftJoin(servicesCatalogTable, eq(serviceLogsTable.serviceId, servicesCatalogTable.id))
    .leftJoin(profilesTable, eq(serviceLogsTable.barberId, profilesTable.id))
    .where(
      and(
        eq(serviceLogsTable.saloonId, saloonId),
        gte(serviceLogsTable.createdAt, today)
      )
    );
}

export async function getBarberLogs(barberId: string) {
  return await db
    .select({
      id: serviceLogsTable.id,
      saloonId: serviceLogsTable.saloonId,
      barberId: serviceLogsTable.barberId,
      serviceId: serviceLogsTable.serviceId,
      priceAtTime: serviceLogsTable.priceAtTime,
      discountPct: serviceLogsTable.discountPct,
      commissionPct: serviceLogsTable.commissionPct,
      commissionAmount: serviceLogsTable.commissionAmount,
      netAmount: serviceLogsTable.netAmount,
      createdAt: serviceLogsTable.createdAt,
      updatedAt: serviceLogsTable.updatedAt,
      serviceName: servicesCatalogTable.name,
      barberName: profilesTable.fullName,
    })
    .from(serviceLogsTable)
    .leftJoin(servicesCatalogTable, eq(serviceLogsTable.serviceId, servicesCatalogTable.id))
    .leftJoin(profilesTable, eq(serviceLogsTable.barberId, profilesTable.id))
    .where(eq(serviceLogsTable.barberId, barberId));
}
