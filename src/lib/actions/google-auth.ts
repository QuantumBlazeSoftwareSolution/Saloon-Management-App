'use server';

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../db';
import { saloonInvitationsTable } from '../db/schema/saloon-invitations';
import { saloonsTable } from '../db/schema/saloons';
import { profilesTable } from '../db/schema/profiles';
import { usersTable } from '../db/schema/users';
import { eq, and } from 'drizzle-orm';

function initAdmin() {
  if (getApps().length === 0) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('[FirebaseAdmin] Initialized successfully');
    } catch (e: any) {
      console.error('[FirebaseAdmin] Initialization failed:', e.message);
    }
  }
}

async function verifyFirebaseIdToken(idToken: string) {
  initAdmin();
  const decodedToken = await getAuth().verifyIdToken(idToken);
  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    name: decodedToken.name || 'Owner User',
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

    // 2. Create Profile
    const [profile] = await db
      .insert(profilesTable)
      .values({
        saloonId: saloon.id,
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

    console.log(`[linkGoogleAccountAction] Success: provisioned saloon ${saloon.id} for owner ${profile.id}`);
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
