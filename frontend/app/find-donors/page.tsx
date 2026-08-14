'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { searchDonorsByLocation, getNearbyHospitals, geocodeAddress } from '../actions/location';

// Dynamically import the map component (Leaflet doesn't support SSR)
const DonorMap = dynamic(() => import('../components/DonorMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '500px',
            background: 'var(--surface-color)',
            borderRadius: 'var(--border-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'var(--glass-border)',
        }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading map...</p>
        </div>
    ),
});

interface DonorResult {
    id: string;
    name: string;
    bloodGroup: string;
    latitude?: number;
    longitude?: number;
    mapLat?: number;
    mapLng?: number;
    verified: boolean;
    distance: number;
    eta: string;
    direction: string;
}

interface HospitalResult {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
    eta: string;
}

export default function FindDonorsPage() {
    // Location state
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLng, setUserLng] = useState<number | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>('');
    const [locationAddress, setLocationAddress] = useState<string>('');

    // Search state
    const [bloodGroup, setBloodGroup] = useState('All');
    const [radius, setRadius] = useState(10);
    const [addressSearch, setAddressSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Results
    const [donors, setDonors] = useState<DonorResult[]>([]);
    const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
    const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
    const [requestedDonors, setRequestedDonors] = useState<Set<string>>(new Set());

    // Get GPS location
    const handleGetGPS = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationStatus('GPS not supported in this browser');
            return;
        }

        setLocationStatus('Acquiring GPS...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLat(lat);
                setUserLng(lng);
                setLocationStatus('Location acquired!');
                setHasSearched(false);

                // Reverse geocode for display
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                        { headers: { 'User-Agent': 'FastLIFE-BloodDonation/1.0' } }
                    );
                    const data = await response.json();
                    if (data?.display_name) {
                        setLocationAddress(data.display_name);
                    }
                } catch {
                    setLocationAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
            },
            (error) => {
                setLocationStatus('GPS access denied. Try typing an address instead.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    // Geocode typed address
    const handleAddressGeocode = useCallback(async () => {
        if (!addressSearch.trim()) return;

        setLocationStatus('Searching address...');
        const result = await geocodeAddress(addressSearch);

        if (result.success) {
            setUserLat(result.latitude!);
            setUserLng(result.longitude!);
            setLocationAddress(result.displayName || addressSearch);
            setLocationStatus('Location found!');
            setHasSearched(false);
        } else {
            setLocationStatus('Address not found. Try a different query.');
        }
    }, [addressSearch]);

    // Search donors
    const handleSearch = useCallback(async () => {
        if (userLat === null || userLng === null) {
            setLocationStatus('Please set your location first (GPS or address)');
            return;
        }

        setIsSearching(true);
        setHasSearched(false);

        // Simulate realistic search delay for UX
        await new Promise((r) => setTimeout(r, 1800));

        const [donorResult, hospitalResult] = await Promise.all([
            searchDonorsByLocation(userLat, userLng, bloodGroup, radius),
            getNearbyHospitals(userLat, userLng, radius),
        ]);

        setDonors(donorResult.donors || []);
        setHospitals(hospitalResult.hospitals || []);
        setIsSearching(false);
        setHasSearched(true);
        setRequestedDonors(new Set()); // Reset on new search
    }, [userLat, userLng, bloodGroup, radius]);

    // Handle sending blood request
    const handleSendRequest = useCallback((donorId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRequestedDonors(prev => {
            const newSet = new Set(prev);
            newSet.add(donorId);
            return newSet;
        });
        // In a real app, this would call a server action like `createBloodRequest(hospitalId, donorId, ...)`
    }, []);

    const handleSendBulkRequest = useCallback(() => {
        setRequestedDonors(new Set(donors.map(d => d.id)));
    }, [donors]);

    // Auto-search on first GPS acquisition
    useEffect(() => {
        if (userLat !== null && userLng !== null && !hasSearched && !isSearching) {
            handleSearch();
        }
    }, [userLat, userLng]);

    // Build map markers
    const mapMarkers = useMemo(() => {
        const markers: any[] = [];

        if (userLat !== null && userLng !== null) {
            markers.push({
                id: 'user',
                lat: userLat,
                lng: userLng,
                type: 'user',
                label: 'Your Location',
            });
        }

        donors.forEach((d) => {
            if (d.mapLat != null && d.mapLng != null) {
                markers.push({
                    id: d.id,
                    lat: d.mapLat,
                    lng: d.mapLng,
                    type: 'donor',
                    label: d.name,
                    bloodGroup: d.bloodGroup,
                    distance: d.distance,
                    eta: d.eta,
                    verified: d.verified,
                });
            }
        });

        hospitals.forEach((h) => {
            markers.push({
                id: h.id,
                lat: h.latitude,
                lng: h.longitude,
                type: 'hospital',
                label: h.name,
                distance: h.distance,
                eta: h.eta,
            });
        });

        return markers;
    }, [userLat, userLng, donors, hospitals]);

    const mapCenter = useMemo(() => ({
        lat: userLat || 22.48,
        lng: userLng || 87.32,
    }), [userLat, userLng]);

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className="heading-gradient-red">Find Donors Near You</h1>
                <p>Real-time GPS-powered donor discovery — just like finding a ride on Uber.</p>
            </div>

            {/* Search Panel */}
            <div className={styles.searchPanel}>
                <div className={styles.searchRow}>
                    {/* GPS Button */}
                    <div className={styles.searchField}>
                        <label>Your Location</label>
                        <button
                            className={`${styles.locationBtn} ${styles.gpsBtn}`}
                            onClick={handleGetGPS}
                            disabled={locationStatus === 'Acquiring GPS...'}
                        >
                            {locationStatus === 'Location acquired!' || locationStatus === 'Location found!' ? '✅' : '📡'}
                            {locationStatus === 'Acquiring GPS...' ? 'Acquiring...' : 'Use My GPS'}
                        </button>
                    </div>

                    {/* Address Input */}
                    <div className={`${styles.searchField}`} style={{ flex: 2 }}>
                        <label>Or Search by Address</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="e.g. Rampurhat, West Bengal"
                                value={addressSearch}
                                onChange={(e) => setAddressSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddressGeocode()}
                                style={{ flex: 1 }}
                            />
                            <button
                                className={`${styles.locationBtn} ${styles.gpsBtn}`}
                                onClick={handleAddressGeocode}
                                style={{ padding: '0.75rem' }}
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Blood Group */}
                    <div className={styles.searchField}>
                        <label>Blood Group</label>
                        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                            <option value="All">All Types</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                    </div>

                    {/* Radius Slider */}
                    <div className={`${styles.searchField} ${styles.radiusField}`}>
                        <div className={styles.radiusDisplay}>
                            <label>Search Radius</label>
                            <span className={styles.radiusValue}>{radius} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className={styles.radiusSlider}
                        />
                    </div>

                    {/* Search Button */}
                    <div className={styles.searchField}>
                        <label>&nbsp;</label>
                        <button
                            className={`${styles.locationBtn} ${styles.searchBtn}`}
                            onClick={handleSearch}
                            disabled={isSearching || (userLat === null)}
                        >
                            {isSearching ? '⏳ Searching...' : '🔍 Find Donors'}
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                {locationStatus && (
                    <div className={`${styles.statusBar} ${
                        locationStatus.includes('acquired') || locationStatus.includes('found')
                            ? styles.statusSuccess
                            : locationStatus.includes('Acquiring') || locationStatus.includes('Searching')
                                ? styles.statusLoading
                                : locationStatus.includes('denied') || locationStatus.includes('not found') || locationStatus.includes('not supported')
                                    ? styles.statusError
                                    : styles.statusLoading
                    }`}>
                        <span>{
                            locationStatus.includes('acquired') || locationStatus.includes('found') ? '✅' :
                            locationStatus.includes('Acquiring') || locationStatus.includes('Searching') ? '⏳' : '⚠️'
                        }</span>
                        <span>{locationStatus}</span>
                        {locationAddress && (
                            <span style={{ marginLeft: '0.5rem', opacity: 0.8, fontSize: '0.8rem' }}>
                                — {locationAddress.substring(0, 60)}{locationAddress.length > 60 ? '...' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Searching Animation */}
            {isSearching && (
                <div className={styles.searchingOverlay}>
                    <div className={styles.radarContainer}>
                        <div className={styles.radarRing}></div>
                        <div className={styles.radarRing}></div>
                        <div className={styles.radarRing}></div>
                        <div className={styles.radarDot}></div>
                    </div>
                    <h3>Scanning for Donors...</h3>
                    <p>Searching verified donors within {radius} km of your location</p>
                </div>
            )}

            {/* Main Content: Map + Results */}
            {!isSearching && hasSearched && (
                <div className={styles.mainContent}>
                    {/* Map */}
                    <div className={styles.mapSection}>
                        <DonorMap
                            center={mapCenter}
                            markers={mapMarkers}
                            zoom={12}
                            height="550px"
                            onMarkerClick={(marker) => setSelectedDonorId(marker.id)}
                        />
                    </div>

                    {/* Results List */}
                    <div className={styles.resultsSidebar}>
                        <div className={styles.resultsHeader}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3>Nearby Donors</h3>
                                <span className={styles.resultsCount}>
                                    {donors.length} found within {radius} km
                                </span>
                            </div>
                            {donors.length > 0 && (
                                <button 
                                    className="btn-primary" 
                                    onClick={handleSendBulkRequest}
                                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                                    disabled={requestedDonors.size === donors.length}
                                >
                                    {requestedDonors.size === donors.length ? '✅ All Requested' : '🚀 Request All'}
                                </button>
                            )}
                        </div>

                        {donors.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>🩸</div>
                                <h3>No donors found nearby</h3>
                                <p>Try increasing the search radius or changing the blood group filter.</p>
                            </div>
                        ) : (
                            <div className={styles.donorList}>
                                {donors.map((donor) => (
                                    <div
                                        key={donor.id}
                                        className={styles.donorCard}
                                        onClick={() => setSelectedDonorId(donor.id)}
                                        style={{
                                            borderColor: selectedDonorId === donor.id ? 'rgba(225, 29, 72, 0.5)' : undefined,
                                            background: selectedDonorId === donor.id ? 'rgba(225, 29, 72, 0.05)' : undefined,
                                        }}
                                    >
                                        <div className={styles.donorCardTop}>
                                            <div className={styles.donorAvatar}>
                                                {donor.bloodGroup}
                                            </div>
                                            <div className={styles.donorInfo}>
                                                <h4>
                                                    {donor.name}
                                                    {donor.verified && <span className={styles.verifiedTick}>✓</span>}
                                                </h4>
                                                <p>Verified Donor • {donor.direction} of you</p>
                                            </div>
                                            <span className={styles.bloodBadge}>{donor.bloodGroup}</span>
                                        </div>

                                        <div className={styles.donorCardMeta}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span className={styles.distanceBadge}>
                                                    📍 {donor.distance} km
                                                </span>
                                                <span className={styles.etaBadge}>
                                                    🚗 ETA: {donor.eta}
                                                </span>
                                            </div>
                                            <button 
                                                className={`btn-primary ${styles.acceptBtn}`}
                                                onClick={(e) => handleSendRequest(donor.id, e)}
                                                disabled={requestedDonors.has(donor.id)}
                                                style={{
                                                    fontSize: '0.75rem', 
                                                    padding: '0.25rem 0.75rem',
                                                    background: requestedDonors.has(donor.id) ? '#10B981' : undefined,
                                                    borderColor: requestedDonors.has(donor.id) ? '#10B981' : undefined,
                                                }}
                                            >
                                                {requestedDonors.has(donor.id) ? '✅ Sent' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hospitals Section */}
                        {hospitals.length > 0 && (
                            <>
                                <div className={styles.resultsHeader} style={{ marginTop: '1rem' }}>
                                    <h3>🏥 Nearby Hospitals</h3>
                                    <span className={styles.resultsCount}>{hospitals.length} found</span>
                                </div>
                                <div className={styles.donorList} style={{ maxHeight: '250px' }}>
                                    {hospitals.map((hosp) => (
                                        <div key={hosp.id} className={styles.donorCard}>
                                            <div className={styles.donorCardTop}>
                                                <div className={styles.donorAvatar} style={{
                                                    background: 'linear-gradient(135deg, #059669, #10B981)',
                                                    fontSize: '1.1rem',
                                                }}>
                                                    🏥
                                                </div>
                                                <div className={styles.donorInfo}>
                                                    <h4>{hosp.name}</h4>
                                                    <p>Medical Facility</p>
                                                </div>
                                            </div>
                                            <div className={styles.donorCardMeta}>
                                                <span className={styles.distanceBadge}>
                                                    📍 {hosp.distance} km
                                                </span>
                                                <span className={styles.etaBadge}>
                                                    🚗 ETA: {hosp.eta}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Initial State - No search yet */}
            {!isSearching && !hasSearched && (
                <div className={styles.emptyState} style={{ padding: '5rem 2rem' }}>
                    <div className={styles.emptyIcon}>📡</div>
                    <h3>Share your location to find donors</h3>
                    <p>Click &quot;Use My GPS&quot; or enter an address above to discover verified blood donors near you in real-time.</p>
                </div>
            )}
        </div>
    );
}
