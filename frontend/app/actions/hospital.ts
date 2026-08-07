'use server';
import { getDb } from '../db/database';

// Haversine formula to calculate distance between two Geo-points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function getHospitalInventory(hospitalId: string = '1') {
    const db = getDb();
    return db.inventory.filter(inv => inv.hospitalId === hospitalId);
}

// AI Agent Matcher for finding Donors during emergencies
export async function findEmergencyDonors(requiredBloodGroup: string, lat: number, lon: number) {
    const db = getDb();

    // AI Matching rules context: Exact Match OR 'O-' Universal Donor
    const validDonors = db.donors.filter(d =>
        d.verified === true &&
        (d.bloodGroup === requiredBloodGroup || d.bloodGroup === 'O-')
    );

    // Compute distances for real-time location-based system
    const localizedDonors = validDonors.map(d => ({
        ...d,
        distanceKm: calculateDistance(lat, lon, d.latitude, d.longitude)
    }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 10); // Find top 10 as per requirements

    return localizedDonors;
}
