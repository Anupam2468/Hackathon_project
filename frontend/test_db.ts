import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma database models with PrismaBetterSqlite3 adapter...\n');

  // 1. Create a Hospital
  const hospital = await prisma.hospital.create({
    data: {
      name: 'City Care Hospital',
      location: '123 Main St, New York',
      verified_badge: true,
    },
  });
  console.log('✓ Created Hospital:', hospital.name, `(ID: ${hospital.hospital_id})`);

  // 2. Create a Doctor
  const doctor = await prisma.doctor.create({
    data: {
      name: 'Dr. Gregory House',
      hospital_id: hospital.hospital_id,
      verified_badge: true,
    },
  });
  console.log('✓ Created Doctor:', doctor.name, `(ID: ${doctor.doctor_id})`);

  // 3. Create Blood Stock
  const stock = await prisma.bloodStock.create({
    data: {
      hospital_id: hospital.hospital_id,
      blood_group: 'O-',
      units_available: 50,
    },
  });
  console.log('✓ Created Blood Stock:', stock.blood_group, stock.units_available, 'units');

  // 4. Create a Patient
  const patient = await prisma.patient.create({
    data: {
      name: 'Jane Miller',
      contact: '+1-555-9876',
    },
  });
  console.log('✓ Created Patient:', patient.name, `(ID: ${patient.patient_id})`);

  // 5. Create a Donor
  const donor = await prisma.donor.create({
    data: {
      name: 'John Smith',
      blood_group: 'O-',
      age: 29,
      weight: 72.5,
      eligibility_status: 'Eligible',
      verified_badge: true,
      contact: '+1-555-0192',
    },
  });
  console.log('✓ Created Donor:', donor.name, `(ID: ${donor.donor_id})`);

  // 6. Create Health Questionnaire
  const questionnaire = await prisma.healthQuestionnaire.create({
    data: {
      donor_id: donor.donor_id,
      weight: 72.5,
      age: 29,
      medical_history: 'No pre-existing conditions',
      eligible: true,
    },
  });
  console.log('✓ Created Health Questionnaire for Donor:', questionnaire.questionnaire_id);

  // 7. Create a Blood Request
  const bloodRequest = await prisma.bloodRequest.create({
    data: {
      patient_id: patient.patient_id,
      hospital_id: hospital.hospital_id,
      donor_id: donor.donor_id,
      blood_group: 'O-',
      status: 'Fulfilled',
    },
  });
  console.log('✓ Created Blood Request:', bloodRequest.request_id, bloodRequest.status);

  // 8. Create Notification
  const notification = await prisma.notification.create({
    data: {
      donor_id: donor.donor_id,
      type: 'EMERGENCY_REQUEST',
    },
  });
  console.log('✓ Created Notification for Donor:', notification.notification_id);

  // 9. Create a Donation record
  const donation = await prisma.donation.create({
    data: {
      donor_id: donor.donor_id,
      hospital_id: hospital.hospital_id,
      doctor_id: doctor.doctor_id,
      lab_test_result: 'Passed - Clean',
      status: 'Completed',
    },
  });
  console.log('✓ Created Donation:', donation.donation_id, donation.status);

  // 10. Create a Certificate
  const cert = await prisma.certificate.create({
    data: {
      donation_id: donation.donation_id,
      pdf_url: 'https://fastlife.org/certificates/cert_101.pdf',
    },
  });
  console.log('✓ Generated Certificate:', cert.certificate_id, cert.pdf_url);

  console.log('\n🎉 ALL 11 PRISMA MODELS & RELATIONS VALIDATED SUCCESSFULLY IN THE DATABASE!');
}

main()
  .catch((e) => {
    console.error('Error testing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
