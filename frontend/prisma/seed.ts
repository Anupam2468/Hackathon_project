import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { randomBytes, scryptSync } from 'crypto';

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.certificate.deleteMany();
    await prisma.donation.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.bloodRequest.deleteMany();
    await prisma.healthQuestionnaire.deleteMany();
    await prisma.bloodStock.deleteMany();
    await prisma.camp.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.donor.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.hospital.deleteMany();

    // ============================================
    // HOSPITALS
    // ============================================
    const hospital1 = await prisma.hospital.create({
        data: {
            id: 'h1',
            name: 'City Central Hospital',
            location: 'Downtown',
            latitude: 37.7749,
            longitude: -122.4194,
            verifiedBadge: true,
        }
    });

    const hospital2 = await prisma.hospital.create({
        data: {
            id: 'h2',
            name: 'Metro Health Care',
            location: 'Midtown',
            latitude: 37.785,
            longitude: -122.41,
            verifiedBadge: true,
        }
    });

    const hospital3 = await prisma.hospital.create({
        data: {
            id: 'h3',
            name: 'LifeLine Emergency Hospital',
            location: 'Eastside',
            latitude: 37.768,
            longitude: -122.425,
            verifiedBadge: true,
        }
    });

    console.log('  ✅ 3 Hospitals created');

    // ============================================
    // BLOOD STOCK
    // ============================================
    await prisma.bloodStock.createMany({
        data: [
            { hospitalId: 'h1', bloodGroup: 'A+', unitsAvailable: 45 },
            { hospitalId: 'h1', bloodGroup: 'O-', unitsAvailable: 3 },
            { hospitalId: 'h2', bloodGroup: 'B+', unitsAvailable: 15 },
            { hospitalId: 'h2', bloodGroup: 'O-', unitsAvailable: 8 },
            { hospitalId: 'h3', bloodGroup: 'AB+', unitsAvailable: 10 },
        ]
    });

    console.log('  ✅ 5 Blood stock records created');

    // ============================================
    // DONORS (passwords hashed!)
    // ============================================
    await prisma.donor.create({
        data: {
            id: 'd1',
            name: 'Rounak',
            email: 'rockytysan879@gmail.com',
            passwordHash: hashPassword('donor123'),
            bloodGroup: 'A+',
            age: 60,
            gender: 'Male',
            phone: '696969',
            whatsapp: '696969',
            address: 'xyz',
            latitude: 37.775,
            longitude: -122.419,
            verified: true,
            aiNotes: 'Records appear legitimate. Blood type matches historical data.',
        }
    });

    await prisma.donor.create({
        data: {
            id: 'd2',
            name: 'Alex Morgan',
            email: 'alex.morgan@example.com',
            passwordHash: hashPassword('donor123'),
            bloodGroup: 'O-',
            age: 28,
            gender: 'Female',
            phone: '1234567890',
            whatsapp: '1234567890',
            address: '123 Hope St',
            latitude: 37.774,
            longitude: -122.418,
            verified: true,
            aiNotes: 'Verified Universal O- Donor Record.',
        }
    });

    await prisma.donor.create({
        data: {
            id: 'd3',
            name: 'Rounak Prasad',
            email: 'prounak822@gmail.com',
            passwordHash: hashPassword('India8112005@$@$'),
            bloodGroup: 'A+',
            age: 21,
            gender: 'Male',
            phone: '9239459085',
            whatsapp: '9239459085',
            address: 'Rampurhat, Hattala para, Mahaprabhu Road',
            latitude: 37.8118,
            longitude: -122.4018,
            verified: true,
            aiNotes: 'Records appear legitimate. Blood type matches historical data.',
        }
    });

    console.log('  ✅ 3 Donors created (passwords hashed with scrypt)');

    // ============================================
    // DOCTORS
    // ============================================
    await prisma.doctor.create({
        data: {
            id: 'doc1',
            hospitalId: 'h1',
            name: 'Dr. Smith',
            verifiedBadge: true,
        }
    });

    console.log('  ✅ 1 Doctor created');

    // ============================================
    // SAMPLE BLOOD REQUESTS (for testing)
    // ============================================
    await prisma.patient.create({
        data: {
            id: 'p1',
            name: 'John Smith',
            contact: '555-0100',
        }
    });

    await prisma.bloodRequest.create({
        data: {
            hospitalId: 'h1',
            patientId: 'p1',
            bloodGroup: 'O-',
            status: 'pending',
            urgency: 'Critical',
        }
    });

    console.log('  ✅ 1 Patient + 1 Blood request created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('   Run `npx prisma studio` to inspect the data.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
