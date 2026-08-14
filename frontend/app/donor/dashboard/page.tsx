'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './dashboard.module.css';
import ChatBox from '../../components/ChatBox';

// Dynamically import the map component
const DonorMap = dynamic(() => import('../../components/DonorMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '300px',
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

                {/* Gamification Badges */}
                <div className={styles.gamificationSection}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '-0.5rem', marginTop: '0.5rem' }}>Your Badges</h4>
                    <div className={styles.badgesContainer}>
                        <div className={styles.badgeItem}>
                            <span className={styles.badgeIcon}>🩸</span>
                            <div className={styles.badgeTitle}>First Blood</div>
                            <div className={styles.badgeDesc}>First Donation</div>
                        </div>
                        <div className={styles.badgeItem}>
                            <span className={styles.badgeIcon}>🌟</span>
                            <div className={styles.badgeTitle}>Life Saver</div>
                            <div className={styles.badgeDesc}>3+ Lives Saved</div>
                        </div>
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
                <div className={styles.heroMessage}>
                    <h1>You are awsome, Seriously!!</h1>
                    <p>Your contributions have directly saved lives. Thank you for being a hero.</p>
                </div>

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
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <button className="btn-primary" onClick={() => setChatOpen(true)} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                        💬 Open Emergency Chat
                                    </button>
                                    <button className="btn-secondary" onClick={() => setRequestStatus('pending')} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                        Cancel
                                    </button>
                                </div>
                                
                                <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                                    <DonorMap
                                        center={{ lat: 22.5768, lng: 88.4037 }} // Apollo Gleneagles Hospitals coordinates
                                        markers={[
                                            { id: 'h1', type: 'hospital', lat: 22.5768, lng: 88.4037, label: 'Apollo Gleneagles Hospitals' },
                                            { id: 'user', type: 'user', lat: 22.5800, lng: 88.4000, label: 'Your Location' }
                                        ]}
                                        zoom={14}
                                        height="300px"
                                    />
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

                {/* Leaderboard Section */}
                <div className={styles.gamificationSection} style={{ marginTop: '3rem' }}>
                    <div className={styles.leaderboardCard}>
                        <div className={styles.leaderboardHeader}>
                            <h3>🏆 Local Top Donors</h3>
                            <span style={{ fontSize: '0.85rem', color: 'var(--primary-red)', fontWeight: 'bold' }}>This Month</span>
                        </div>
                        <div className={styles.leaderboardList}>
                            <div className={styles.leaderboardItem}>
                                <div className={`${styles.rank} ${styles.top1}`}>1</div>
                                <div className={styles.donorInfo}>
                                    <div className={styles.donorName}>Alex Johnson</div>
                                </div>
                                <div className={styles.donorScore}>5 Donations</div>
                            </div>
                            <div className={styles.leaderboardItem}>
                                <div className={`${styles.rank} ${styles.top2}`}>2</div>
                                <div className={styles.donorInfo}>
                                    <div className={styles.donorName}>Sarah Williams</div>
                                </div>
                                <div className={styles.donorScore}>4 Donations</div>
                            </div>
                            <div className={`${styles.leaderboardItem} ${styles.isCurrentUser}`}>
                                <div className={`${styles.rank} ${styles.top3}`}>3</div>
                                <div className={styles.donorInfo}>
                                    <div className={styles.donorName}>{profile.name} (You)</div>
                                </div>
                                <div className={styles.donorScore}>1 Donation</div>
                            </div>
                        </div>
                    </div>
                </div>

                {chatOpen && (
                    <ChatBox onClose={() => setChatOpen(false)} partnerName="City Central Hospital" />
                )}
            </main>
        </div>
    );
}

