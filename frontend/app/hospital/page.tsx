'use client';

import { useState } from 'react';
import styles from './page.module.css';

const mockInventory = [
    { type: 'A+', units: 45, status: 'Healthy' },
    { type: 'O-', units: 3, status: 'Critical' },
    { type: 'B+', units: 28, status: 'Good' },
    { type: 'AB+', units: 12, status: 'Low' },
    { type: 'O+', units: 50, status: 'Healthy' },
];

export default function HospitalDashboard() {
    const [searching, setSearching] = useState(false);
    const [matchFound, setMatchFound] = useState(false);

    const handleEmergencySearch = () => {
        setSearching(true);
        // Simulate real-time location matching
        setTimeout(() => {
            setSearching(false);
            setMatchFound(true);
        }, 3000);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="heading-gradient-red">Hospital Command Center</h1>
                    <p>AI Blood Inventory & Emergency Matching System</p>
                </div>
                <button className="btn-primary" onClick={handleEmergencySearch} disabled={searching}>
                    {searching ? 'Finding Donors Nearby...' : 'Initiate Emergency Search'}
                </button>
            </header>

            {searching && (
                <div className={styles.searchOverlay}>
                    <div className={styles.radar}></div>
                    <h3>AI matching finding Top 10 Donors...</h3>
                    <p>Checking universal 'O-' donors and exact matches nearby...</p>
                </div>
            )}

            {matchFound && (
                <div className={styles.matchResult}>
                    <div className={styles.matchHeader}>
                        <h3>🚨 Emergency Donors Found</h3>
                        <button className="btn-secondary" onClick={() => setMatchFound(false)}>Close</button>
                    </div>
                    <div className={styles.donorList}>
                        <div className={styles.donorItem}>
                            <div className={styles.donorInfo}>
                                <h4>John Doe (O-)</h4>
                                <p>2.1 km away • ETA: 8 mins</p>
                            </div>
                            <button className="btn-primary">Ping Donor</button>
                        </div>
                        <div className={styles.donorItem}>
                            <div className={styles.donorInfo}>
                                <h4>Sarah Smith (O-)</h4>
                                <p>3.4 km away • ETA: 12 mins</p>
                            </div>
                            <button className="btn-primary">Ping Donor</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                <div className={styles.inventory}>
                    <h2>Live Blood Inventory</h2>
                    <div className={styles.inventoryGrid}>
                        {mockInventory.map(item => (
                            <div key={item.type} className={`${styles.invCard} ${styles[item.status.toLowerCase()]}`}>
                                <h3>{item.type}</h3>
                                <div className={styles.amount}>
                                    <span className={styles.units}>{item.units}</span> units
                                </div>
                                <div className={styles.status}>{item.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.aiPanel}>
                    <h2>AI Inventory Insights</h2>

                    <div className={styles.insightCard}>
                        <div className={styles.iconWarning}>⚠️</div>
                        <div>
                            <h4>Critical Shortage Predicted</h4>
                            <p>O- stocks are depleting 40% faster than average. Suggestion: Organize a localized blood drive or ping top donors.</p>
                            <button className="btn-secondary" style={{ marginTop: '1rem' }}>Take Action</button>
                        </div>
                    </div>

                    <div className={styles.insightCard}>
                        <div className={styles.iconOk}>✅</div>
                        <div>
                            <h4>A+ Inventory Optimal</h4>
                            <p>No further action required.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
