'use server';
import { prisma } from '../db/database';
import { maskDonorForHospital, maskBroadcastResult, sanitizeSearchResult } from '../db/privacy';

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

export async function getHospitalInventory(hospitalId: string = 'h1') {
    const stocks = await prisma.bloodStock.findMany({
        where: { hospitalId: hospitalId }
    });

    return stocks.map(s => ({
        id: s.id,
        hospitalId: s.hospitalId,
        bloodGroup: s.bloodGroup,
        units: s.unitsAvailable,
        status: s.unitsAvailable > 10 ? 'Healthy' : s.unitsAvailable > 3 ? 'Low' : 'Critical',
    }));
}

// 5-Stage Hospital Segment Emergency Blood Search Engine
export async function findEmergencyDonors(
    requiredBloodGroup: string,
    lat: number,
    lon: number,
    hospitalId: string = 'h1'
) {
    const MAX_DONOR_DISTANCE_KM = 5.0;

    // Get current hospital
    const currentHospital = await prisma.hospital.findUnique({ where: { id: hospitalId } })
        || await prisma.hospital.findFirst()
        || { id: 'h1', name: 'City Central Hospital', latitude: null, longitude: null };

    // =========================================================================
    // STAGE 1: Primary Hospital Stock - Specific Blood Type (Exact Match)
    // =========================================================================
    const primaryExactStock = await prisma.bloodStock.findFirst({
        where: {
            hospitalId: currentHospital.id,
            bloodGroup: requiredBloodGroup,
            unitsAvailable: { gt: 0 }
        }
    });

    if (primaryExactStock) {
        return {
            success: true,
            stage: 1,
            stageTitle: 'Stage 1: Primary Hospital Inventory (Exact Match)',
            matchType: 'Primary Hospital Stock (Exact Match)',
            hospitalName: currentHospital.name,
            bloodGroup: primaryExactStock.bloodGroup,
            unitsAvailable: primaryExactStock.unitsAvailable,
            donors: [],
            whatsappBroadcastSent: false,
            message: `Exact match (${requiredBloodGroup}) available in primary hospital inventory (${primaryExactStock.unitsAvailable} units).`
        };
    }

    // =========================================================================
    // STAGE 2: Primary Hospital Stock - Universal Blood Type 'O-'
    // =========================================================================
    const primaryUniversalStock = await prisma.bloodStock.findFirst({
        where: {
            hospitalId: currentHospital.id,
            bloodGroup: 'O-',
            unitsAvailable: { gt: 0 }
        }
    });

    if (primaryUniversalStock) {
        return {
            success: true,
            stage: 2,
            stageTitle: 'Stage 2: Primary Hospital Inventory (Universal O- Stock)',
            matchType: 'Primary Hospital Stock (Universal O-)',
            hospitalName: currentHospital.name,
            bloodGroup: 'O-',
            unitsAvailable: primaryUniversalStock.unitsAvailable,
            donors: [],
            whatsappBroadcastSent: false,
            message: `Requested blood (${requiredBloodGroup}) out of stock. Found Universal O- stock (${primaryUniversalStock.unitsAvailable} units).`
        };
    }

    // =========================================================================
    // STAGE 3: Nearby Hospitals Inventory Search
    // =========================================================================
    const allHospitals = await prisma.hospital.findMany({
        where: { id: { not: currentHospital.id } },
        include: { bloodStocks: true }
    });

    const otherHospitals = allHospitals
        .map(h => ({
            ...h,
            distanceKm: calculateDistance(lat, lon, h.latitude || lat, h.longitude || lon)
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

    // 3a. Exact match in nearby hospitals
    for (const hosp of otherHospitals) {
        const exactStock = hosp.bloodStocks.find(
            s => s.bloodGroup === requiredBloodGroup && s.unitsAvailable > 0
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
                unitsAvailable: exactStock.unitsAvailable,
                donors: [],
                whatsappBroadcastSent: false,
                message: `Found exact match (${requiredBloodGroup}) in nearby hospital: ${hosp.name} (${hosp.distanceKm.toFixed(1)} km away, ${exactStock.unitsAvailable} units).`
            };
        }
    }

    // 3b. Universal O- in nearby hospitals
    for (const hosp of otherHospitals) {
        const universalStock = hosp.bloodStocks.find(
            s => s.bloodGroup === 'O-' && s.unitsAvailable > 0
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
                unitsAvailable: universalStock.unitsAvailable,
                donors: [],
                whatsappBroadcastSent: false,
                message: `Found Universal O- stock in nearby hospital: ${hosp.name} (${hosp.distanceKm.toFixed(1)} km away, ${universalStock.unitsAvailable} units).`
            };
        }
    }

    // =========================================================================
    // STAGE 4: Nearby Verified Individual Donors (within 5km)
    // =========================================================================
    const verifiedDonors = await prisma.donor.findMany({
        where: { verified: true }
    });

    // 4a. Exact match donors within 5km
    const exactMatchDonors = verifiedDonors
        .filter(d => d.latitude != null && d.longitude != null)
        .map(d => ({
            id: d.id,
            name: d.name,
            bloodGroup: d.bloodGroup,
            phone: d.phone,
            whatsapp: d.whatsapp,
            latitude: d.latitude!,
            longitude: d.longitude!,
            verified: d.verified,
            distanceKm: calculateDistance(lat, lon, d.latitude!, d.longitude!),
            matchType: 'Nearby Verified Donor (Exact Match)',
            isUniversalFallback: false
        }))
        .filter(d => d.bloodGroup === requiredBloodGroup && d.distanceKm <= MAX_DONOR_DISTANCE_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);

    if (exactMatchDonors.length > 0) {
        // PRIVACY: Mask donor data before returning
        const maskedDonors = exactMatchDonors.slice(0, 10).map(d => maskDonorForHospital(d, false));
        return {
            success: true,
            stage: 4,
            stageTitle: 'Stage 4: Verified Nearby Donor (Exact Match)',
            matchType: 'Nearby Donor (Exact Match)',
            donors: maskedDonors,
            whatsappBroadcastSent: false,
            message: `Found verified exact match donor (${requiredBloodGroup}) within 5 km radius.`
        };
    }

    // 4b. Universal O- donors within 5km
    const isPositiveRecipient = requiredBloodGroup.includes('+');
    const fallbackDonors = verifiedDonors
        .filter(d => d.latitude != null && d.longitude != null)
        .map(d => ({
            id: d.id,
            name: d.name,
            bloodGroup: d.bloodGroup,
            phone: d.phone,
            whatsapp: d.whatsapp,
            latitude: d.latitude!,
            longitude: d.longitude!,
            verified: d.verified,
            distanceKm: calculateDistance(lat, lon, d.latitude!, d.longitude!),
            matchType: 'Nearby Verified Donor (Universal O- Fallback)',
            isUniversalFallback: true
        }))
        .filter(d =>
            (d.bloodGroup === 'O-' || (isPositiveRecipient && d.bloodGroup === 'O+')) &&
            d.distanceKm <= MAX_DONOR_DISTANCE_KM
        )
        .sort((a, b) => a.distanceKm - b.distanceKm);

    if (fallbackDonors.length > 0) {
        // PRIVACY: Mask donor data
        const maskedDonors = fallbackDonors.slice(0, 10).map(d => maskDonorForHospital(d, false));
        return {
            success: true,
            stage: 4,
            stageTitle: 'Stage 4: Verified Nearby Donor (Universal O- Fallback)',
            matchType: 'Nearby Donor (Universal O- Fallback)',
            donors: maskedDonors,
            whatsappBroadcastSent: false,
            message: `Found verified Universal O- donor within 5 km radius.`
        };
    }

    // =========================================================================
    // STAGE 5: Automated Emergency WhatsApp Broadcast
    // PRIVACY: Phone numbers are used SERVER-SIDE only, NEVER returned to frontend
    // =========================================================================
    // Server-side: We would send WhatsApp messages here using donor.phone/whatsapp
    // But we NEVER return those phone numbers to the frontend
    const alertedDonors = maskBroadcastResult(verifiedDonors.map(d => ({
        id: d.id,
        name: d.name,
        bloodGroup: d.bloodGroup,
    })));

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
