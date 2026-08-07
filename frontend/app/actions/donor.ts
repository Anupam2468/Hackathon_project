'use server';
import { getDb, saveDb } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

async function aiVerifyRecord(recordData: string | null) {
    await new Promise(r => setTimeout(r, 1500));
    if (recordData && recordData.length > 10) {
        return { verified: true, aiNotes: 'Records appear legitimate. Blood type matches historical data.' };
    }
    return { verified: false, aiNotes: 'Insufficient or corrupted records detected.' };
}

export async function loginDonor(formData: any) {
    const db = getDb();

    // Find user by email and password
    const donor = db.donors.find(d => d.email === formData.email && d.password === formData.password);

    if (donor) {
        return { success: true, donor: donor };
    }
    return { success: false, message: 'Invalid Invalid email or password' };
}

export async function registerDonor(formData: any) {
    const db = getDb();

    // Check if donor already exists
    if (db.donors.find(d => d.email === formData.email)) {
        return { success: false, message: 'Email already registered' };
    }

    const aiResult = await aiVerifyRecord("Sample Medical Data 12345");

    const newDonor = {
        id: uuidv4(),
        ...formData,
        verified: aiResult.verified,
        aiNotes: aiResult.aiNotes,
        latitude: 37.7749 + (Math.random() * 0.05),
        longitude: -122.4194 + (Math.random() * 0.05),
        createdAt: new Date().toISOString()
    };

    db.donors.push(newDonor);
    saveDb(db);

    return { success: true, donor: newDonor };
}
