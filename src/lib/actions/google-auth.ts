'use server';

import { db } from '../db';
import { saloonInvitationsTable } from '../db/schema/saloon-invitations';
import { saloonsTable } from '../db/schema/saloons';
import { profilesTable } from '../db/schema/profiles';
import { usersTable } from '../db/schema/users';
import { eq, and } from 'drizzle-orm';

async function verifyFirebaseIdToken(idToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase API Key is missing in environment variables.');
  }

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Failed to verify ID token.');
  }

  const user = data.users?.[0];
  if (!user) {
    throw new Error('No user found for this token.');
  }

  return {
    uid: user.localId,
    email: user.email,
    name: user.displayName || 'Owner User',
  };
}

export async function getInvitationDetailsAction(invitationId: string) {
  console.log(`[getInvitationDetailsAction] Fetching invitation: ${invitationId}`);
  try {
    const [invitation] = await db
      .select()
      .from(saloonInvitationsTable)
      .where(eq(saloonInvitationsTable.id, invitationId))
      .limit(1);

    if (!invitation) {
      return { success: false, error: 'Invitation not found.' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: `This invitation has already been ${invitation.status}.` };
    }

    return { success: true, data: invitation };
  } catch (error: any) {
    console.error(`[getInvitationDetailsAction] Error: ${error.message}`);
    return { success: false, error: 'Failed to retrieve invitation details.' };
  }
}

export async function linkGoogleAccountAction(idToken: string, invitationId: string) {
  console.log(`[linkGoogleAccountAction] Linking invitation: ${invitationId}`);
  try {
    const googleProfile = await verifyFirebaseIdToken(idToken);
    if (!googleProfile || !googleProfile.email) {
      return { success: false, error: 'Failed to authenticate with Google.' };
    }

    const [invitation] = await db
      .select()
      .from(saloonInvitationsTable)
      .where(eq(saloonInvitationsTable.id, invitationId))
      .limit(1);

    if (!invitation) {
      return { success: false, error: 'Invitation not found.' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: 'Invitation is no longer active.' };
    }

    if (googleProfile.email.trim().toLowerCase() !== invitation.ownerEmail.trim().toLowerCase()) {
      return { 
        success: false, 
        error: `Authentication failed: You must sign in using the Google account registered to this invitation (${invitation.ownerEmail}).` 
      };
    }

    const cleanEmail = invitation.ownerEmail.trim().toLowerCase();
    const cleanPhone = invitation.ownerPhone.trim();

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'Email or phone already registered.' };
    }

    let activeSaloonId = invitation.saloonId;

    if (!activeSaloonId) {
      // 1. Create Saloon
      const [saloon] = await db
        .insert(saloonsTable)
        .values({
          name: invitation.saloonName,
          ownerEmail: cleanEmail,
          ownerPhone: cleanPhone,
          status: 'active',
        })
        .returning();
      activeSaloonId = saloon.id;
    }

    // 2. Create Profile
    const [profile] = await db
      .insert(profilesTable)
      .values({
        saloonId: activeSaloonId,
        role: 'owner',
        fullName: googleProfile.name,
        phone: cleanPhone,
        email: cleanEmail,
        commissionPct: 100,
        active: true,
      })
      .returning();

    // 3. Create User account linked to Google ID
    await db
      .insert(usersTable)
      .values({
        phone: cleanPhone,
        email: cleanEmail,
        googleId: googleProfile.uid,
        role: 'owner',
        profileId: profile.id,
      });

    // 4. Update Invitation status
    await db
      .update(saloonInvitationsTable)
      .set({ status: 'accepted' })
      .where(eq(saloonInvitationsTable.id, invitationId));

    console.log(`[linkGoogleAccountAction] Success: provisioned saloon ${activeSaloonId} for owner ${profile.id}`);
    return { success: true, profile };
  } catch (error: any) {
    console.error(`[linkGoogleAccountAction] Error: ${error.message}`);
    return { success: false, error: 'Registration setup with Google failed.' };
  }
}

export async function loginWithGoogleAction(idToken: string) {
  console.log(`[loginWithGoogleAction] Attempting authentication`);
  try {
    const googleProfile = await verifyFirebaseIdToken(idToken);
    if (!googleProfile || !googleProfile.email) {
      return { success: false, error: 'Failed to verify Google identity.' };
    }

    // Search by googleId or email
    let user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, googleProfile.uid))
      .limit(1)
      .then(rows => rows[0]);

    if (!user) {
      user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, googleProfile.email.toLowerCase()))
        .limit(1)
        .then(rows => rows[0]);

      if (user) {
        // Auto-link Google ID if emails match
        await db
          .update(usersTable)
          .set({ googleId: googleProfile.uid })
          .where(eq(usersTable.id, user.id));
      }
    }

    if (!user) {
      return { success: false, error: 'No saloon account associated with this Google profile.' };
    }

    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, user.profileId))
      .limit(1);

    if (!profile || !profile.active) {
      return { success: false, error: 'Saloon profile is currently inactive.' };
    }

    return { success: true, profile };
  } catch (error: any) {
    console.error(`[loginWithGoogleAction] Error: ${error.message}`);
    return { success: false, error: 'Google Login failed. Please try again.' };
  }
}
