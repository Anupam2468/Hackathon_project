'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getHospitalInventory, findEmergencyDonors, updateHospitalInventory } from '../actions/hospital';

type OutreachWave = { wave: number; donorCount: number; radiusKm: number; action: string };

const tabs = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'needy', label: 'Requests' },
    { id: 'donors', label: 'Donors' },
    { id: 'search', label: '🚨 Emergency' }
] as const;

type TabId = typeof tabs[number]['id'];

export default function HospitalDashboard() {
    // Login State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hospitalIdInput, setHospitalIdInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('inventory');
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('A+');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);

    // Review & Ping feature states
    const [reviewModalReq, setReviewModalReq] = useState<any | null>(null);
    const [requestStatuses, setRequestStatuses] = useState<{ [key: string]: 'approved' | 'rejected' }>({});
    const [pingedDonors, setPingedDonors] = useState<string[]>([]);
    const [pingToast, setPingToast] = useState<string | null>(null);

    const handleHospitalSearch = async (bloodType: string) => {
        setIsSearching(true);
        setSelectedBloodGroup(bloodType);
        const result = await findEmergencyDonors(bloodType, 37.7749, -122.4194, '1');
        setIsSearching(false);
        setSearchResult(result);
    };

    const handleApproveRequest = (reqId: string) => {
        setRequestStatuses(prev => ({ ...prev, [reqId]: 'approved' }));
        setReviewModalReq(null);
    };

    const handleRejectRequest = (reqId: string) => {
        setRequestStatuses(prev => ({ ...prev, [reqId]: 'rejected' }));
        setReviewModalReq(null);
    };

    const handlePingDonor = (donor: any) => {
        if (!pingedDonors.includes(donor.id)) {
            setPingedDonors(prev => [...prev, donor.id]);
            setPingToast(`Outreach for ${donor.name} (${donor.bloodGroup}) is queued for hospital staff review.`);
            setTimeout(() => setPingToast(null), 5000);
        }
    };

    // Simulated requests for the Blood Needy tab
    const activeRequests = [
        { id: '1', type: 'Patient', name: 'John Smith', bloodGroup: 'O-', urgency: 'Critical', time: '10 mins ago' },
        { id: '2', type: 'Hospital', name: 'Metro Health Care', bloodGroup: 'B+', urgency: 'High', time: '25 mins ago' },
        { id: '3', type: 'Patient', name: 'Emma Davis', bloodGroup: 'A+', urgency: 'Moderate', time: '1 hour ago' },
    ];

    // Simulated donors for the Donor tab
    const availableDonors = [
        { id: '1', name: 'Michael S.', bloodGroup: 'O-', verified: true, lastDonation: '3 months ago' },
        { id: '2', name: 'Sarah C.', bloodGroup: 'AB+', verified: true, lastDonation: '6 months ago' },
        { id: '3', name: 'Jim H.', bloodGroup: 'A+', verified: false, lastDonation: 'N/A' },
    ];

    useEffect(() => {
        if (isLoggedIn) {
            // Load live inventory from DB Action
            getHospitalInventory('1').then(data => setInventory(data));
        }
    }, [isLoggedIn]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Dummy authentication check
        if (hospitalIdInput.toLowerCase() === 'h1' || hospitalIdInput.toLowerCase() === 'admin') {
            setIsLoggedIn(true);
        } else {
            setLoginError('Invalid Hospital ID or Password. Try "h1"');
        }
    };

    const handleInventoryChange = (id: string, newUnits: string) => {
        const units = parseInt(newUnits) || 0;
        setInventory(prev => prev.map(item => item.id === id ? { ...item, units } : item));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            for (const item of inventory) {
                await updateHospitalInventory(item.id, item.units);
            }
        } finally {
            setIsSaving(false);
            getHospitalInventory('1').then(data => setInventory(data));
        }
    };

    if (!isLoggedIn) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h1 className="heading-gradient-red" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Hospital Login</h1>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Access your blood bank command center</p>
                    
                    {loginError && <div className={styles.errorAlert}>{loginError}</div>}
                    
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className={styles.formGroup}>
                            <label>Hospital ID / Username</label>
                            <input 
                                type="text" 
                                required 
                                value={hospitalIdInput} 
                                onChange={e => setHospitalIdInput(e.target.value)} 
                                placeholder="e.g. h1"
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input 
                                type="password" 
                                required 
                                value={passwordInput} 
                                onChange={e => setPasswordInput(e.target.value)} 
                                placeholder="••••••••"
                                className={styles.inputField}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Sign In</button>
                    </form>
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Demo Credentials:</p>
                        <p>ID: <span style={{ color: 'white' }}>h1</span> | Password: <span style={{ color: 'white' }}>any</span></p>
                    </div>
                </div>
            </div>
        );
    }

    const activeTabIndex = tabs.findIndex(t => t.id === activeTab);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="heading-gradient-red">Hospital Command Center</h1>
                    <p>Coordinate inventory, requests, and donor outreach. Clinical teams remain responsible for screening, compatibility, and release.</p>
                </div>
            </header>

            <div className={styles.tabRow}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? styles.activeTab : ''}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
                <div 
                    className={styles.tabIndicator} 
                    style={{ 
                        width: `${100 / tabs.length}%`, 
                        transform: `translateX(${activeTabIndex * 100}%)` 
                    }} 
                />
            </div>

            {activeTab === 'inventory' && (
                <div className={styles.grid}>
                    <div className={styles.inventory}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Blood inventory signal</h2>
                                <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Verify tested, releasable stock and reservation status before committing a unit.</p>
                            </div>
                            <button className="btn-primary" onClick={handleSaveChanges} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        <div className={styles.inventoryGrid}>
                            {inventory.length > 0 ? inventory.map(item => (
                                <div key={item.id} className={`${styles.invCard} ${styles[item.status.toLowerCase()]}`}>
                                    <h3>{item.bloodGroup}</h3>
                                    <div className={styles.amount}>
                                        <input 
                                            type="number" 
                                            value={item.units} 
                                            onChange={(e) => handleInventoryChange(item.id, e.target.value)}
                                            className={styles.inventoryInput}
                                            min="0"
                                        />
                                        <span className={styles.unitsLabel}>units</span>
                                    </div>
                                    <div className={styles.status}>{item.status}</div>
                                </div>
                            )) : <p>Loading Live DB...</p>}
                        </div>
                    </div>

                    <div className={styles.aiPanel}>
                        <h2>Operational insights</h2>

                        <div className={styles.insightCard}>
                            <div className={styles.iconWarning}>⚠️</div>
                            <div>
                                <h4>Review O- stock threshold</h4>
                                <p>O- is below the local threshold in this demo. Consider preparing exact-match donor outreach; any fallback route needs blood-bank and clinician approval.</p>
                            </div>
                        </div>
                        <div className={styles.insightCard} style={{ marginTop: '1rem' }}>
                            <div className={styles.iconWarning}>⏱️</div>
                            <div>
                                <h4>Response standard</h4>
                                <p>Demo target: acknowledge emergency requests within 5 minutes and refresh inventory status before commitment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pingToast && (
                <div className={styles.toast}>
                    {pingToast}
                </div>
            )}

            {activeTab === 'needy' && (
                <div className={styles.panelCard}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-red)' }}>Incoming Blood Requests</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Patients and nearby hospitals requesting emergency blood transfers.</p>

                    <div className={styles.cardList}>
                        {activeRequests.map(req => {
                            const status = requestStatuses[req.id];
                            return (
                                <div key={req.id} className={styles.cardItem}>
                                    <div className={styles.cardItemInfo}>
                                        <span className={styles.typeBadge}>{req.type}</span>
                                        <strong>{req.name}</strong>
                                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>Needs {req.bloodGroup}</span>
                                    </div>
                                    <div className={styles.cardItemActions}>
                                        <span style={{ color: req.urgency === 'Critical' ? '#EF4444' : '#F59E0B' }}>{req.urgency}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{req.time}</span>
                                        
                                        {status === 'approved' ? (
                                            <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(16,185,129,0.1)', borderRadius: '6px' }}>
                                                ✓ Reserved
                                            </span>
                                        ) : status === 'rejected' ? (
                                            <span style={{ color: '#64748B', fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(100,116,139,0.1)', borderRadius: '6px' }}>
                                                Declined
                                            </span>
                                        ) : (
                                            <button
                                                className="btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                onClick={() => setReviewModalReq(req)}
                                            >
                                                Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Review Modal Dialog */}
            {reviewModalReq && (
                <div className={styles.reviewOverlay}>
                    <div className={styles.reviewModal}>
                        <div className={styles.reviewHeader}>
                            <h3>Review Request details</h3>
                            <button onClick={() => setReviewModalReq(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        <div className={styles.reviewDetails}>
                            <p>👤 <strong>Requester:</strong> {reviewModalReq.name} ({reviewModalReq.type})</p>
                            <p>🩸 <strong>Blood Required:</strong> <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{reviewModalReq.bloodGroup}</span> (2 Units)</p>
                            <p>⚠️ <strong>Urgency Level:</strong> <span style={{ color: reviewModalReq.urgency === 'Critical' ? '#EF4444' : '#F59E0B', fontWeight: 'bold' }}>{reviewModalReq.urgency}</span></p>
                            <p>⏱️ <strong>Timestamp:</strong> {reviewModalReq.time}</p>
                            <p>📍 <strong>Distance:</strong> 1.8 km from hospital</p>
                        </div>

                        <div className={styles.reviewActions}>
                            <button
                                className="btn-secondary"
                                style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                                onClick={() => handleRejectRequest(reviewModalReq.id)}
                            >
                                Decline Request
                            </button>
                            <button
                                className="btn-primary"
                                style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', backgroundColor: '#10B981', borderColor: '#10B981' }}
                                onClick={() => handleApproveRequest(reviewModalReq.id)}
                            >
                                Approve & Reserve Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'donors' && (
                <div className={styles.panelCard}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#10B981' }}>Willing Donors Directory</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Potential donors are privacy-masked until they accept and the hospital selects them. Verification is preliminary; on-site screening is still required.</p>

                    <div className={styles.cardList}>
                        {availableDonors.map(donor => {
                            const isPinged = pingedDonors.includes(donor.id);
                            return (
                                <div key={donor.id} className={styles.cardItem}>
                                    <div className={styles.cardItemInfo}>
                                        <strong>{donor.name}</strong>
                                        <span className={styles.typeBadge}>{donor.bloodGroup}</span>
                                    </div>
                                    <div className={styles.cardItemActions}>
                                        <span style={{ color: donor.verified ? '#10B981' : '#F59E0B', fontSize: '0.85rem' }}>{donor.verified ? '✓ Identity & record reviewed' : '⏳ Review pending'}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Last: {donor.lastDonation}</span>
                                        <button
                                            className={isPinged ? "btn-primary" : "btn-secondary"}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.85rem',
                                                backgroundColor: isPinged ? '#10B981' : undefined,
                                                borderColor: isPinged ? '#10B981' : undefined,
                                                color: isPinged ? '#ffffff' : undefined
                                            }}
                                            disabled={!donor.verified || isPinged}
                                            onClick={() => handlePingDonor(donor)}
                                        >
                                            {isPinged ? '✓ Outreach queued' : 'Queue outreach'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div className={styles.panelCard}>
                    <h2 style={{ marginBottom: '0.5rem', color: '#EF4444' }}>🚨 Emergency coordination route</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Checks exact primary stock, flags any potential O- route for clinical review, searches nearby exact stock, finds nearby verified exact-match donors, then creates a staff-reviewed escalation queue.
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
                        <div className={styles.searchProgress}>
                            <div className={styles.radar} style={{ margin: '0 auto 1rem auto' }}></div>
                            <h3>Checking safe coordination routes for {selectedBloodGroup}...</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Checking exact inventory, clinical review needs, partner hospitals, and verified donors…</p>
                        </div>
                    )}

                    {!isSearching && searchResult && (
                        <div className={styles.searchResultBox}>
                            <div className={`${styles.stageBadge} ${searchResult.stage === 5 ? styles.stageBadgeGreen : styles.stageBadgeTeal}`}>
                                {searchResult.stageTitle}
                            </div>

                            <h3 className={styles.matchTitle} style={{ color: searchResult.stage === 5 ? '#25D366' : '#10B981' }}>
                                {searchResult.matchType}
                            </h3>
                            <p className={styles.matchDesc}>{searchResult.message}</p>

                            {searchResult.confidence && (
                                <div className={styles.confidenceBox}>
                                    <div className={`${styles.scoreCircle} ${searchResult.confidence.score >= 75 ? styles.scoreHigh : searchResult.confidence.score >= 45 ? styles.scoreMedium : styles.scoreLow}`}>
                                        {searchResult.confidence.score}
                                    </div>
                                    <div>
                                        <strong>Emergency Confidence: {searchResult.confidence.label}</strong>
                                        <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{searchResult.confidence.factors.join(' • ')}</p>
                                    </div>
                                </div>
                            )}

                            {searchResult.outreachPlan && (
                                <div className={styles.outreachPlan}>
                                    <h4 style={{ color: '#10B981', marginBottom: '0.75rem' }}>Progressive outreach plan</h4>
                                    {searchResult.outreachPlan.map((wave: OutreachWave) => (
                                        <p key={wave.wave} style={{ margin: '0.45rem 0', fontSize: '0.9rem' }}><strong>Wave {wave.wave}:</strong> {wave.donorCount} donor{wave.donorCount === 1 ? '' : 's'} within {wave.radiusKm} km — {wave.action}</p>
                                    ))}
                                </div>
                            )}

                            {searchResult.rareGroupEscalation?.enabled && (
                                <div className={styles.rareGroupEscalation}>
                                    <strong style={{ color: '#C4B5FD' }}>Rare blood-group route</strong>
                                    <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)' }}>{searchResult.rareGroupEscalation.message}</p>
                                </div>
                            )}

                            {searchResult.clinicalReviewRequired && (
                                <div className={styles.clinicalReview}>
                                    <strong style={{ color: '#F59E0B' }}>Clinical decision required.</strong> The platform is only surfacing a possibility; clinician-approved protocols, testing, and release are required before use.
                                </div>
                            )}

                            {/* Stages 1, 2, 3: Hospital Inventory Match */}
                            {searchResult.stage >= 1 && searchResult.stage <= 3 && (
                                <div className={styles.hospitalMatch}>
                                    <p style={{ margin: '0.3rem 0' }}>📍 <strong>Matched Hospital:</strong> {searchResult.hospitalName}</p>
                                    <p style={{ margin: '0.3rem 0' }}>🩸 <strong>Blood Type:</strong> <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{searchResult.bloodGroup}</span></p>
                                    <p style={{ margin: '0.3rem 0' }}>📦 <strong>Units Available:</strong> {searchResult.unitsAvailable} Units</p>
                                    {searchResult.distanceKm && <p style={{ margin: '0.3rem 0' }}>🚗 <strong>Distance:</strong> {searchResult.distanceKm.toFixed(1)} km away</p>}
                                </div>
                            )}

                            {/* Stage 4: Donor Match within 5km */}
                            {searchResult.stage === 4 && searchResult.donors && searchResult.donors.length > 0 && (
                                <div className={styles.donorMatch}>
                                    <h4 style={{ color: '#F59E0B', marginBottom: '0.8rem' }}>Matched Nearby Individual Donors (Within 5 km):</h4>
                                    {searchResult.donors.map((d: any) => (
                                        <div key={d.id} className={styles.donorRow}>
                                            <span>👤 <strong>{d.name}</strong> ({d.bloodGroup})</span>
                                            <span>📍 {d.distanceKm ? d.distanceKm.toFixed(1) : d.distance} km away</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stage 5: Staff-approved notification escalation */}
                            {searchResult.stage === 5 && (
                                <div className={styles.staffQueue}>
                                    <h4 style={{ color: '#25D366', marginBottom: '0.8rem' }}>📲 Staff-approved outreach queue:</h4>
                                    {searchResult.alertedDonors && searchResult.alertedDonors.map((d: any) => (
                                        <div key={d.id} className={styles.donorRow}>
                                            <span>👤 <strong>{d.name}</strong> ({d.bloodGroup})</span>
                                            <span style={{ color: '#25D366', fontWeight: 'bold' }}>Queued for review</span>
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
