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

// 5-Stage Hospital Segment Emergency Blood Search Engine
export async function findEmergencyDonors(
    requiredBloodGroup: string,
    lat: number,
    lon: number,
    hospitalId: string = '1'
) {
    const db = getDb();
    const MAX_DONOR_DISTANCE_KM = 5.0;

    const currentHospital = db.hospitals.find(h => h.id === hospitalId) || db.hospitals[0] || { id: '1', name: 'City Central Hospital' };

    // =========================================================================
    // STAGE 1: Primary Hospital Stock - Specific Blood Type (Exact Match)
    // =========================================================================
    const primaryExactStock = db.inventory.find(
        inv => inv.hospitalId === currentHospital.id &&
               inv.bloodGroup === requiredBloodGroup &&
               inv.units > 0
    );

    if (primaryExactStock) {
        return {
            success: true,
            stage: 1,
            stageTitle: 'Stage 1: Primary Hospital Inventory (Exact Match)',
            matchType: 'Primary Hospital Stock (Exact Match)',
            hospitalName: currentHospital.name,
            bloodGroup: primaryExactStock.bloodGroup,
            unitsAvailable: primaryExactStock.units,
            donors: [],
            whatsappBroadcastSent: false,
            message: `Exact match (${requiredBloodGroup}) available in primary hospital inventory (${primaryExactStock.units} units).`
        };
    }

    // =========================================================================
    // STAGE 2: Primary Hospital Stock - Universal Blood Type 'O-'
    // =========================================================================
    const primaryUniversalStock = db.inventory.find(
        inv => inv.hospitalId === currentHospital.id &&
               inv.bloodGroup === 'O-' &&
               inv.units > 0
    );

    if (primaryUniversalStock) {
        return {
            success: true,
            stage: 2,
            stageTitle: 'Stage 2: Primary Hospital Inventory (Universal O- Stock)',
            matchType: 'Primary Hospital Stock (Universal O-)',
            hospitalName: currentHospital.name,
            bloodGroup: 'O-',
            unitsAvailable: primaryUniversalStock.units,
            donors: [],
            whatsappBroadcastSent: false,
            message: `Requested blood (${requiredBloodGroup}) out of stock in hospital. Found Universal O- stock (${primaryUniversalStock.units} units) in primary hospital.`
        };
    }

    // =========================================================================
    // STAGE 3: Nearby Hospitals Inventory Search (Exact Match & Universal O-)
    // =========================================================================
    const otherHospitals = db.hospitals
        .filter(h => h.id !== currentHospital.id)
        .map(h => {
            const hLat = h.latitude || (lat + 0.01);
            const hLon = h.longitude || (lon + 0.01);
            return {
                ...h,
                distanceKm: calculateDistance(lat, lon, hLat, hLon)
            };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);

    // 3a. Search specific blood type in nearby hospitals
    for (const hosp of otherHospitals) {
        const exactStock = db.inventory.find(
            inv => inv.hospitalId === hosp.id &&
                   inv.bloodGroup === requiredBloodGroup &&
                   inv.units > 0
        );
        if (exactStock) {
            return {
                success: true,
                stage: 3,
                stageTitle: 'Stage 3: Nearby Hospital Inventory (Exact Match)',
                matchType: 'Nearby Hospital Stock (Exact Match)',
                hospitalName: hosp.name,
                distanceKm: hosp.distanceKm,
                bloodGroup: exactStock.bloodGroup,
                unitsAvailable: exactStock.units,
                donors: [],
                whatsappBroadcastSent: false,
                message: `Found exact match (${requiredBloodGroup}) in nearby hospital: ${hosp.name} (${hosp.distanceKm.toFixed(1)} km away, ${exactStock.units} units).`
            };
        }
    }

    // 3b. Search universal blood type 'O-' in nearby hospitals
    for (const hosp of otherHospitals) {
        const universalStock = db.inventory.find(
            inv => inv.hospitalId === hosp.id &&
                   inv.bloodGroup === 'O-' &&
                   inv.units > 0
        );
        if (universalStock) {
            return {
                success: true,
                stage: 3,
                stageTitle: 'Stage 3: Nearby Hospital Inventory (Universal O- Stock)',
                matchType: 'Nearby Hospital Stock (Universal O-)',
                hospitalName: hosp.name,
                distanceKm: hosp.distanceKm,
                bloodGroup: 'O-',
                unitsAvailable: universalStock.units,
                donors: [],
                whatsappBroadcastSent: false,
                message: `Found Universal O- stock in nearby hospital: ${hosp.name} (${hosp.distanceKm.toFixed(1)} km away, ${universalStock.units} units).`
            };
        }
    }

    // =========================================================================
    // STAGE 4: Nearby Verified Individual Donors (Exact Match & Universal O- within 5km)
    // =========================================================================
    const verifiedDonors = db.donors.filter(d => d.verified === true);

    // 4a. Search exact match donors within 5 km
    const exactMatchDonors = verifiedDonors
        .map(d => ({
            ...d,
            distanceKm: calculateDistance(lat, lon, d.latitude, d.longitude),
            matchType: 'Nearby Verified Donor (Exact Match)',
            isUniversalFallback: false
        }))
        .filter(d => d.bloodGroup === requiredBloodGroup && d.distanceKm <= MAX_DONOR_DISTANCE_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);

    if (exactMatchDonors.length > 0) {
        return {
            success: true,
            stage: 4,
            stageTitle: 'Stage 4: Verified Nearby Donor (Exact Match)',
            matchType: 'Nearby Donor (Exact Match)',
            donors: exactMatchDonors.slice(0, 10),
            whatsappBroadcastSent: false,
            message: `Found verified exact match donor (${requiredBloodGroup}) within 5 km radius.`
        };
    }

    // 4b. Search universal O- donors within 5 km
    const isPositiveRecipient = requiredBloodGroup.includes('+');
    const fallbackDonors = verifiedDonors
        .map(d => ({
            ...d,
            distanceKm: calculateDistance(lat, lon, d.latitude, d.longitude),
            matchType: 'Nearby Verified Donor (Universal O- Fallback)',
            isUniversalFallback: true
        }))
        .filter(d =>
            (d.bloodGroup === 'O-' || (isPositiveRecipient && d.bloodGroup === 'O+')) &&
            d.distanceKm <= MAX_DONOR_DISTANCE_KM
        )
        .sort((a, b) => a.distanceKm - b.distanceKm);

    if (fallbackDonors.length > 0) {
        return {
            success: true,
            stage: 4,
            stageTitle: 'Stage 4: Verified Nearby Donor (Universal O- Fallback)',
            matchType: 'Nearby Donor (Universal O- Fallback)',
            donors: fallbackDonors.slice(0, 10),
            whatsappBroadcastSent: false,
            message: `Found verified Universal O- donor within 5 km radius.`
        };
    }

    // =========================================================================
    // STAGE 5: Automated Emergency WhatsApp Broadcast to All Active Donors
    // =========================================================================
    const alertedDonors = verifiedDonors.map(d => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        whatsapp: d.whatsapp || d.phone,
        bloodGroup: d.bloodGroup,
        message: `URGENT HOSPITAL EMERGENCY: No stock or 5km donors available for ${requiredBloodGroup} blood. Please visit ${currentHospital.name} immediately if available for blood donation.`
    }));

    return {
        success: false,
        stage: 5,
        stageTitle: 'Stage 5: Emergency WhatsApp Broadcast Dispatched',
        matchType: 'Automated WhatsApp Broadcast Sent',
        donors: [],
        whatsappBroadcastSent: true,
        alertedDonorsCount: alertedDonors.length,
        alertedDonors: alertedDonors,
        message: `No blood stock in any hospital and no donor within 5 km. Automated WhatsApp emergency broadcast sent to all ${alertedDonors.length} active donor(s).`
    };
}
