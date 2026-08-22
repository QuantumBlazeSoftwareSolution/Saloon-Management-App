// @ts-nocheck
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { db } from './index';
import { profilesTable } from './schema/profiles';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Diagnosing database profiles and saloons...');
  const owners = await db.select().from(profilesTable).where(eq(profilesTable.role, 'owner'));
  console.log('Owners in DB:', owners);

  for (const owner of owners) {
    const profiles = await db.select().from(profilesTable).where(eq(profilesTable.saloonId, owner.saloonId));
    console.log(`Profiles under Saloon ID ${owner.saloonId} (Owner: ${owner.fullName}):`, profiles);
  }
}

main();
