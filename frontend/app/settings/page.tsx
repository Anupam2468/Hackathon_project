'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ScrollReveal from '../components/ScrollReveal';

export default function Settings() {
    // Notification toggle states
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [whatsappAlerts, setWhatsappAlerts] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);

    // Privacy toggle states
    const [showLocationToHospitals, setShowLocationToHospitals] = useState(true);
    const [showProfileToRecipients, setShowProfileToRecipients] = useState(false);

    // Feedback toast for interactive toggles
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleToggle = (settingName: string, newValue: boolean, setter: (val: boolean) => void) => {
        setter(newValue);
        setToastMessage(`${settingName} ${newValue ? 'enabled' : 'disabled'} (Preview Mode)`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <main className={styles.container}>
            {/* Page Header */}
            <ScrollReveal direction="up">
                <header className={styles.header}>
                    <div className={styles.badge}>
                        <span>⚙️</span> Preferences & Security
                    </div>
                    <h1 className={`${styles.title} heading-gradient`}>Account Settings</h1>
                    <p className={styles.subtitle}>
                        Manage your FastLIFE preferences, security, and notification alerts.
                    </p>
                </header>
            </ScrollReveal>

            <div className={styles.cardsStack}>
                {/* 1. Notifications Card */}
                <ScrollReveal direction="up" delay={0.1}>
                    <section className={`glass-panel ${styles.settingsCard}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIcon}>🔔</div>
                                <div>
                                    <h2 className={styles.cardTitle}>Notifications</h2>
                                </div>
                            </div>
                            <span className={styles.cardHeaderBadge}>Dispatch Channels</span>
                        </div>

                        <div className={styles.toggleList}>
                            {/* SMS Alerts */}
                            <div className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <div className={styles.toggleLabelRow}>
                                        <span className={styles.toggleLabel}>SMS Alerts</span>
                                        <span className={styles.comingSoonBadge}>Coming Soon</span>
                                    </div>
                                    <p className={styles.toggleDesc}>
                                        Receive instant SMS alerts for critical blood emergency requests within a 5km radius.
                                    </p>
                                </div>
                                <div className={styles.toggleControl}>
                                    <label className={styles.switch} aria-label="Toggle SMS Alerts">
                                        <input
                                            type="checkbox"
                                            checked={smsAlerts}
                                            onChange={(e) => handleToggle('SMS Alerts', e.target.checked, setSmsAlerts)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            {/* WhatsApp Alerts */}
                            <div className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <div className={styles.toggleLabelRow}>
                                        <span className={styles.toggleLabel}>WhatsApp Alerts</span>
                                        <span className={styles.comingSoonBadge}>Coming Soon</span>
                                    </div>
                                    <p className={styles.toggleDesc}>
                                        Get real-time rich interactive WhatsApp messages when matched with verified hospital needs.
                                    </p>
                                </div>
                                <div className={styles.toggleControl}>
                                    <label className={styles.switch} aria-label="Toggle WhatsApp Alerts">
                                        <input
                                            type="checkbox"
                                            checked={whatsappAlerts}
                                            onChange={(e) => handleToggle('WhatsApp Alerts', e.target.checked, setWhatsappAlerts)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            {/* Email Alerts */}
                            <div className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <div className={styles.toggleLabelRow}>
                                        <span className={styles.toggleLabel}>Email Alerts</span>
                                        <span className={styles.comingSoonBadge}>Coming Soon</span>
                                    </div>
                                    <p className={styles.toggleDesc}>
                                        Receive periodic donation drive summaries, campaign updates, and impact reports.
                                    </p>
                                </div>
                                <div className={styles.toggleControl}>
                                    <label className={styles.switch} aria-label="Toggle Email Alerts">
                                        <input
                                            type="checkbox"
                                            checked={emailAlerts}
                                            onChange={(e) => handleToggle('Email Alerts', e.target.checked, setEmailAlerts)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                {/* 2. Privacy Card */}
                <ScrollReveal direction="up" delay={0.2}>
                    <section className={`glass-panel ${styles.settingsCard}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIcon}>🔒</div>
                                <div>
                                    <h2 className={styles.cardTitle}>Privacy & Permissions</h2>
                                </div>
                            </div>
                            <span className={styles.cardHeaderBadge}>Data Control</span>
                        </div>

                        <div className={styles.toggleList}>
                            {/* Show location to hospitals */}
                            <div className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <div className={styles.toggleLabelRow}>
                                        <span className={styles.toggleLabel}>Show location to hospitals</span>
                                        <span className={styles.comingSoonBadge}>Coming Soon</span>
                                    </div>
                                    <p className={styles.toggleDesc}>
                                        Allow verified medical facilities to calculate travel radius and proximity during critical shortages.
                                    </p>
                                </div>
                                <div className={styles.toggleControl}>
                                    <label className={styles.switch} aria-label="Toggle hospital location visibility">
                                        <input
                                            type="checkbox"
                                            checked={showLocationToHospitals}
                                            onChange={(e) => handleToggle('Hospital Location Sharing', e.target.checked, setShowLocationToHospitals)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            {/* Show profile to recipients */}
                            <div className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <div className={styles.toggleLabelRow}>
                                        <span className={styles.toggleLabel}>Show profile to recipients</span>
                                        <span className={styles.comingSoonBadge}>Coming Soon</span>
                                    </div>
                                    <p className={styles.toggleDesc}>
                                        Allow verified emergency requesters to view your availability badge and blood type compatibility.
                                    </p>
                                </div>
                                <div className={styles.toggleControl}>
                                    <label className={styles.switch} aria-label="Toggle recipient profile visibility">
                                        <input
                                            type="checkbox"
                                            checked={showProfileToRecipients}
                                            onChange={(e) => handleToggle('Recipient Profile Visibility', e.target.checked, setShowProfileToRecipients)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                {/* 3. Account Card */}
                <ScrollReveal direction="up" delay={0.3}>
                    <section className={`glass-panel ${styles.settingsCard}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIcon}>👤</div>
                                <div>
                                    <h2 className={styles.cardTitle}>Account Profile</h2>
                                </div>
                            </div>
                            <span className={styles.cardHeaderBadge}>FastLIFE ID</span>
                        </div>

                        <div className={styles.profileCardContent}>
                            <div className={styles.profileLeft}>
                                <div className={styles.avatar}>FL</div>
                                <div className={styles.profileDetails}>
                                    <div className={styles.profileName}>
                                        FastLIFE Member
                                        <span className={styles.profileBadge}>Active</span>
                                    </div>
                                    <div className={styles.profileMeta}>
                                        <span>Blood Group: <strong>O+ (Universal)</strong></span>
                                        <span>•</span>
                                        <span>Encrypted Profile</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.accountActions}>
                                <Link href="/donor" className="btn-primary">
                                    Manage Account
                                </Link>
                                <Link href="/find-donors" className="btn-secondary">
                                    View Donors
                                </Link>
                            </div>
                        </div>

                        <div className={styles.infoNotice}>
                            <div className={styles.statusIndicator}>
                                <span className={styles.statusDot} />
                                <span>Encrypted end-to-end security active</span>
                            </div>
                            <span>Version 1.2.0 • FastLIFE Core</span>
                        </div>
                    </section>
                </ScrollReveal>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className={styles.toastNotice} role="status">
                    <span>✨</span>
                    <span>{toastMessage}</span>
                </div>
            )}
        </main>
    );
}
