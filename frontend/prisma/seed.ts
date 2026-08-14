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
    // HOSPITALS (Spread across West Bengal: Kolkata, Kharagpur, Rampurhat)
    // ============================================
    const hospitalsData = [
        { id: 'h1', name: 'Apollo Gleneagles Hospitals', location: 'Salt Lake, Kolkata', latitude: 22.5768, longitude: 88.4037, verifiedBadge: true },
        { id: 'h2', name: 'AMRI Hospitals', location: 'Dhakuria, Kolkata', latitude: 22.5085, longitude: 88.3639, verifiedBadge: true },
        { id: 'h3', name: 'Kharagpur Sub-Divisional Hospital', location: 'Kharagpur', latitude: 22.3320, longitude: 87.3235, verifiedBadge: true },
        { id: 'h4', name: 'Midnapore Medical College and Hospital', location: 'Midnapore', latitude: 22.4239, longitude: 87.3204, verifiedBadge: true },
        { id: 'h5', name: 'Rampurhat Government Medical College', location: 'Rampurhat', latitude: 24.1755, longitude: 87.7735, verifiedBadge: true },
        { id: 'h6', name: 'Rayagada Community Health Centre', location: 'Rayagada, Gajapati, Odisha, 761213', latitude: 18.97, longitude: 84.16, verifiedBadge: true },
        { id: 'h7', name: 'AIIMS Bhubaneswar', location: 'Sijua, Patrapada, Bhubaneswar (Near Tamando)', latitude: 20.234, longitude: 85.776, verifiedBadge: true },
    ];

    for (const h of hospitalsData) {
        await prisma.hospital.create({ data: h });
    }
    console.log(`  ✅ ${hospitalsData.length} Hospitals created`);

    // ============================================
    // BLOOD STOCK
    // ============================================
    const bloodStockData = [
        { hospitalId: 'h1', bloodGroup: 'A+', unitsAvailable: 45 },
        { hospitalId: 'h1', bloodGroup: 'O-', unitsAvailable: 3 },
        { hospitalId: 'h2', bloodGroup: 'B+', unitsAvailable: 15 },
        { hospitalId: 'h3', bloodGroup: 'O-', unitsAvailable: 8 },
        { hospitalId: 'h4', bloodGroup: 'AB+', unitsAvailable: 10 },
        { hospitalId: 'h5', bloodGroup: 'A+', unitsAvailable: 12 },
        { hospitalId: 'h6', bloodGroup: 'O+', unitsAvailable: 20 },
        { hospitalId: 'h6', bloodGroup: 'B-', unitsAvailable: 5 },
        { hospitalId: 'h7', bloodGroup: 'AB+', unitsAvailable: 15 },
        { hospitalId: 'h7', bloodGroup: 'A-', unitsAvailable: 8 },
    ];
    await prisma.bloodStock.createMany({ data: bloodStockData });
    console.log(`  ✅ ${bloodStockData.length} Blood stock records created`);

    // ============================================
    // DONORS
    // ============================================
    const donorsData = [
        // Kolkata Area
        { id: 'd1', name: 'Ananya Sharma', email: 'ananya@example.com', bloodGroup: 'O+', phone: '9876543210', latitude: 22.5726, longitude: 88.3639 },
        { id: 'd2', name: 'Rahul Bose', email: 'rahul@example.com', bloodGroup: 'B-', phone: '9876543211', latitude: 22.5800, longitude: 88.4000 },
        { id: 'd3', name: 'Priya Das', email: 'priya@example.com', bloodGroup: 'AB+', phone: '9876543212', latitude: 22.5000, longitude: 88.3500 },
        // Kharagpur/Midnapore Area
        { id: 'd4', name: 'Suman Mahato', email: 'suman@example.com', bloodGroup: 'A+', phone: '9876543213', latitude: 22.3350, longitude: 87.3200 },
        { id: 'd5', name: 'Kabir Sen', email: 'kabir@example.com', bloodGroup: 'O-', phone: '9876543214', latitude: 22.4200, longitude: 87.3100 },
        { id: 'd6', name: 'Rounak Prasad', email: 'rockytysan879@gmail.com', bloodGroup: 'A+', phone: '9239459085', latitude: 22.4800, longitude: 87.3200 }, // Default center
        { id: 'd7', name: 'Aditi Roy', email: 'aditi@example.com', bloodGroup: 'B+', phone: '9876543215', latitude: 22.3400, longitude: 87.3300 },
        { id: 'd8', name: 'Tapas Mondal', email: 'tapas@example.com', bloodGroup: 'AB-', phone: '9876543216', latitude: 22.4100, longitude: 87.3300 },
        // Rampurhat Area
        { id: 'd9', name: 'Bikash Saha', email: 'bikash@example.com', bloodGroup: 'O+', phone: '9876543217', latitude: 24.1700, longitude: 87.7700 },
        { id: 'd10', name: 'Puja Chatterjee', email: 'puja@example.com', bloodGroup: 'A-', phone: '9876543218', latitude: 24.1800, longitude: 87.7800 },
        { id: 'd11', name: 'Arjun Das', email: 'arjun@example.com', bloodGroup: 'B+', phone: '9876543219', latitude: 24.1600, longitude: 87.7600 },
        // Rayagada, Gajapati Area (18.97, 84.16)
        { id: 'd12', name: 'Sanjay Patra', email: 'sanjay.patra@example.com', bloodGroup: 'O+', phone: '9876500001', latitude: 18.9720, longitude: 84.1610 },
        { id: 'd13', name: 'Manoj Nayak', email: 'manoj.nayak@example.com', bloodGroup: 'B-', phone: '9876500002', latitude: 18.9680, longitude: 84.1550 },
        { id: 'd14', name: 'Ankita Pradhan', email: 'ankita.p@example.com', bloodGroup: 'A+', phone: '9876500003', latitude: 18.9750, longitude: 84.1650 },
        { id: 'd15', name: 'Subrat Behera', email: 'subrat.b@example.com', bloodGroup: 'AB+', phone: '9876500004', latitude: 18.9650, longitude: 84.1580 },
        // Tamando, Khordha Area (20.237, 85.745)
        { id: 'd16', name: 'Rahul Patnaik', email: 'rahul.p@example.com', bloodGroup: 'O-', phone: '9876500005', latitude: 20.237, longitude: 85.745 },
        { id: 'd17', name: 'Smriti Das', email: 'smriti.d@example.com', bloodGroup: 'B+', phone: '9876500006', latitude: 20.235, longitude: 85.740 },
        { id: 'd18', name: 'Kiran Mohanty', email: 'kiran.m@example.com', bloodGroup: 'A-', phone: '9876500007', latitude: 20.240, longitude: 85.750 },
        { id: 'd19', name: 'Deepak Mishra', email: 'deepak.m@example.com', bloodGroup: 'AB+', phone: '9876500008', latitude: 20.230, longitude: 85.748 },
    ];

    for (const d of donorsData) {
        await prisma.donor.create({
            data: {
                id: d.id,
                name: d.name,
                email: d.email,
                passwordHash: hashPassword('donor123'),
                bloodGroup: d.bloodGroup,
                age: 25 + Math.floor(Math.random() * 20),
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                phone: d.phone,
                whatsapp: d.phone,
                address: 'Sample Address',
                latitude: d.latitude,
                longitude: d.longitude,
                verified: true,
                aiNotes: 'Verified donor record.',
            }
        });
    }
    console.log(`  ✅ ${donorsData.length} Donors created`);

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
    // SAMPLE BLOOD REQUESTS
    // ============================================
    await prisma.patient.create({
        data: { id: 'p1', name: 'John Smith', contact: '555-0100' }
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
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
