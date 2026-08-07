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

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => setStep(2), 1000);
    };

    const handleSearchDonors = async () => {
        setSearchingDonors(true);
        // Call Backend AI Database Matcher server action
        const donors = await findEmergencyDonors(formData.bloodGroup, 37.77, -122.41);

        setSearchingDonors(false);
        setMatchedDonors(donors);
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
                                <h3>Sending requests to Top 10 Database Donors...</h3>
                                <p>AI is matching {formData.bloodGroup} & O- profiles...</p>
                            </div>
                        )}

                        {donorFound && matchedDonors.length > 0 && (
                            <div className={styles.donorMatch}>
                                <div className={styles.matchBadge}>Match Found!</div>
                                <h3>Donor is on their way!</h3>
                                <div className={styles.donorProfile}>
                                    <div className={styles.avatar}></div>
                                    <div>
                                        <h4>{matchedDonors[0].name} ({matchedDonors[0].bloodGroup})</h4>
                                        <p>Verified Database Match ✓</p>
                                    </div>
                                </div>
                                <p><strong>ETA:</strong> {(matchedDonors[0].distanceKm * 2).toFixed(0)} Minutes to Hospital</p>
                                <div className={styles.actions}>
                                    <button className="btn-secondary" onClick={() => setChatOpen(true)}>Open Chatbox</button>
                                </div>
                            </div>
                        )}

                        {donorFound && matchedDonors.length === 0 && (
                            <div className={styles.donorMatch}>
                                <h3>No verified database match found!</h3>
                                <p>Please wait for another match or contact hospital immediately.</p>
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
