'use client';

import { useState } from 'react';
import styles from './page.module.css';
import ChatBox from '../components/ChatBox';
import { findEmergencyDonors } from '../actions/hospital';

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

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => setStep(2), 1000);
    };

    const handleSearchDonors = async () => {
        setSearchingDonors(true);
        // Call Backend AI Database Matcher server action
        const result = await findEmergencyDonors(formData.bloodGroup, 37.77, -122.41);

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

                        <button type="submit" className="btn-primary">Allow Location & Find Blood</button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className={styles.dashboard}>
                    <header className={styles.header}>
                        <h2>Nearby Hospitals for {formData.bloodGroup}</h2>
                        <p>GPS Location Acquired. Live inventory check...</p>
                    </header>

                    <div className={styles.hospitalList}>
                        {nearbyHospitals.map(hosp => (
                            <div key={hosp.id} className={styles.hospitalCard}>
                                <div className={styles.hospInfo}>
                                    <h3>{hosp.name}</h3>
                                    <p>📍 {hosp.distance} away</p>
                                </div>
                                <div className={styles.hospStatus}>
                                    {hosp.hasStock ? (
                                        <span className={styles.stockAvailable}>✅ Units Available</span>
                                    ) : (
                                        <span className={styles.outOfStock}>❌ Out of Stock</span>
                                    )}
                                    {hosp.hasStock && <button className="btn-secondary">Request Transfer</button>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.emergencySection}>
                        <h3>🏥 Is this an Emergency?</h3>
                        <p>If hospitals don't have the blood type, we can ping real-time verified donors around you, like calling an Uber.</p>
                        {!searchingDonors && !donorFound && (
                            <button className="btn-primary" onClick={handleSearchDonors}>
                                Find Verified Donors Nearby
                            </button>
                        )}

                        {searchingDonors && (
                            <div className={styles.trackingOverlay}>
                                <div className={styles.radar}></div>
                                <h3>Executing 5-Stage Hospital Emergency Search...</h3>
                                <p>Scanning: 1. Primary Stock → 2. Primary O- → 3. Nearby Hospitals → 4. 5km Donors → 5. WhatsApp Broadcast</p>
                            </div>
                        )}

                        {donorFound && searchResult && (
                            <div style={{ marginTop: '1.5rem' }}>
                                {/* Stage Badge */}
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem',
                                    background: searchResult.stage === 5 ? '#25D366' : '#10B981',
                                    color: '#000'
                                }}>
                                    {searchResult.stageTitle || 'Emergency Search Result'}
                                </div>

                                {/* Stages 1, 2, 3: Hospital Inventory Match */}
                                {searchResult.stage >= 1 && searchResult.stage <= 3 && (
                                    <div className={styles.donorMatch} style={{ border: '2px solid #10B981', background: 'rgba(16, 185, 129, 0.08)' }}>
                                        <h3 style={{ color: '#10B981' }}>🏥 {searchResult.matchType}</h3>
                                        <p style={{ color: '#E2E8F0', fontSize: '1.1rem', marginTop: '0.5rem' }}>{searchResult.message}</p>
                                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'left' }}>
                                            <p>📍 <strong>Hospital:</strong> {searchResult.hospitalName}</p>
                                            <p>🩸 <strong>Blood Type:</strong> <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{searchResult.bloodGroup}</span></p>
                                            <p>📦 <strong>Stock Available:</strong> {searchResult.unitsAvailable} Units</p>
                                            {searchResult.distanceKm && <p>🚗 <strong>Distance:</strong> {searchResult.distanceKm.toFixed(1)} km away</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Stage 4: Nearby Donor Match within 5km */}
                                {searchResult.stage === 4 && matchedDonors.length > 0 && (
                                    <div className={styles.donorMatch}>
                                        <h3>🤝 Donor is on their way!</h3>
                                        <p style={{ color: '#E2E8F0', marginBottom: '1rem' }}>{searchResult.message}</p>
                                        <div className={styles.donorProfile}>
                                            <div className={styles.avatar}></div>
                                            <div>
                                                <h4>{matchedDonors[0].name} ({matchedDonors[0].bloodGroup})</h4>
                                                <p style={{ color: matchedDonors[0].isUniversalFallback ? '#F59E0B' : '#10B981', fontWeight: 'bold' }}>
                                                    {matchedDonors[0].matchType} (📍 {matchedDonors[0].distanceKm.toFixed(1)} km away) ✓
                                                </p>
                                            </div>
                                        </div>
                                        <p><strong>ETA:</strong> {(matchedDonors[0].distanceKm * 2).toFixed(0)} Minutes to Hospital</p>
                                        <div className={styles.actions}>
                                            <button className="btn-secondary" onClick={() => setChatOpen(true)}>Open Chatbox</button>
                                        </div>
                                    </div>
                                )}

                                {/* Stage 5: Automated Emergency WhatsApp Broadcast */}
                                {searchResult.stage === 5 && (
                                    <div className={styles.donorMatch} style={{ border: '2px solid #25D366', background: 'rgba(37, 211, 102, 0.08)' }}>
                                        <h3 style={{ color: '#25D366' }}>📲 Automated WhatsApp Broadcast Dispatched!</h3>
                                        <p style={{ color: '#E2E8F0', marginTop: '0.5rem', fontSize: '1.05rem' }}>{searchResult.message}</p>

                                        {searchResult.alertedDonors && searchResult.alertedDonors.length > 0 && (
                                            <div style={{ marginTop: '1.2rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                                <h4 style={{ color: '#25D366', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Active Donors Notified via WhatsApp:</h4>
                                                {searchResult.alertedDonors.map((d: any) => (
                                                    <div key={d.id} style={{ fontSize: '0.9rem', color: '#E2E8F0', display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                        <span>👤 <strong>{d.name}</strong> ({d.bloodGroup})</span>
                                                        <span style={{ color: '#25D366', fontWeight: 'bold' }}>✓ Message Sent ({d.whatsapp})</span>
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
                </div>
            )}
        </div>
    );
}
