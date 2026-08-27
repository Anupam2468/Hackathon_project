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
    const [availability, setAvailability] = useState<'now' | 'later' | 'unavailable'>('now');
    const [alertPreference, setAlertPreference] = useState<'urgent' | 'balanced' | 'quiet'>('balanced');
    const [alertsPaused, setAlertsPaused] = useState(false);
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
                            <span className={styles.blueTick}>✓</span> Identity & records reviewed
                        </div>
                    ) : (
                        <div className={`${styles.badge} ${styles.pending}`}>
                            <span>⏳</span> Record review pending
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
                            <div className={styles.badgeTitle}>Reliable responder</div>
                            <div className={styles.badgeDesc}>Confirmed availability</div>
                        </div>
                    </div>
                </div>

                <div className={styles.w100} aria-label="Availability status">
                    <p style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Availability for emergency requests</p>
                    <div style={{ display: 'grid', gap: '0.45rem' }}>
                        {([
                            ['now', '🟢 Available now'],
                            ['later', '🟡 Available later'],
                            ['unavailable', '⚪ Unavailable'],
                        ] as const).map(([value, label]) => (
                            <button
                                key={value}
                                className={availability === value ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setAvailability(value)}
                                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.82rem', backgroundColor: availability === value && value === 'now' ? '#10B981' : undefined, borderColor: availability === value && value === 'now' ? '#10B981' : undefined }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '1rem' }}>
                    <strong>Donation readiness</strong>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Your profile is ready for preliminary matching. The hospital will always complete the final health check on arrival.</p>
                    <button className="btn-secondary" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem', marginTop: '0.75rem' }}>View impact & certificates</button>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: 'var(--glass-border)', borderRadius: '10px', padding: '1rem' }}>
                    <strong>Alert preferences</strong>
                    <p style={{ margin: '0.4rem 0 0.75rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>You control when FastLIFE may contact you. You can change this anytime.</p>
                    <div style={{ display: 'grid', gap: '0.4rem' }}>
                        {([
                            ['urgent', 'Urgent only — critical nearby requests'],
                            ['balanced', 'Balanced — urgent and matching local requests'],
                            ['quiet', 'Quiet — camp reminders and occasional updates'],
                        ] as const).map(([value, label]) => (
                            <button key={value} className={alertPreference === value ? 'btn-primary' : 'btn-secondary'} onClick={() => setAlertPreference(value)} style={{ fontSize: '0.78rem', padding: '0.5rem 0.65rem', textAlign: 'left' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <button className="btn-secondary" onClick={() => setAlertsPaused(!alertsPaused)} style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem 0.65rem', fontSize: '0.8rem' }}>
                        {alertsPaused ? 'Resume emergency alerts' : 'Pause alerts for now'}
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.heroMessage}>
                    <h1>Thank you for showing up.</h1>
                    <p>Your availability helps hospitals respond faster. Donation eligibility is confirmed only at the blood bank.</p>
                </div>

                <header className={styles.header}>
                    <h2>Emergency Requests Nearby</h2>
                    <p>{alertsPaused ? 'Alerts are paused. You will not receive new emergency requests.' : 'Only requests compatible with your availability and preliminary profile are shown.'}</p>
                </header>

                <div className={styles.requests}>
                    <div className={`${styles.requestCard} ${requestStatus === 'pending' ? styles.urgent : ''}`} style={{
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
                        <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '8px', padding: '0.65rem 0.8rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                            <strong style={{ color: '#93C5FD' }}>Why you&apos;re seeing this:</strong> your blood group matches, you are within the selected distance range, and your availability is set to {availability === 'now' ? 'Available now' : availability === 'later' ? 'Available later' : 'Unavailable'}.
                        </div>

                        {requestStatus === 'pending' && !alertsPaused && (
                            <div className={styles.actions}>
                                <button className={`btn-primary ${styles.acceptBtn}`} disabled={availability === 'unavailable'} onClick={() => setRequestStatus('accepted')}>
                                    {availability === 'later' ? 'Offer later availability' : 'Offer to help'}
                                </button>
                                <button className="btn-secondary" onClick={() => setRequestStatus('declined')}>
                                    Decline
                                </button>
                            </div>
                        )}

                        {(alertsPaused || availability === 'unavailable') && requestStatus === 'pending' && (
                            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.9rem' }}>
                                You are not being asked to respond right now. Update your availability or resume alerts only when you genuinely want to help.
                            </div>
                        )}

                        {requestStatus === 'accepted' && (
                            <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #10B981' }}>
                                <p style={{ color: '#10B981', fontWeight: 600, marginBottom: '0.75rem' }}>
                                    ✅ Availability shared with the hospital.
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#E2E8F0', marginBottom: '1rem' }}>
                                    🚗 Suggested arrival at Main Reception: 12 mins.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <button className="btn-primary" onClick={() => setChatOpen(true)} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                        💬 Contact hospital coordinator
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
                                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>You have not offered availability for this request.</p>
                                <button className="btn-secondary" onClick={() => setRequestStatus('pending')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                                    Reconsider Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.gamificationSection} style={{ marginTop: '2rem' }}>
                    <div className={styles.leaderboardCard}>
                        <h3>Community impact, without pressure</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>Build a healthy habit of volunteering at your own pace. Honest “not available” responses help hospitals route emergencies faster.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                            <span className={styles.tag}>✓ Availability updated</span>
                            <span className={styles.tag}>🛡️ Privacy protected</span>
                            <span className={styles.tag}>🩺 Screening stays hospital-led</span>
                        </div>
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
