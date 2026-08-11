'use server';
import { prisma } from '../db/database';
import { maskDonorForPublic } from '../db/privacy';

// Haversine formula to calculate distance between two GPS points (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate ETA based on distance (average 30km/h city speed)
function calculateETA(distanceKm: number): string {
    const minutes = Math.round((distanceKm / 30) * 60);
    if (minutes < 1) return 'Less than 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
}

// Get compass direction from one point to another
function getDirection(fromLat: number, fromLon: number, toLat: number, toLon: number): string {
    const dLon = toLon - fromLon;
    const dLat = toLat - fromLat;
    const angle = Math.atan2(dLon, dLat) * 180 / Math.PI;
    const normalized = (angle + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
}

// Get compatible blood donor groups for a recipient
function getCompatibleDonorGroups(recipientGroup: string): string[] {
    const compatibility: Record<string, string[]> = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-'],
        'All': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    };
    return compatibility[recipientGroup] || [recipientGroup];
}

// Search donors by location, blood group, and radius
// PRIVACY: All results are masked — no contact info, no exact coordinates
export async function searchDonorsByLocation(
    lat: number,
    lng: number,
    bloodGroup: string,
    radiusKm: number = 10
) {
    // Query verified donors from Prisma
    const verifiedDonors = await prisma.donor.findMany({
        where: { verified: true }
    });

    let matchingDonors = verifiedDonors
        .filter(d => d.latitude != null && d.longitude != null)
        .map(d => {
            const distance = calculateDistance(lat, lng, d.latitude!, d.longitude!);
            return {
                ...d,
                distance: Math.round(distance * 10) / 10,
                eta: calculateETA(distance),
                direction: getDirection(lat, lng, d.latitude!, d.longitude!),
            };
        })
        .filter(d => d.distance <= radiusKm);

    // Filter by blood group if specified (not 'All')
    if (bloodGroup && bloodGroup !== 'All') {
        const compatibleGroups = getCompatibleDonorGroups(bloodGroup);
        matchingDonors = matchingDonors.filter(d => compatibleGroups.includes(d.bloodGroup));
    }

    // Sort by distance
    matchingDonors.sort((a, b) => a.distance - b.distance);

    // PRIVACY: Apply public masking — strips contact info, fuzzes coordinates
    const maskedDonors = matchingDonors.map(d => maskDonorForPublic(d));

    return {
        success: true,
        donors: maskedDonors,
        totalFound: maskedDonors.length,
        searchRadius: radiusKm,
        searchCenter: { lat, lng },
    };
}

// Geocode an address to lat/lng using Nominatim (free, no API key)
export async function geocodeAddress(address: string) {
    try {
        const encoded = encodeURIComponent(address);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
            {
                headers: {
                    'User-Agent': 'FastLIFE-BloodDonation/1.0'
                }
            }
        );
        const data = await response.json();

        if (data && data.length > 0) {
            return {
                success: true,
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                displayName: data[0].display_name,
            };
        }
        return { success: false, error: 'Address not found' };
    } catch (error) {
        return { success: false, error: 'Geocoding service unavailable' };
    }
}

// Reverse geocode: convert lat/lng to address string using Nominatim
export async function reverseGeocode(lat: number, lng: number) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'User-Agent': 'FastLIFE-BloodDonation/1.0'
                }
            }
        );
        const data = await response.json();

        if (data && data.display_name) {
            return {
                success: true,
                address: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village || '',
                state: data.address?.state || '',
                country: data.address?.country || '',
            };
        }
        return { success: false, error: 'Location not found' };
    } catch (error) {
        return { success: false, error: 'Reverse geocoding service unavailable' };
    }
}

// Get nearby hospitals sorted by distance
export async function getNearbyHospitals(lat: number, lng: number, radiusKm: number = 50) {
    const allHospitals = await prisma.hospital.findMany();

    const hospitals = allHospitals
        .filter(h => h.latitude != null && h.longitude != null)
        .map(h => {
            const distance = calculateDistance(lat, lng, h.latitude!, h.longitude!);
            return {
                id: h.id,
                name: h.name,
                latitude: h.latitude!,
                longitude: h.longitude!,
                distance: Math.round(distance * 10) / 10,
                eta: calculateETA(distance),
                direction: getDirection(lat, lng, h.latitude!, h.longitude!),
            };
        })
        .filter(h => h.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

    return {
        success: true,
        hospitals,
        totalFound: hospitals.length,
    };
}
