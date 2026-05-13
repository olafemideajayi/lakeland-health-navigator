import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed clinics
  const coldLake = await prisma.clinic.upsert({
    where: { slug: 'cold-lake-health-centre' },
    update: {},
    create: {
      name: 'Cold Lake Health Centre',
      slug: 'cold-lake-health-centre',
      address: '314 25th St',
      city: 'Cold Lake',
      lat: 54.4642,
      lng: -110.1785,
      phone: '(780) 594-3200',
      hours: {
        mon: { open: '08:00', close: '21:00' },
        tue: { open: '08:00', close: '21:00' },
        wed: { open: '08:00', close: '21:00' },
        thu: { open: '08:00', close: '21:00' },
        fri: { open: '08:00', close: '21:00' },
        sat: { open: '09:00', close: '17:00' },
        sun: { open: '10:00', close: '16:00' },
      },
      services: ['walk-in', 'urgent-care', 'x-ray', 'lab-work'],
    },
  });

  const bonnyville = await prisma.clinic.upsert({
    where: { slug: 'bonnyville-health-centre' },
    update: {},
    create: {
      name: 'Bonnyville Health Centre',
      slug: 'bonnyville-health-centre',
      address: '5001 Lakeshore Dr',
      city: 'Bonnyville',
      lat: 54.2733,
      lng: -110.7441,
      phone: '(780) 826-3311',
      hours: {
        mon: { open: '08:00', close: '20:00' },
        tue: { open: '08:00', close: '20:00' },
        wed: { open: '08:00', close: '20:00' },
        thu: { open: '08:00', close: '20:00' },
        fri: { open: '08:00', close: '20:00' },
        sat: { open: '09:00', close: '16:00' },
        sun: { open: 'closed', close: 'closed' },
      },
      services: ['emergency', 'walk-in', 'lab-work'],
    },
  });

  const lacLaBiche = await prisma.clinic.upsert({
    where: { slug: 'lac-la-biche-community-health' },
    update: {},
    create: {
      name: 'Lac La Biche Community Health',
      slug: 'lac-la-biche-community-health',
      address: '9503 Beaverhill Rd',
      city: 'Lac La Biche',
      lat: 54.7722,
      lng: -111.9683,
      phone: '(780) 623-4471',
      hours: {
        mon: { open: '08:30', close: '19:00' },
        tue: { open: '08:30', close: '19:00' },
        wed: { open: '08:30', close: '19:00' },
        thu: { open: '08:30', close: '19:00' },
        fri: { open: '08:30', close: '17:00' },
        sat: { open: 'closed', close: 'closed' },
        sun: { open: 'closed', close: 'closed' },
      },
      services: ['walk-in', 'mental-health'],
    },
  });

  const stPaul = await prisma.clinic.upsert({
    where: { slug: 'st-paul-health-complex' },
    update: {},
    create: {
      name: 'St. Paul Health Complex',
      slug: 'st-paul-health-complex',
      address: '4713 48th Ave',
      city: 'St. Paul',
      lat: 53.9933,
      lng: -111.3017,
      phone: '(780) 645-3331',
      hours: {
        mon: { open: '00:00', close: '23:59' },
        tue: { open: '00:00', close: '23:59' },
        wed: { open: '00:00', close: '23:59' },
        thu: { open: '00:00', close: '23:59' },
        fri: { open: '00:00', close: '23:59' },
        sat: { open: '00:00', close: '23:59' },
        sun: { open: '00:00', close: '23:59' },
      },
      services: ['emergency', 'inpatient'],
    },
  });

  // Seed doctors (Edmonton-based specialists for telehealth)
  await prisma.doctor.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Dr. Amara Khalil',
        specialty: 'Cardiology',
        bio: 'Board-certified cardiologist with 12 years experience. University of Alberta Faculty of Medicine.',
        rating: 4.9,
        ratingCount: 312,
        clinicId: coldLake.id,
        onDuty: true,
        telehealth: true,
      },
      {
        name: 'Dr. James Morrison',
        specialty: 'Dermatology',
        bio: 'Specializes in skin conditions, moles, and cosmetic dermatology. 8 years rural telehealth experience.',
        rating: 4.8,
        ratingCount: 248,
        clinicId: coldLake.id,
        onDuty: true,
        telehealth: true,
      },
      {
        name: 'Dr. Sarah Patel',
        specialty: 'Orthopedics',
        bio: 'Sports medicine and joint specialist. Works with rural patients on post-surgical rehabilitation plans.',
        rating: 4.7,
        ratingCount: 189,
        clinicId: bonnyville.id,
        onDuty: true,
        telehealth: true,
      },
      {
        name: 'Dr. Lisa Wong',
        specialty: 'Psychiatry',
        bio: 'Adult psychiatry with focus on anxiety, depression, and PTSD. Extensive telehealth experience.',
        rating: 4.9,
        ratingCount: 421,
        clinicId: lacLaBiche.id,
        onDuty: false,
        telehealth: true,
      },
      {
        name: 'Dr. Raj Nayar',
        specialty: 'Endocrinology',
        bio: 'Diabetes and thyroid specialist. Passionate about improving chronic disease management in rural communities.',
        rating: 4.6,
        ratingCount: 156,
        clinicId: stPaul.id,
        onDuty: false,
        telehealth: true,
      },
    ],
  });

  // Seed initial wait times
  await prisma.waitTime.createMany({
    data: [
      { clinicId: coldLake.id, minutes: 15, patientsWaiting: 3, capacity: 12, updatedBy: 'seed' },
      { clinicId: bonnyville.id, minutes: 35, patientsWaiting: 7, capacity: 12, updatedBy: 'seed' },
      { clinicId: lacLaBiche.id, minutes: 75, patientsWaiting: 9, capacity: 12, updatedBy: 'seed' },
      { clinicId: stPaul.id, minutes: 120, patientsWaiting: 11, capacity: 12, updatedBy: 'seed' },
    ],
  });

  // Seed staff accounts — one per clinic with hashed passwords
  const staffPassword = await bcrypt.hash('Lakeland2026!', 10);

  await prisma.user.upsert({
    where: { email: 'staff@coldlake.health' },
    update: { passwordHash: staffPassword, name: 'Cold Lake Admin' },
    create: {
      name: 'Cold Lake Admin',
      email: 'staff@coldlake.health',
      passwordHash: staffPassword,
      role: Role.STAFF,
      clinicId: coldLake.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@bonnyville.health' },
    update: { passwordHash: staffPassword },
    create: {
      name: 'Bonnyville Admin',
      email: 'staff@bonnyville.health',
      passwordHash: staffPassword,
      role: Role.STAFF,
      clinicId: bonnyville.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@laclabiche.health' },
    update: { passwordHash: staffPassword },
    create: {
      name: 'Lac La Biche Admin',
      email: 'staff@laclabiche.health',
      passwordHash: staffPassword,
      role: Role.STAFF,
      clinicId: lacLaBiche.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@stpaul.health' },
    update: { passwordHash: staffPassword },
    create: {
      name: 'St. Paul Admin',
      email: 'staff@stpaul.health',
      passwordHash: staffPassword,
      role: Role.STAFF,
      clinicId: stPaul.id,
    },
  });

  // Seed an admin user
  const adminPassword = await bcrypt.hash('Admin2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lakelandhealth.ca' },
    update: { passwordHash: adminPassword },
    create: {
      name: 'System Admin',
      email: 'admin@lakelandhealth.ca',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      clinicId: coldLake.id,
    },
  });

  console.log('Database seeded successfully');
  console.log('');
  console.log('Staff accounts created:');
  console.log('  staff@coldlake.health     / Lakeland2026!');
  console.log('  staff@bonnyville.health   / Lakeland2026!');
  console.log('  staff@laclabiche.health   / Lakeland2026!');
  console.log('  staff@stpaul.health       / Lakeland2026!');
  console.log('  admin@lakelandhealth.ca   / Admin2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
