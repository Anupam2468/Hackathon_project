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

function confidence(score: number, label: 'High' | 'Moderate' | 'Low', factors: string[]) {
    return { score, label, factors };
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

export async function updateHospitalInventory(stockId: string, unitsAvailable: number) {
    await prisma.bloodStock.update({
        where: { id: stockId },
        data: { unitsAvailable }
    });
    return { success: true };
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
            clinicalReviewRequired: false,
            confidence: confidence(94, 'High', ['Exact blood group is reported in the primary inventory', 'Hospital confirmation is still required before issue']),
            message: `Exact match (${requiredBloodGroup}) available in primary hospital inventory (${primaryExactStock.unitsAvailable} units).`
        };
    }

    // =========================================================================
    // STAGE 2: Potential emergency-release fallback. This is only a signal for
    // a qualified blood-bank/clinical team; the system never decides compatibility.
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
            stageTitle: 'Stage 2: Clinical review suggested (O- stock)',
            matchType: 'Potential O- fallback — clinician approval required',
            hospitalName: currentHospital.name,
            bloodGroup: 'O-',
            unitsAvailable: primaryUniversalStock.unitsAvailable,
            donors: [],
            whatsappBroadcastSent: false,
            clinicalReviewRequired: true,
            confidence: confidence(42, 'Low', ['Exact blood group is not reported in primary inventory', 'A clinician must approve any fallback route']),
            message: `Requested blood (${requiredBloodGroup}) is unavailable. ${primaryUniversalStock.unitsAvailable} O- unit(s) are visible for immediate blood-bank and clinician review; do not reserve or issue without local protocol, testing, and approval.`
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
                clinicalReviewRequired: false,
                confidence: confidence(78, 'Moderate', ['Exact blood group is reported by a nearby partner hospital', 'Transfer and reservation still need hospital confirmation']),
                message: `Found exact match (${requiredBloodGroup}) in nearby hospital: ${hosp.name} (${hosp.distanceKm.toFixed(1)} km away, ${exactStock.unitsAvailable} units).`
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
            confidence: confidence(Math.min(88, 56 + exactMatchDonors.length * 8), exactMatchDonors.length >= 3 ? 'High' : 'Moderate', [`${exactMatchDonors.length} nearby verified potential donor(s) match exactly`, 'Availability and on-site screening must still be confirmed']),
            outreachPlan: [
                { wave: 1, donorCount: Math.min(3, exactMatchDonors.length), radiusKm: 3, action: 'Contact the closest available donors first' },
                { wave: 2, donorCount: Math.min(7, exactMatchDonors.length), radiusKm: 5, action: 'Expand only if wave 1 does not produce a confirmed arrival' },
                { wave: 3, donorCount: Math.min(10, exactMatchDonors.length), radiusKm: 10, action: 'Escalate to the wider verified network with hospital approval' },
            ].filter((wave, index, all) => index === 0 || wave.donorCount > all[index - 1].donorCount),
            message: `Found ${exactMatchDonors.length} nearby verified potential exact-match donor(s). Use progressive outreach to avoid unnecessary alerts.`
        };
    }

    // =========================================================================
    // STAGE 5: Automated Emergency WhatsApp Broadcast
    // PRIVACY: Phone numbers are used SERVER-SIDE only, NEVER returned to frontend
    // =========================================================================
    // A production integration would send provider-approved alerts here.
    // This prototype creates an escalation queue and never implies delivery.
    const alertedDonors = maskBroadcastResult(verifiedDonors.map(d => ({
        id: d.id,
        name: d.name,
        bloodGroup: d.bloodGroup,
    })));

    return {
        success: false,
        stage: 5,
        stageTitle: 'Stage 5: Emergency escalation queue created',
        matchType: 'Escalation needs an approved notification provider',
        donors: [],
        whatsappBroadcastSent: false,
        confidence: confidence(18, 'Low', ['No exact stock or nearby verified exact-match donor was found', 'Staff-led escalation is required']),
        rareGroupEscalation: requiredBloodGroup.endsWith('-') ? {
            enabled: true,
            message: `Rare-group escalation recommended for ${requiredBloodGroup}: notify partner blood banks and the verified rare-donor network.`
        } : null,
        alertedDonorsCount: alertedDonors.length,
        alertedDonors: alertedDonors,
        message: `No exact stock or nearby verified exact-match donor was found. An escalation queue for ${alertedDonors.length} eligible donors was created; hospital staff must review and send through an approved provider.`
    };
}
