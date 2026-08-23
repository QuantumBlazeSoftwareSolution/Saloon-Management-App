'use server';

import { db } from '../db';
import { appointmentsTable, AppointmentInsert } from '../db/schema/appointments';
import { profilesTable } from '../db/schema/profiles';
import { revalidatePath } from 'next/cache';
import { eq, asc, and } from 'drizzle-orm';

export async function createAppointment(data: AppointmentInsert) {
  console.log(`[createAppointment] Booking for: ${data.customerName}, barber: ${data.barberId}, saloon: ${data.saloonId}, services: ${JSON.stringify(data.serviceIds)}`);
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
    return { success: false, error: 'Failed to book appointment. Please try again.' };
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

    console.log(`[updateAppointment] Success: updated appointment ${appointment.id} status=${appointment.status}`);
    revalidatePath('/barber/history');
    revalidatePath('/owner');
    return { success: true, data: appointment };
  } catch (error: any) {
    console.error(`[updateAppointment] Error: ${error.message}`);
    return { success: false, error: 'Failed to update appointment. Please try again.' };
  }
}

export async function getAllAppointments(saloonId?: string) {
  console.log(`[getAllAppointments] Fetching all appointments for saloon: ${saloonId}`);
  try {
    if (!saloonId) return { success: true, data: [] };
    const result = await db
      .select({
        id: appointmentsTable.id,
        barberId: appointmentsTable.barberId,
        customerName: appointmentsTable.customerName,
        customerPhone: appointmentsTable.customerPhone,
        serviceIds: appointmentsTable.serviceIds,
        scheduledAt: appointmentsTable.scheduledAt,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
        barberName: profilesTable.fullName,
      })
      .from(appointmentsTable)
      .leftJoin(profilesTable, eq(appointmentsTable.barberId, profilesTable.id))
      .where(eq(appointmentsTable.saloonId, saloonId))
      .orderBy(asc(appointmentsTable.scheduledAt));

    console.log(`[getAllAppointments] Success: fetched ${result.length} appointments`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[getAllAppointments] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch appointments. Please try again.' };
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
        serviceIds: appointmentsTable.serviceIds,
        scheduledAt: appointmentsTable.scheduledAt,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
        barberName: profilesTable.fullName,
      })
      .from(appointmentsTable)
      .leftJoin(profilesTable, eq(appointmentsTable.barberId, profilesTable.id))
      .where(eq(appointmentsTable.barberId, barberId))
      .orderBy(asc(appointmentsTable.scheduledAt));

    console.log(`[getBarberAppointments] Success: fetched ${result.length} appointments`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[getBarberAppointments] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch barber appointments. Please try again.' };
  }
}
