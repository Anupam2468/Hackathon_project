'use client';

import { useState, useCallback } from 'react';
import styles from './page.module.css';
import ChatBox from '../components/ChatBox';
import { findEmergencyDonors } from '../actions/hospital';
import ScrollReveal from '../components/ScrollReveal';

type OutreachWave = { wave: number; donorCount: number; radiusKm: number; action: string };

const nearbyHospitals = [
    { id: 1, name: 'City Central Hospital', distance: '1.2 km', hasStock: false },
    { id: 2, name: 'Metro Health Care', distance: '3.5 km', hasStock: true },
    { id: 3, name: 'LifeLine General', distance: '5.1 km', hasStock: false },
];

export default function RecipientDashboard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', bloodGroup: 'B+', phone: '' });
    const [searchingDonors, setSearchingDonors] = useState(false);
    const [donorFound, setDonorFound] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [matchedDonors, setMatchedDonors] = useState<any[]>([]);
    const [searchResult, setSearchResult] = useState<any>(null);
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLng, setUserLng] = useState<number | null>(null);
    const [locationStatus, setLocationStatus] = useState('');
    const [requestedHospitals, setRequestedHospitals] = useState<number[]>([]);

    const handleRequestTransfer = (hospitalId: number) => {
        if (!requestedHospitals.includes(hospitalId)) {
            setRequestedHospitals(prev => [...prev, hospitalId]);
        }
    };

    const handleRegister = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        // Acquire real GPS location
        if (navigator.geolocation) {
            setLocationStatus('Acquiring GPS location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLat(position.coords.latitude);
                    setUserLng(position.coords.longitude);
                    setLocationStatus('Location acquired!');
                    setStep(2);
                },
                () => {
                    // GPS denied — use fallback coordinates
                    setUserLat(22.4839);
                    setUserLng(87.3245);
                    setLocationStatus('GPS denied, using approximate location');
                    setStep(2);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setUserLat(22.4839);
            setUserLng(87.3245);
            setLocationStatus('GPS not available, using approximate location');
            setStep(2);
        }
    }, []);

    const handleSearchDonors = async () => {
        setSearchingDonors(true);
        // Use real GPS coordinates acquired during registration
        const lat = userLat || 22.4839;
        const lng = userLng || 87.3245;
        const result = await findEmergencyDonors(formData.bloodGroup, lat, lng);

        setSearchingDonors(false);
        setSearchResult(result);
        setMatchedDonors(result.donors || []);
        setDonorFound(true);
    };

    return (
        <div className={styles.container}>
            {step === 1 && (
                <div className={styles.onboarding}>
                    <h1 className="heading-gradient">Recipient Registration</h1>
                    <p>We need a few details to find {formData.bloodGroup || 'blood'} for you instantly.</p>

                    <form onSubmit={handleRegister} className={styles.form}>
                        <input
                            required placeholder="Patient Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <select
                            value={formData.bloodGroup}
                            onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                        >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                        <input required type="tel" placeholder="Phone Number" />

                        <button type="submit" className="btn-primary" disabled={locationStatus === 'Acquiring GPS location...'}>
                            {locationStatus === 'Acquiring GPS location...' ? '📡 Acquiring GPS...' : '📍 Allow Location & Find Blood'}
                        </button>
                        {locationStatus && (
                            <p style={{ fontSize: '0.85rem', color: locationStatus.includes('acquired') ? '#10B981' : locationStatus.includes('denied') ? '#F59E0B' : '#3B82F6', textAlign: 'center', marginTop: '0.5rem' }}>
                                {locationStatus}
                            </p>
                        )}
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className={styles.dashboard}>
                    <header className={styles.header}>
                        <h2>Nearby Hospitals for {formData.bloodGroup}</h2>
                        <p>Location received. Stock is shown as an operational signal and must be confirmed by the blood bank.</p>
                    </header>

                    {requestedHospitals.length > 0 && (
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid #10B981',
                            borderRadius: '8px',
                            padding: '0.85rem 1.2rem',
                            marginBottom: '1.25rem',
                            color: '#10B981',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>✅</span> Transfer request submitted. The hospital will confirm availability and any reservation after clinical review.
                        </div>
                    )}

                    <div className={styles.hospitalList}>
                        {nearbyHospitals.map((hosp, index) => (
                            <ScrollReveal key={hosp.id} direction="up" delay={index * 100}>
                                <div className={styles.hospitalCard}>
                                    <div className={styles.hospInfo}>
                                        <h3>{hosp.name}</h3>
                                        <p>📍 {hosp.distance} away</p>
                                    </div>
                                    <div className={styles.hospStatus}>
                                        {hosp.hasStock ? (
                                            <span className={styles.stockAvailable}>✅ Stock reported — confirmation required</span>
                                        ) : (
                                            <span className={styles.outOfStock}>❌ Out of Stock</span>
                                        )}
                                        {hosp.hasStock && (
                                            <button
                                                className={requestedHospitals.includes(hosp.id) ? "btn-primary" : "btn-secondary"}
                                                onClick={() => handleRequestTransfer(hosp.id)}
                                                disabled={requestedHospitals.includes(hosp.id)}
                                                style={requestedHospitals.includes(hosp.id) ? {
                                                    backgroundColor: '#10B981',
                                                    borderColor: '#10B981',
                                                    color: '#ffffff',
                                                    cursor: 'default'
                                                } : undefined}
                                            >
                                                {requestedHospitals.includes(hosp.id) ? '✓ Confirmation requested' : 'Request confirmation'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    <ScrollReveal direction="up" delay={300}>
                        <section className={styles.emergencySection}>
                            <h3>Your emergency timeline</h3>
                            <p>We show only meaningful milestones—never a promise that blood has been issued before the blood bank confirms it.</p>
                            <div className={styles.timeline}>
                                <div className={styles.timelineConnector}></div>
                                {['Request created', 'Stock confirmed', 'Donor / transfer selected', 'Screened & issued'].map((item, index) => (
                                    <div key={item} className={`${styles.timelineStep} ${index === 0 ? styles.timelineStepActive : ''}`}>
                                        <strong>{index + 1}</strong>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={400}>
                        <div className={styles.emergencySection} style={{ marginTop: '2rem' }}>
                            <h3>🏥 Is this an Emergency?</h3>
                            <p>If stock cannot be confirmed, the hospital can coordinate verified, preliminarily eligible donors. Collection, screening, and issue remain hospital-led.</p>
                            {!searchingDonors && !donorFound && (
                                <button className={styles.emergencyBtn} onClick={handleSearchDonors}>
                                    Find Verified Donors Nearby
                                </button>
                            )}

                            {searchingDonors && (
                                <div className={styles.trackingOverlay}>
                                    <div className={styles.radar}></div>
                                    <h3>Checking the emergency coordination route…</h3>
                                    <p>Checking exact hospital stock → clinician-reviewed fallback → nearby exact stock → verified exact-match donors → staff escalation queue</p>
                                </div>
                            )}

                            {donorFound && searchResult && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    {/* Stage Badge */}
                                    <div className={styles.matchBadge} style={searchResult.stage === 5 ? { background: '#25D366' } : undefined}>
                                        {searchResult.stageTitle || 'Emergency Search Result'}
                                    </div>

                                    {searchResult.confidence && (
                                        <div className={styles.confidenceScore}>
                                            <strong>Emergency Confidence: {searchResult.confidence.score}/100 — {searchResult.confidence.label}</strong>
                                            <p>{searchResult.confidence.factors.join(' • ')}</p>
                                        </div>
                                    )}

                                    {/* Stages 1, 2, 3: Hospital Inventory Match */}
                                    {searchResult.stage >= 1 && searchResult.stage <= 3 && (
                                        <div className={styles.donorMatch} style={{ border: '2px solid #10B981', background: 'rgba(16, 185, 129, 0.08)' }}>
                                            <h3 style={{ color: '#10B981' }}>🏥 {searchResult.matchType}</h3>
                                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>{searchResult.message}</p>
                                            <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'left' }}>
                                                <p>📍 <strong>Hospital:</strong> {searchResult.hospitalName}</p>
                                                <p>🩸 <strong>Blood Type:</strong> <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{searchResult.bloodGroup}</span></p>
                                                <p>📦 <strong>Stock Available:</strong> {searchResult.unitsAvailable} Units</p>
                                                {searchResult.distanceKm && <p>🚗 <strong>Distance:</strong> {searchResult.distanceKm.toFixed(1)} km away</p>}
                                            </div>
                                        </div>
                                    )}

                                    {searchResult.clinicalReviewRequired && (
                                        <div className={`${styles.donorMatch} ${styles.clinicalReview}`}>
                                            <h3>Clinical decision required</h3>
                                            <p>The blood bank and treating team must decide whether this route is appropriate. No unit has been reserved or issued.</p>
                                        </div>
                                    )}

                                    {searchResult.outreachPlan && (
                                        <div className={`${styles.donorMatch} ${styles.outreachPlan}`}>
                                            <h3>How the donor outreach will work</h3>
                                            {searchResult.outreachPlan.map((wave: OutreachWave) => (
                                                <p key={wave.wave}><strong>Wave {wave.wave}:</strong> the hospital contacts up to {wave.donorCount} nearby potential donors, then expands only if needed.</p>
                                            ))}
                                        </div>
                                    )}

                                    {searchResult.rareGroupEscalation?.enabled && (
                                        <div className={`${styles.donorMatch} ${styles.rareGroupAlert}`}>
                                            <h3>Rare blood-group escalation</h3>
                                            <p>{searchResult.rareGroupEscalation.message}</p>
                                        </div>
                                    )}

                                    {/* Stage 4: Potential exact-match donors, not a confirmed donation */}
                                    {searchResult.stage === 4 && matchedDonors.length > 0 && (
                                        <div className={styles.donorMatch}>
                                            <h3>🤝 Potential donor response available</h3>
                                            <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{searchResult.message}</p>
                                            <div className={styles.donorProfile}>
                                                <div className={styles.avatar}></div>
                                                <div>
                                                    <h4>{matchedDonors[0].name} ({matchedDonors[0].bloodGroup})</h4>
                                                    <p style={{ color: matchedDonors[0].isUniversalFallback ? '#F59E0B' : '#10B981', fontWeight: 'bold' }}>
                                                        {matchedDonors[0].matchType} (📍 {matchedDonors[0].distanceKm.toFixed(1)} km away) ✓
                                                    </p>
                                                </div>
                                            </div>
                                            <p><strong>Estimated arrival if selected:</strong> {(matchedDonors[0].distanceKm * 2).toFixed(0)} minutes</p>
                                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>The hospital must confirm the donor and complete screening before any donation can proceed.</p>
                                            <div className={styles.actions}>
                                                <button className="btn-secondary" onClick={() => setChatOpen(true)}>Open Chatbox</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stage 5: Staff-reviewed escalation queue */}
                                    {searchResult.stage === 5 && (
                                        <div className={styles.donorMatch} style={{ border: '2px solid #25D366', background: 'rgba(37, 211, 102, 0.08)' }}>
                                            <h3 style={{ color: '#25D366' }}>📲 Hospital escalation queue created</h3>
                                            <p style={{ color: 'var(--text-primary)', marginTop: '0.5rem', fontSize: '1.05rem' }}>{searchResult.message}</p>

                                            {searchResult.alertedDonors && searchResult.alertedDonors.length > 0 && (
                                                <div style={{ marginTop: '1.2rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                                    <h4 style={{ color: '#25D366', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Eligible donors available for staff-approved outreach:</h4>
                                                    {searchResult.alertedDonors.map((d: any) => (
                                                        <div key={d.id} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                            <span>👤 <strong>{d.name}</strong> ({d.bloodGroup})</span>
                                                            <span style={{ color: '#25D366', fontWeight: 'bold' }}>Queued for staff review</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {chatOpen && matchedDonors.length > 0 && (
                                <ChatBox onClose={() => setChatOpen(false)} partnerName={matchedDonors[0].name} />
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            )}
        </div>
    );
}
