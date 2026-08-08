'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getHospitalInventory, findEmergencyDonors } from '../actions/hospital';

export default function HospitalDashboard() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'needy' | 'donors' | 'search'>('inventory');
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('A+');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);

    const handleHospitalSearch = async (bloodType: string) => {
        setIsSearching(true);
        setSelectedBloodGroup(bloodType);
        const result = await findEmergencyDonors(bloodType, 37.7749, -122.4194, '1');
        setIsSearching(false);
        setSearchResult(result);
    };

    // Simulated requests for the Blood Needy tab
    const activeRequests = [
        { id: '1', type: 'Patient', name: 'John Smith', bloodGroup: 'O-', urgency: 'Critical', time: '10 mins ago' },
        { id: '2', type: 'Hospital', name: 'Metro Health Care', bloodGroup: 'B+', urgency: 'High', time: '25 mins ago' },
        { id: '3', type: 'Patient', name: 'Emma Davis', bloodGroup: 'A+', urgency: 'Moderate', time: '1 hour ago' },
    ];

    // Simulated donors for the Donor tab
    const availableDonors = [
        { id: '1', name: 'Michael Scott', bloodGroup: 'O-', verified: true, lastDonation: '3 months ago' },
        { id: '2', name: 'Sarah Connor', bloodGroup: 'AB+', verified: true, lastDonation: '6 months ago' },
        { id: '3', name: 'Jim Halpert', bloodGroup: 'A+', verified: false, lastDonation: 'N/A' },
    ];

    useEffect(() => {
        // Load live inventory from DB Action
        getHospitalInventory('1').then(data => setInventory(data));
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="heading-gradient-red">Hospital Command Center</h1>
                    <p>Manage inventory, incoming requests, and donors in real-time.</p>
                </div>
            </header>

            <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <button
                    className={activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('inventory')}
                >
                    1. Blood Inventory Manager
                </button>
                <button
                    className={activeTab === 'needy' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('needy')}
                >
                    2. Blood Needy (Requests)
                </button>
                <button
                    className={activeTab === 'donors' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('donors')}
                >
                    3. Available Donors
                </button>
                <button
                    className={activeTab === 'search' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('search')}
                >
                    🚨 4. 5-Stage Emergency Blood Search
                </button>
            </div>

            {activeTab === 'inventory' && (
                <div className={styles.grid}>
                    <div className={styles.inventory}>
                        <h2>Live Blood Inventory</h2>
                        <div className={styles.inventoryGrid}>
                            {inventory.length > 0 ? inventory.map(item => (
                                <div key={item.id} className={`${styles.invCard} ${styles[item.status.toLowerCase()]}`}>
                                    <h3>{item.bloodGroup}</h3>
                                    <div className={styles.amount}>
                                        <span className={styles.units}>{item.units}</span> units
                                    </div>
                                    <div className={styles.status}>{item.status}</div>
                                </div>
                            )) : <p>Loading Live DB...</p>}
                        </div>
                    </div>

                    <div className={styles.aiPanel}>
                        <h2>AI Inventory Insights</h2>

                        <div className={styles.insightCard}>
                            <div className={styles.iconWarning}>⚠️</div>
                            <div>
                                <h4>Critical Shortage Predicted</h4>
                                <p>O- stocks are depleting 40% faster than average. Suggestion: Ping local verified donors from the Donor tab.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'needy' && (
                <div className={styles.needyPanel} style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-red)' }}>Incoming Blood Requests</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Patients and nearby hospitals requesting emergency blood transfers.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeRequests.map(req => (
                            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                                <div>
                                    <span style={{ fontSize: '0.8rem', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '1rem' }}>{req.type}</span>
                                    <strong style={{ fontSize: '1.2rem', marginRight: '1rem' }}>{req.name}</strong>
                                    <span style={{ color: '#EF4444', fontWeight: 'bold' }}>Needs {req.bloodGroup}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <span style={{ color: req.urgency === 'Critical' ? '#EF4444' : '#F59E0B' }}>{req.urgency}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{req.time}</span>
                                    <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Review Request</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'donors' && (
                <div className={styles.donorsPanel} style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#10B981' }}>Willing Donors Directory</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Verified local donors ready to be dispatched during emergencies.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {availableDonors.map(donor => (
                            <div key={donor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                                <div>
                                    <strong style={{ fontSize: '1.2rem', marginRight: '1rem' }}>{donor.name}</strong>
                                    <span style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '1rem' }}>Blood Group: {donor.bloodGroup}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <span style={{ color: donor.verified ? '#10B981' : '#F59E0B' }}>{donor.verified ? '✓ AI Verified' : '⏳ Pending Proof'}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>Last cycle: {donor.lastDonation}</span>
                                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} disabled={!donor.verified}>Ping Donor</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div className={styles.donorsPanel} style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: '#EF4444' }}>🚨 5-Stage Hospital Emergency Search Engine</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Executes sequential 5-stage fallback: 1. Primary Hospital Stock (Exact) &rarr; 2. Primary Hospital (O-) &rarr; 3. Nearby Hospitals Stock &rarr; 4. Donors (5km) &rarr; 5. Automated Emergency WhatsApp Broadcast
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'bold' }}>Select Required Blood Group:</span>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <button
                                key={bg}
                                className={selectedBloodGroup === bg ? 'btn-primary' : 'btn-secondary'}
                                style={{ padding: '0.5rem 1.2rem' }}
                                onClick={() => handleHospitalSearch(bg)}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>

                    {isSearching && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                            <div className={styles.radar} style={{ margin: '0 auto 1rem auto' }}></div>
                            <h3>Executing 5-Stage Sequential Emergency Scan for {selectedBloodGroup}...</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Checking Hospital Inventories & Distance Radius...</p>
                        </div>
                    )}

                    {!isSearching && searchResult && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                marginBottom: '1rem',
                                background: searchResult.stage === 5 ? '#25D366' : '#10B981',
                                color: '#000'
                            }}>
                                {searchResult.stageTitle}
                            </div>

                            <h3 style={{ fontSize: '1.4rem', color: searchResult.stage === 5 ? '#25D366' : '#10B981', marginBottom: '0.5rem' }}>
                                {searchResult.matchType}
                            </h3>
                            <p style={{ color: '#E2E8F0', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{searchResult.message}</p>

                            {/* Stages 1, 2, 3: Hospital Inventory Match */}
                            {searchResult.stage >= 1 && searchResult.stage <= 3 && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                                    <p style={{ margin: '0.3rem 0' }}>📍 <strong>Matched Hospital:</strong> {searchResult.hospitalName}</p>
                                    <p style={{ margin: '0.3rem 0' }}>🩸 <strong>Blood Type:</strong> <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{searchResult.bloodGroup}</span></p>
                                    <p style={{ margin: '0.3rem 0' }}>📦 <strong>Units Available:</strong> {searchResult.unitsAvailable} Units</p>
                                    {searchResult.distanceKm && <p style={{ margin: '0.3rem 0' }}>🚗 <strong>Distance:</strong> {searchResult.distanceKm.toFixed(1)} km away</p>}
                                </div>
                            )}

                            {/* Stage 4: Donor Match within 5km */}
                            {searchResult.stage === 4 && searchResult.donors && searchResult.donors.length > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                                    <h4 style={{ color: '#F59E0B', marginBottom: '0.8rem' }}>Matched Nearby Individual Donors (Within 5 km):</h4>
                                    {searchResult.donors.map((d: any) => (
                                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span>👤 <strong>{d.name}</strong> ({d.bloodGroup})</span>
                                            <span>📍 {d.distanceKm.toFixed(1)} km away | Contact: {d.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stage 5: WhatsApp Emergency Broadcast Dispatched */}
                            {searchResult.stage === 5 && (
                                <div style={{ background: 'rgba(37,211,102,0.1)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #25D366' }}>
                                    <h4 style={{ color: '#25D366', marginBottom: '0.8rem' }}>📲 Emergency WhatsApp Broadcast Logs:</h4>
                                    {searchResult.alertedDonors && searchResult.alertedDonors.map((d: any) => (
                                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span>👤 <strong>{d.name}</strong> ({d.bloodGroup})</span>
                                            <span style={{ color: '#25D366', fontWeight: 'bold' }}>✓ WhatsApp Alert Sent ({d.whatsapp})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
