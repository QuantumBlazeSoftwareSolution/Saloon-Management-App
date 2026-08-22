
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { db } from './index';
import { profilesTable } from './schema/profiles';
import { servicesCatalogTable } from './schema/services-catalog';
import { serviceLogsTable } from './schema/service-logs';
import { usersTable } from './schema/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Cleaning database...');
  await db.delete(usersTable);
  await db.delete(serviceLogsTable);
  await db.delete(servicesCatalogTable);
  await db.delete(profilesTable);

  console.log('Seeding database...');

  const [owner] = await db
    .insert(profilesTable)
    .values({
      role: 'owner',
      fullName: 'Vihanga Heshan',
      phone: '0771234567',
      email: 'vihangaheshan37@gmail.com',
      commissionPct: 0,
      active: true,
    })
    .returning();

  console.log(`Created owner profile: ${owner.fullName} (${owner.id})`);

  const ownerPasswordHash = await bcrypt.hash('Test@123', 10);
  const [ownerUser] = await db
    .insert(usersTable)
    .values({
      email: 'vihangaheshan37@gmail.com',
      phone: '0771234567',
      passwordHash: ownerPasswordHash,
      role: 'owner',
      profileId: owner.id,
    })
    .returning();
  console.log(`Created owner user credentials`);

  const barbersData = [
    { role: 'barber', fullName: 'Alex Carter', phone: '0777111222', commissionPct: 60, pin: '1234', active: true },
    { role: 'barber', fullName: 'Jordan Finch', phone: '0777333444', commissionPct: 50, pin: '5678', active: true },
    { role: 'barber', fullName: 'Sam Brooks', phone: '0777555666', commissionPct: 55, pin: '9999', active: true },
  ];

  const barbers = [];
  for (const b of barbersData) {
    const { pin, ...profileVals } = b;
    const [barber] = await db.insert(profilesTable).values(profileVals).returning();
    barbers.push(barber);
    
    const pinHash = await bcrypt.hash(pin, 10);
    await db.insert(usersTable).values({
      phone: barber.phone,
      passwordHash: pinHash,
      role: 'barber',
      profileId: barber.id,
    });
    
    console.log(`Created barber: ${barber.fullName} (${barber.id}) with PIN: ${pin}`);
  }

  const servicesData = [
    { name: 'Classic Haircut', basePrice: 1500, active: true },
    { name: 'Beard Trim & Detail', basePrice: 1000, active: true },
    { name: 'Signature Hair Color', basePrice: 4000, active: true },
    { name: 'Kids Cut', basePrice: 800, active: true },
    { name: 'Hot Towel Shave', basePrice: 1200, active: true },
  ];

  const services = [];
  for (const s of servicesData) {
    const [service] = await db.insert(servicesCatalogTable).values(s).returning();
    services.push(service);
    console.log(`Created service: ${service.name} (Rs. ${service.basePrice})`);
  }

  console.log('Generating service logs over past week...');
  const logsToInsert = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    const logCount = Math.floor(3 + Math.random() * 4);
    for (let j = 0; j < logCount; j++) {
      const barber = barbers[Math.floor(Math.random() * barbers.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const discountPct = Math.random() > 0.8 ? 10 : 0;
      
      const priceAtTime = service.basePrice;
      const discountAmount = (priceAtTime * discountPct) / 100;
      const netAmount = priceAtTime - discountAmount;
      const commissionAmount = (netAmount * barber.commissionPct) / 100;

      const logDate = new Date(date);
      logDate.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));

      logsToInsert.push({
        barberId: barber.id,
        serviceId: service.id,
        priceAtTime,
        discountPct,
        commissionPct: barber.commissionPct,
        commissionAmount,
        netAmount,
        createdAt: logDate,
      });
    }
  }

  await db.insert(serviceLogsTable).values(logsToInsert);
  console.log(`Successfully seeded ${logsToInsert.length} service logs!`);
  console.log('Database seeding complete.');
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
