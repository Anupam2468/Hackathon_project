'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function DonorDashboard() {
    const [profile, setProfile] = useState<any>(null);

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

                <button className={`btn-primary ${styles.w100}`}>Availability Status: Active</button>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h2>Emergency Requests Nearby</h2>
                    <p>Real-time location based matching system</p>
                </header>

                <div className={styles.requests}>
                    <div className={styles.requestCard}>
                        <div className={styles.requestHeader}>
                            <span className={styles.tag}>URGENT</span>
                            <span className={styles.time}>Just now</span>
                        </div>
                        <h3>City Central Hospital</h3>
                        <p>Requires {profile.bloodGroup} for an accident victim.</p>
                        <p className={styles.distance}>📍 2.3 km away from you</p>

                        <div className={styles.actions}>
                            <button className={`btn-primary ${styles.acceptBtn}`}>Accept Request</button>
                            <button className={`btn-secondary`}>Decline</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
