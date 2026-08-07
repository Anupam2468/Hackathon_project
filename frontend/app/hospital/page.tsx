'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getHospitalInventory } from '../actions/hospital';

export default function HospitalDashboard() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'needy' | 'donors'>('inventory');
    const [inventory, setInventory] = useState<any[]>([]);

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
        </div>
    );
}
