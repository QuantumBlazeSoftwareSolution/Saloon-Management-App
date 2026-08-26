'use server';

import { db } from '../db';
import { saloonsTable } from '../db/schema/saloons';
import { saloonInvitationsTable } from '../db/schema/saloon-invitations';
import { saloonRequestsTable } from '../db/schema/saloon-requests';
import { profilesTable } from '../db/schema/profiles';
import { usersTable } from '../db/schema/users';
import { sendSaloonSetupEmail, sendRequestConfirmationEmail, sendAdminNotificationEmail } from '../email';
import { adminEmails } from '../data';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function getAllSaloons() {
  console.log(`[getAllSaloons] Fetching all saloons and their owners`);
  try {
    const saloons = await db
      .select({
        id: saloonsTable.id,
        name: saloonsTable.name,
        createdAt: saloonsTable.createdAt,
      })
      .from(saloonsTable);

    const owners = await db
      .select({
        id: profilesTable.id,
        saloonId: profilesTable.saloonId,
        fullName: profilesTable.fullName,
        email: profilesTable.email,
        phone: profilesTable.phone,
      })
      .from(profilesTable)
      .where(eq(profilesTable.role, 'owner'));

    const data = saloons.map((s) => ({
      ...s,
      owners: owners.filter((o) => o.saloonId === s.id),
    }));

    console.log(`[getAllSaloons] Success: fetched ${data.length} saloons`);
    return { success: true, data };
  } catch (error: any) {
    console.error(`[getAllSaloons] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch saloons. Please try again.' };
  }
}

export async function createSaloonAndOwner(
  saloonName: string,
  ownerName: string,
  ownerPhone: string,
  ownerEmail: string,
  saloonId?: string
) {
  console.log(`[createSaloonAndOwner] Creating invitation for saloon: ${saloonName}, owner: ${ownerName}, saloonId: ${saloonId}`);
  try {
    const cleanEmail = ownerEmail.trim().toLowerCase();
    const cleanPhone = ownerPhone.trim();

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, cleanPhone))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'Phone number already registered.' };
    }

    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return { success: false, error: 'Email address already registered.' };
    }

    const [invitation] = await db
      .insert(saloonInvitationsTable)
      .values({
        saloonId: saloonId || null,
        saloonName,
        ownerEmail: cleanEmail,
        ownerPhone: cleanPhone,
        status: 'pending',
      })
      .returning();

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const setupLink = `${origin}/auth/invitation/${invitation.id}`;

    await sendSaloonSetupEmail(cleanEmail, saloonName, setupLink);

    console.log(`[createSaloonAndOwner] Success: created invitation ${invitation.id} for owner ${cleanEmail}`);
    return { success: true, data: { invitation } };
  } catch (error: any) {
    console.error(`[createSaloonAndOwner] Error: ${error.message}`);
    return { success: false, error: 'Failed to create saloon invitation. Please try again.' };
  }
}

export async function requestSaloonSetup(
  saloonName: string,
  ownerEmail: string,
  ownerPhone: string
) {
  console.log(`[requestSaloonSetup] Saloon name: ${saloonName}, Owner email: ${ownerEmail}`);
  try {
    const [request] = await db
      .insert(saloonRequestsTable)
      .values({
        saloonName: saloonName.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerPhone: ownerPhone.trim(),
        status: 'pending',
      })
      .returning();

    const targetEmail = ownerEmail.trim().toLowerCase();
    await sendRequestConfirmationEmail(targetEmail, saloonName.trim());

    // Send notification emails to all admin emails
    if (adminEmails && adminEmails.length > 0) {
      await Promise.all(
        adminEmails.map((adminEmail) =>
          sendAdminNotificationEmail(
            adminEmail,
            saloonName.trim(),
            targetEmail,
            ownerPhone.trim()
          )
        )
      );
    }

    console.log(`[requestSaloonSetup] Success: created pending saloon request ${request.id}`);
    return { success: true, data: request };
  } catch (error: any) {
    console.error(`[requestSaloonSetup] Error: ${error.message}`);
    return { success: false, error: 'Failed to register saloon request. Please try again.' };
  }
}

export async function getSaloonRequestsAction() {
  console.log(`[getSaloonRequestsAction] Fetching all saloon requests`);
  try {
    const requests = await db
      .select()
      .from(saloonRequestsTable)
      .orderBy(saloonRequestsTable.createdAt);
    return { success: true, data: requests };
  } catch (error: any) {
    console.error(`[getSaloonRequestsAction] Error: ${error.message}`);
    return { success: false, error: 'Failed to fetch setup requests.' };
  }
}

export async function approveSaloonRequestAction(requestId: string) {
  console.log(`[approveSaloonRequestAction] Approving request: ${requestId}`);
  try {
    const [request] = await db
      .select()
      .from(saloonRequestsTable)
      .where(eq(saloonRequestsTable.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request not found.' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Request is already processed.' };
    }

    // Trigger direct invitation generation logic
    const res = await createSaloonAndOwner(
      request.saloonName,
      'Owner User', // placeholder owner name to start setup
      request.ownerPhone,
      request.ownerEmail
    );

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to dispatch setup invitation.' };
    }

    // Update status to approved
    await db
      .update(saloonRequestsTable)
      .set({ status: 'approved' })
      .where(eq(saloonRequestsTable.id, requestId));

    return { success: true };
  } catch (error: any) {
    console.error(`[approveSaloonRequestAction] Error: ${error.message}`);
    return { success: false, error: 'Failed to approve saloon request.' };
  }
}

export async function rejectSaloonRequestAction(requestId: string) {
  console.log(`[rejectSaloonRequestAction] Rejecting request: ${requestId}`);
  try {
    await db
      .update(saloonRequestsTable)
      .set({ status: 'rejected' })
      .where(eq(saloonRequestsTable.id, requestId));
    return { success: true };
  } catch (error: any) {
    console.error(`[rejectSaloonRequestAction] Error: ${error.message}`);
    return { success: false, error: 'Failed to reject saloon request.' };
  }
}
