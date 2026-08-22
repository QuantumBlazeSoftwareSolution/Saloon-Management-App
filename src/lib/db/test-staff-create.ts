// @ts-nocheck
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createProfileAction } from '../actions/profiles';

async function main() {
  console.log('Testing createProfileAction with exact values...');
  const res = await createProfileAction({
    saloonId: 'a25c0a18-1f32-4f45-9a7a-0f2ccc3b7a4c', // use valid saloon id from seed
    role: 'barber',
    fullName: 'Vihanga Heshan',
    phone: '0788056838',
    commissionPct: 50,
    pin: '1234',
    active: true,
  });
  console.log('Result:', res);
}

main();
