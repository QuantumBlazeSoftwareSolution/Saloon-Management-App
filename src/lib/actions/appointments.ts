'use server';

import { db } from '../db';
import { appointmentsTable, AppointmentInsert } from '../db/schema/appointments';
import { profilesTable } from '../db/schema/profiles';
import { servicesCatalogTable } from '../db/schema/services-catalog';
import { revalidatePath } from 'next/cache';
import { eq, and, asc } from 'drizzle-orm';

export async function createAppointment(data: AppointmentInsert) {
  console.log(`[createAppointment] Booking appointment for: ${data.customerName} with barber: ${data.barberId}`);
  try {
    const [appointment] = await db
      .insert(appointmentsTable)
      .values(data)
      .returning();

    console.log(`[createAppointment] Success: booked appointment ${appointment.id}`);
    revalidatePath('/barber/history');
    revalidatePath('/owner');
    return { success: true, data: appointment };
  } catch (error: any) {
    console.error(`[createAppointment] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to create appointment.' };
  }
}

export async function updateAppointment(id: string, data: Partial<AppointmentInsert>) {
  console.log(`[updateAppointment] Updating appointment: ${id}`);
  try {
    const [appointment] = await db
      .update(appointmentsTable)
      .set(data)
      .where(eq(appointmentsTable.id, id))
      .returning();

    console.log(`[updateAppointment] Success: updated appointment status to ${appointment.status}`);
    revalidatePath('/barber/history');
    revalidatePath('/owner');
    return { success: true, data: appointment };
  } catch (error: any) {
    console.error(`[updateAppointment] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to update appointment.' };
  }
}

export async function getAllAppointments() {
  console.log(`[getAllAppointments] Fetching all appointments`);
  try {
    const result = await db
      .select({
        id: appointmentsTable.id,
        barberId: appointmentsTable.barberId,
        customerName: appointmentsTable.customerName,
        customerPhone: appointmentsTable.customerPhone,
        serviceId: appointmentsTable.serviceId,
        scheduledAt: appointmentsTable.scheduledAt,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
        barberName: profilesTable.fullName,
        serviceName: servicesCatalogTable.name,
        servicePrice: servicesCatalogTable.basePrice,
      })
      .from(appointmentsTable)
      .leftJoin(profilesTable, eq(appointmentsTable.barberId, profilesTable.id))
      .leftJoin(servicesCatalogTable, eq(appointmentsTable.serviceId, servicesCatalogTable.id))
      .orderBy(asc(appointmentsTable.scheduledAt));

    console.log(`[getAllAppointments] Success: fetched ${result.length} appointments`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[getAllAppointments] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch appointments.' };
  }
}

export async function getBarberAppointments(barberId: string) {
  console.log(`[getBarberAppointments] Fetching appointments for barber: ${barberId}`);
  try {
    const result = await db
      .select({
        id: appointmentsTable.id,
        barberId: appointmentsTable.barberId,
        customerName: appointmentsTable.customerName,
        customerPhone: appointmentsTable.customerPhone,
        serviceId: appointmentsTable.serviceId,
        scheduledAt: appointmentsTable.scheduledAt,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
        barberName: profilesTable.fullName,
        serviceName: servicesCatalogTable.name,
        servicePrice: servicesCatalogTable.basePrice,
      })
      .from(appointmentsTable)
      .leftJoin(profilesTable, eq(appointmentsTable.barberId, profilesTable.id))
      .leftJoin(servicesCatalogTable, eq(appointmentsTable.serviceId, servicesCatalogTable.id))
      .where(eq(appointmentsTable.barberId, barberId))
      .orderBy(asc(appointmentsTable.scheduledAt));

    console.log(`[getBarberAppointments] Success: fetched ${result.length} appointments`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[getBarberAppointments] Error: ${error.message}`);
    return { success: false, error: error.message || 'Failed to fetch barber appointments.' };
  }
}
