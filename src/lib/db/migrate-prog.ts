
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { db } from './index';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  console.log('Running migrations programmatically...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied successfully!');
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  }
}

main();
