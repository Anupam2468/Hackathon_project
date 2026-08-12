'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './HelpGuide.module.css';

export default function HelpGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [hasSeenGuide, setHasSeenGuide] = useState(true);

    useEffect(() => {
        // We track if they've seen the general guide
        const seen = localStorage.getItem('hasSeenHelpGuide_v2');
        if (!seen) {
            setHasSeenGuide(false);
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (!hasSeenGuide) {
            localStorage.setItem('hasSeenHelpGuide_v2', 'true');
            setHasSeenGuide(true);
        }
    };

    // Determine content based on route
    let content = null;

    if (pathname.startsWith('/donor')) {
        content = (
            <>
                <div className={styles.modalHeader}>
                    <h2>Donor Guide</h2>
                    <p>How to use your Donor Dashboard</p>
                </div>
                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>🟢</div>
                        <div className={styles.featureText}>
                            <h4>Availability Status</h4>
                            <p>Toggle your status to <span className={styles.primaryHighlight}>Active</span> when you are ready to donate. Hospitals can only ping you if you are active!</p>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>🚨</div>
                        <div className={styles.featureText}>
                            <h4>Emergency Requests</h4>
                            <p>When a nearby hospital needs blood, a request will appear here. You can <span className={styles.primaryHighlight}>Accept</span> or Decline it.</p>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>🏆</div>
                        <div className={styles.featureText}>
                            <h4>Badges & Leaderboard</h4>
                            <p>Earn badges for your donations and see how you rank among local heroes on the leaderboard!</p>
                        </div>
                    </div>
                </div>
            </>
        );
    } else if (pathname.startsWith('/hospital')) {
        content = (
            <>
                <div className={styles.modalHeader}>
                    <h2>Hospital Guide</h2>
                    <p>Managing the Blood Bank</p>
                </div>
                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>➕</div>
                        <div className={styles.featureText}>
                            <h4>Create Request</h4>
                            <p>Use the <span className={styles.primaryHighlight}>Emergency Request</span> button to instantly ping all available donors matching the required blood type in your radius.</p>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>📦</div>
                        <div className={styles.featureText}>
                            <h4>Inventory Management</h4>
                            <p>Keep track of your current blood stock levels. The system will alert you when specific types run low.</p>
                        </div>
                    </div>
                </div>
            </>
        );
    } else if (pathname.startsWith('/find-donors')) {
        content = (
            <>
                <div className={styles.modalHeader}>
                    <h2>Map Guide</h2>
                    <p>Locating Nearby Donors</p>
                </div>
                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>📍</div>
                        <div className={styles.featureText}>
                            <h4>Interactive Map</h4>
                            <p>The map shows your location and the locations of <span className={styles.primaryHighlight}>Active Donors</span> nearby.</p>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>🩸</div>
                        <div className={styles.featureText}>
                            <h4>Filter by Type</h4>
                            <p>Select a specific blood group from the dropdown to only see compatible donors on the map.</p>
                        </div>
                    </div>
                </div>
            </>
        );
    } else {
        // Default / Home Guide
        content = (
            <>
                <div className={styles.modalHeader}>
                    <h2>Welcome to FastLIFE</h2>
                    <p>Here is a quick guide on how to use the platform.</p>
                </div>
                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>❤️</div>
                        <div className={styles.featureText}>
                            <h4>Want to donate blood?</h4>
                            <p>Click <span className={styles.primaryHighlight}>Donor</span> in the top menu to sign up, manage your availability, and start saving lives today.</p>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>🚑</div>
                        <div className={styles.featureText}>
                            <h4>Need blood urgently?</h4>
                            <p>Click <span className={styles.primaryHighlight}>Recipient</span> or Emergency Request to ping nearby donors immediately.</p>
                        </div>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>🏥</div>
                        <div className={styles.featureText}>
                            <h4>Are you a hospital?</h4>
                            <p>Click <span className={styles.primaryHighlight}>Hospital</span> to manage your blood banks and patient requests.</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <button 
                className={styles.floatingButton} 
                onClick={() => setIsOpen(true)}
                aria-label="Help Guide"
                title="Need Help?"
            >
                ?
            </button>

            {isOpen && (
                <div className={styles.overlay} onClick={handleClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={handleClose}>
                            ✕
                        </button>
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}
