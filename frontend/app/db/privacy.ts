import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

// ============================================================
// PASSWORD HASHING (using Node.js built-in crypto.scrypt)
// ============================================================

/**
 * Hash a password with a random salt using scrypt.
 * Returns format: salt:hash (both hex-encoded)
 */
export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    try {
        const [salt, hash] = storedHash.split(':');
        if (!salt || !hash) return false;
        const hashBuffer = Buffer.from(hash, 'hex');
        const suppliedBuffer = scryptSync(password, salt, 64);
        return timingSafeEqual(hashBuffer, suppliedBuffer);
    } catch {
        return false;
    }
}

// ============================================================
// NAME MASKING
// ============================================================

/**
 * Mask a full name: "Rounak Prasad" → "Rounak P."
 * Single names: "Rounak" → "Rounak"
 */
function maskName(fullName: string): string {
    if (!fullName) return 'Anonymous';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// ============================================================
// ROLE-BASED DATA MASKING FUNCTIONS
// ============================================================

/**
 * PRIVACY RULE: Public / Unauthenticated visitors (e.g., Find Donors page)
 * 
 * CAN SEE: Masked name, blood group, distance, ETA, verified badge, direction
 * CANNOT SEE: Full name, phone, email, WhatsApp, address, exact lat/lng, password
 */
export function maskDonorForPublic(donor: any) {
    return {
        id: donor.id || donor.donor_id,
        name: maskName(donor.name),
        bloodGroup: donor.bloodGroup || donor.blood_group,
        verified: donor.verified ?? donor.verified_badge ?? false,
        // Distance data (computed server-side, never raw coordinates)
        distance: donor.distance,
        eta: donor.eta,
        direction: donor.direction,
        // Approximate location for map (offset by ~200m for privacy)
        mapLat: donor.latitude ? donor.latitude + (Math.random() * 0.004 - 0.002) : null,
        mapLng: donor.longitude ? donor.longitude + (Math.random() * 0.004 - 0.002) : null,
    };
}

/**
 * PRIVACY RULE: Recipients / Patients searching for donors
 * 
 * CAN SEE: Same as public + matchType indicator
 * CANNOT SEE: Contact info, exact location, personal details
 * UNLOCKS: Contact info ONLY after donor accepts the request (isAccepted=true)
 */
export function maskDonorForRecipient(donor: any, isAccepted: boolean = false) {
    const base = maskDonorForPublic(donor);

    if (isAccepted) {
        // Donor has accepted — reveal first name + phone for coordination
        return {
            ...base,
            name: donor.name?.split(' ')[0] || 'Donor', // First name only
            phone: donor.phone,
            matchType: donor.matchType,
            isUniversalFallback: donor.isUniversalFallback,
            accepted: true,
        };
    }

    return {
        ...base,
        matchType: donor.matchType,
        isUniversalFallback: donor.isUniversalFallback,
        accepted: false,
    };
}

/**
 * PRIVACY RULE: Hospitals searching for donors (emergency system)
 * 
 * CAN SEE: Masked name, blood group, distance, verified status
 * CANNOT SEE: Personal contact info UNLESS donor has accepted the emergency
 * SPECIAL: Hospitals CAN trigger broadcast but phone numbers stay server-side
 */
export function maskDonorForHospital(donor: any, isAccepted: boolean = false) {
    const base = maskDonorForPublic(donor);

    if (isAccepted) {
        return {
            ...base,
            name: donor.name, // Hospital gets full name after acceptance
            phone: donor.phone,
            matchType: donor.matchType,
            isUniversalFallback: donor.isUniversalFallback,
            accepted: true,
        };
    }

    return {
        ...base,
        matchType: donor.matchType,
        isUniversalFallback: donor.isUniversalFallback,
        accepted: false,
    };
}

/**
 * PRIVACY RULE: Donors seeing emergency blood requests
 * 
 * CAN SEE: Hospital name, blood type needed, urgency, distance
 * CANNOT SEE: Patient name, patient contact, patient medical history
 */
export function maskRequestForDonor(request: any) {
    return {
        id: request.id || request.request_id,
        hospitalName: request.hospitalName || request.hospital?.name || 'Nearby Hospital',
        bloodGroup: request.bloodGroup || request.blood_group,
        urgency: request.urgency || 'Normal',
        distance: request.distance,
        eta: request.eta,
        createdAt: request.createdAt || request.created_at,
        status: request.status,
        // Patient details are STRIPPED — donor does NOT need to know who the patient is
    };
}

/**
 * PRIVACY RULE: WhatsApp Emergency Broadcast (Stage 5)
 * 
 * The backend sends WhatsApp messages but NEVER returns phone numbers to the frontend.
 * Frontend only sees: count of donors notified + masked names.
 */
export function maskBroadcastResult(donors: any[]) {
    return donors.map(d => ({
        id: d.id || d.donor_id,
        name: maskName(d.name),
        bloodGroup: d.bloodGroup || d.blood_group,
        notified: true,
        // Phone/WhatsApp are STRIPPED — they were used server-side only
    }));
}

/**
 * Sanitize a full emergency search result based on the requesting role.
 */
export function sanitizeSearchResult(result: any, role: 'hospital' | 'recipient' | 'public' = 'public') {
    const sanitized = { ...result };

    // Mask donors in Stage 4 results
    if (sanitized.donors && sanitized.donors.length > 0) {
        if (role === 'hospital') {
            sanitized.donors = sanitized.donors.map((d: any) => maskDonorForHospital(d, false));
        } else if (role === 'recipient') {
            sanitized.donors = sanitized.donors.map((d: any) => maskDonorForRecipient(d, false));
        } else {
            sanitized.donors = sanitized.donors.map((d: any) => maskDonorForPublic(d));
        }
    }

    // Mask Stage 5 broadcast results — NEVER return phone numbers
    if (sanitized.alertedDonors && sanitized.alertedDonors.length > 0) {
        sanitized.alertedDonors = maskBroadcastResult(sanitized.alertedDonors);
    }

    return sanitized;
}

/**
 * Mask a donor profile for the donor's OWN dashboard view.
 * They can see their own full data but passwords are stripped.
 */
export function safeDonorProfile(donor: any) {
    return {
        id: donor.id || donor.donor_id,
        name: donor.name,
        email: donor.email,
        bloodGroup: donor.bloodGroup || donor.blood_group,
        age: donor.age,
        gender: donor.gender,
        phone: donor.phone,
        whatsapp: donor.whatsapp,
        address: donor.address,
        verified: donor.verified ?? donor.verified_badge ?? false,
        aiNotes: donor.aiNotes || donor.ai_notes,
        createdAt: donor.createdAt || donor.created_at,
        // PASSWORD AND RAW COORDINATES ARE NEVER SENT TO CLIENT
    };
}
