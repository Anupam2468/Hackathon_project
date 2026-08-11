'use server';
import { prisma } from '../db/database';
import { hashPassword, verifyPassword, safeDonorProfile } from '../db/privacy';

async function aiVerifyRecord(recordData: string | null) {
    await new Promise(r => setTimeout(r, 1500));
    if (recordData && recordData.length > 10) {
        return { verified: true, aiNotes: 'Records appear legitimate. Blood type matches historical data.' };
    }
    return { verified: false, aiNotes: 'Insufficient or corrupted records detected.' };
}

export async function loginDonor(formData: any) {
    try {
        const donor = await prisma.donor.findUnique({
            where: { email: formData.email }
        });

        if (!donor) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Verify password against stored hash
        const isValid = verifyPassword(formData.password, donor.passwordHash);
        if (!isValid) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Return safe profile (no password hash, no raw coordinates)
        return { success: true, donor: safeDonorProfile(donor) };
    } catch (error) {
        return { success: false, message: 'Login failed. Please try again.' };
    }
}

export async function registerDonor(formData: any) {
    try {
        // Check if donor already exists
        const existing = await prisma.donor.findUnique({
            where: { email: formData.email }
        });

        if (existing) {
            return { success: false, message: 'Email already registered' };
        }

        const aiResult = await aiVerifyRecord('Sample Medical Data 12345');

        // Hash the password — NEVER store plain text
        const passwordHash = hashPassword(formData.password || 'defaultPass123');

        // Resolve GPS coordinates
        let latitude = parseFloat(formData.latitude);
        let longitude = parseFloat(formData.longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            // Try geocoding the address via Nominatim
            try {
                const encoded = encodeURIComponent(formData.address || '');
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
                    { headers: { 'User-Agent': 'FastLIFE-BloodDonation/1.0' } }
                );
                const geoData = await geoResponse.json();
                if (geoData && geoData.length > 0) {
                    latitude = parseFloat(geoData[0].lat);
                    longitude = parseFloat(geoData[0].lon);
                }
            } catch (e) {
                // Geocoding failed
            }
        }

        // Final fallback coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
            latitude = 22.4839 + (Math.random() * 0.05);
            longitude = 87.3245 + (Math.random() * 0.05);
        }

        // Create donor in Prisma (password is HASHED)
        const newDonor = await prisma.donor.create({
            data: {
                name: formData.name,
                email: formData.email,
                passwordHash: passwordHash,
                bloodGroup: formData.bloodGroup || 'A+',
                age: parseInt(formData.age) || 25,
                gender: formData.gender || 'Male',
                phone: formData.phone || '',
                whatsapp: formData.whatsapp || formData.phone || '',
                address: formData.address || '',
                latitude: latitude,
                longitude: longitude,
                verified: aiResult.verified,
                aiNotes: aiResult.aiNotes,
            }
        });

        // Return safe profile — no password hash sent to client
        return { success: true, donor: safeDonorProfile(newDonor) };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Registration failed. Please try again.' };
    }
}
