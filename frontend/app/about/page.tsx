import Link from 'next/link';
import styles from './page.module.css';
import ScrollReveal from '../components/ScrollReveal';

export default function About() {
    return (
        <main className={styles.container}>
            {/* Hero Section */}
            <ScrollReveal direction="up">
                <section className={styles.heroSection}>
                    <div className={styles.heroBgGlow} />

                    {/* Decorative Blood-drop SVG in background */}
                    <svg
                        className={styles.heroBloodDropSvg}
                        viewBox="0 0 200 240"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M100 10C100 10 20 110 20 160C20 204.183 55.8172 240 100 240C144.183 240 180 204.183 180 160C180 110 100 10 100 10Z"
                            fill="url(#bloodDropGradient)"
                        />
                        <defs>
                            <linearGradient id="bloodDropGradient" x1="100" y1="10" x2="100" y2="240" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#F43F5E" />
                                <stop offset="1" stopColor="#9F1239" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className={styles.heroBadge}>
                        <span>🩸</span> Intelligent Blood Logistics
                    </div>

                    <h1 className={`${styles.heroTitle} heading-gradient-red`}>About FastLIFE</h1>

                    <p className={styles.heroSubtitle}>
                        The intelligent network connecting donors, hospitals, and recipients in real-time blood emergencies.
                    </p>
                </section>
            </ScrollReveal>

            {/* Mission Card */}
            <ScrollReveal direction="up" delay={0.1}>
                <section className={`glass-panel ${styles.missionCard}`}>
                    <div className={styles.missionHeader}>
                        <div className={styles.missionIcon}>🎯</div>
                        <h2 className={styles.missionTitle}>Our Mission</h2>
                    </div>
                    <p className={styles.missionText}>
                        FastLIFE was created during a hackathon to solve a critical issue: the communication gap during blood emergencies. Often, hospitals run out of stock and individuals scramble on social media to find willing donors. FastLIFE automates this through AI and location-based matching.
                    </p>
                    <div className={styles.missionHighlights}>
                        <div className={styles.highlightItem}>
                            <span className={styles.highlightDot} />
                            <span>Zero-delay algorithmic matching</span>
                        </div>
                        <div className={styles.highlightItem}>
                            <span className={styles.highlightDot} />
                            <span>Privacy-first donor notifications</span>
                        </div>
                        <div className={styles.highlightItem}>
                            <span className={styles.highlightDot} />
                            <span>Real-time hospital inventory sync</span>
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* How It Works Section */}
            <section>
                <ScrollReveal direction="up" delay={0.15}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTag}>How It Works</span>
                        <h2 className={`${styles.sectionTitle} heading-gradient`}>Coordinated Lifesaving Workflow</h2>
                        <p className={styles.sectionSubtitle}>
                            Three interconnected pillars working in sync to eliminate critical blood shortages.
                        </p>
                    </div>
                </ScrollReveal>

                <div className={styles.cardsGrid}>
                    <ScrollReveal direction="up" delay={0.2} className="stagger-1">
                        <div className={`glass-panel ${styles.card} ${styles.cardHospital}`}>
                            <div className={styles.cardIconWrap}>🏥</div>
                            <h3 className={styles.cardTitle}>For Hospitals</h3>
                            <p className={styles.cardDesc}>
                                Manage live inventory, predict shortages using ML, and ping local donors automatically.
                            </p>
                            <div className={styles.cardTagList}>
                                <span className={styles.cardMiniTag}>Live Inventory</span>
                                <span className={styles.cardMiniTag}>ML Shortage Forecast</span>
                                <span className={styles.cardMiniTag}>Direct Outreach</span>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={0.25} className="stagger-2">
                        <div className={`glass-panel ${styles.card} ${styles.cardDonor}`}>
                            <div className={styles.cardIconWrap}>❤️</div>
                            <h3 className={styles.cardTitle}>For Donors</h3>
                            <p className={styles.cardDesc}>
                                Register securely, get verified, and receive WhatsApp/SMS alerts when someone nearby explicitly needs your blood type.
                            </p>
                            <div className={styles.cardTagList}>
                                <span className={styles.cardMiniTag}>Encrypted Data</span>
                                <span className={styles.cardMiniTag}>Instant Alerts</span>
                                <span className={styles.cardMiniTag}>Proximity Match</span>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={0.3} className="stagger-3">
                        <div className={`glass-panel ${styles.card} ${styles.cardRecipient}`}>
                            <div className={styles.cardIconWrap}>🚑</div>
                            <h3 className={styles.cardTitle}>For Recipients</h3>
                            <p className={styles.cardDesc}>
                                Hit the Emergency button to scan a 5-stage radius (Local hospitals → Local Donors → Wide Broadcast).
                            </p>
                            <div className={styles.cardTagList}>
                                <span className={styles.cardMiniTag}>5-Stage Cascade</span>
                                <span className={styles.cardMiniTag}>Radius Scanning</span>
                                <span className={styles.cardMiniTag}>Rapid Dispatch</span>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Tech Stack Section */}
            <ScrollReveal direction="up" delay={0.35}>
                <section className={`glass-panel ${styles.techSection}`}>
                    <h3 className={styles.techTitle}>Built With Modern Tech Stack</h3>
                    <p className={styles.techSubtitle}>Fast, scalable, and resilient architecture engineered for reliability</p>
                    <div className={styles.techBadges}>
                        <span className={styles.techBadge}>
                            <span className={styles.techIcon}>⚡</span> Next.js
                        </span>
                        <span className={styles.techBadge}>
                            <span className={styles.techIcon}>🔷</span> TypeScript
                        </span>
                        <span className={styles.techBadge}>
                            <span className={styles.techIcon}>💎</span> Prisma
                        </span>
                        <span className={styles.techBadge}>
                            <span className={styles.techIcon}>🗺️</span> Leaflet
                        </span>
                        <span className={styles.techBadge}>
                            <span className={styles.techIcon}>🗄️</span> SQLite
                        </span>
                    </div>
                </section>
            </ScrollReveal>

            {/* Hackathon Credit Section */}
            <ScrollReveal direction="up" delay={0.4}>
                <section className={styles.creditSection}>
                    <p className={styles.creditText}>
                        Built with Next.js, TypeScript, and <span className={styles.creditHeart}>💖</span> for the Hackathon.
                    </p>
                    <div className={styles.ctaRow}>
                        <Link href="/donor" className="btn-primary">
                            Register as a Donor
                        </Link>
                        <Link href="/recipient" className="btn-secondary">
                            Request Blood Emergency
                        </Link>
                    </div>
                </section>
            </ScrollReveal>
        </main>
    );
}
