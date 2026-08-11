'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import ChatBox from '../../components/ChatBox';

export default function DonorDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [isAvailable, setIsAvailable] = useState<boolean>(true);
    const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
    const [chatOpen, setChatOpen] = useState<boolean>(false);

    useEffect(() => {
        const data = localStorage.getItem('donorProfile');
        if (data) {
            setProfile(JSON.parse(data));
        } else {
            setProfile({
                name: 'Jane Doe',
                bloodGroup: 'O-',
                verified: true,
            });
        }
    }, []);

    if (!profile) return null;

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.profileCard}>
                    <div className={styles.avatar}></div>
                    <h3>{profile.name}</h3>
                    <p className={styles.bloodGroup}>{profile.bloodGroup}</p>

                    {profile.verified ? (
                        <div className={styles.badge}>
                            <span className={styles.blueTick}>✓</span> Verified Donor
                        </div>
                    ) : (
                        <div className={`${styles.badge} ${styles.pending}`}>
                            <span>⏳</span> Pending AI Verification
                        </div>
                    )}
                </div>

                <div className={styles.stats}>
                    <div className={styles.statBox}>
                        <h4>1</h4>
                        <p>Donations</p>
                    </div>
                    <div className={styles.statBox}>
                        <h4>3</h4>
                        <p>Lives Saved</p>
                    </div>
                </div>

                <button
                    className={`btn-primary ${styles.w100}`}
                    onClick={() => setIsAvailable(!isAvailable)}
                    style={{
                        backgroundColor: isAvailable ? '#10B981' : '#475569',
                        borderColor: isAvailable ? '#10B981' : '#475569',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isAvailable ? '🟢 Availability Status: Active' : '🔴 Availability Status: Inactive'}
                </button>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h2>Emergency Requests Nearby</h2>
                    <p>Real-time location based matching system</p>
                </header>

                <div className={styles.requests}>
                    <div className={styles.requestCard} style={{
                        border: requestStatus === 'accepted' ? '2px solid #10B981' : requestStatus === 'declined' ? '1px solid #475569' : undefined,
                        opacity: requestStatus === 'declined' ? 0.75 : 1
                    }}>
                        <div className={styles.requestHeader}>
                            <span className={styles.tag} style={{ background: requestStatus === 'accepted' ? '#10B981' : requestStatus === 'declined' ? '#475569' : undefined }}>
                                {requestStatus === 'accepted' ? 'ACCEPTED' : requestStatus === 'declined' ? 'DECLINED' : 'URGENT'}
                            </span>
                            <span className={styles.time}>Just now</span>
                        </div>
                        <h3>City Central Hospital</h3>
                        <p>Requires {profile.bloodGroup} for an emergency patient.</p>
                        <p className={styles.distance}>📍 2.3 km away from you</p>

                        {requestStatus === 'pending' && (
                            <div className={styles.actions}>
                                <button className={`btn-primary ${styles.acceptBtn}`} onClick={() => setRequestStatus('accepted')}>
                                    Accept Request
                                </button>
                                <button className="btn-secondary" onClick={() => setRequestStatus('declined')}>
                                    Decline
                                </button>
                            </div>
                        )}

                        {requestStatus === 'accepted' && (
                            <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #10B981' }}>
                                <p style={{ color: '#10B981', fontWeight: 600, marginBottom: '0.75rem' }}>
                                    ✅ Request Accepted! Hospital notified.
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#E2E8F0', marginBottom: '1rem' }}>
                                    🚗 ETA to Main Reception: 12 mins.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button className="btn-primary" onClick={() => setChatOpen(true)} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                        💬 Open Emergency Chat
                                    </button>
                                    <button className="btn-secondary" onClick={() => setRequestStatus('pending')} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {requestStatus === 'declined' && (
                            <div style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Request declined.</p>
                                <button className="btn-secondary" onClick={() => setRequestStatus('pending')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                                    Reconsider Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {chatOpen && (
                    <ChatBox onClose={() => setChatOpen(false)} partnerName="City Central Hospital" />
                )}
            </main>
        </div>
    );
}

