import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.topBorder} />

            <div className={styles.container}>
                {/* Brand Column */}
                <div className={styles.brandCol}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoDropWrapper}>
                            <svg className={styles.logoDrop} viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M12 0C12 0 0 14.4 0 22.8C0 30 5.4 36 12 36C18.6 36 24 30 24 22.8C24 14.4 12 0 12 0Z" fill="url(#footerDropGradient)" />
                                <defs>
                                    <linearGradient id="footerDropGradient" x1="4" y1="4" x2="20" y2="34" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#ff6379" />
                                        <stop offset="1" stopColor="#db2a4a" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                        FastLIFE
                    </Link>
                    <p className={styles.tagline}>
                        Hospital-led blood coordination, verified donor networks, and transparent emergency timelines.
                    </p>
                    <div className={styles.emergencyBadge}>
                        <span className={styles.pulseCircle} />
                        <span>24/7 Emergency Coordination</span>
                    </div>
                </div>

                {/* Quick Links */}
                <div className={styles.linkCol}>
                    <h4>Platform</h4>
                    <nav className={styles.linkList}>
                        <Link href="/donor">Become a Donor</Link>
                        <Link href="/hospital">Hospital Portal</Link>
                        <Link href="/recipient">Request Blood</Link>
                        <Link href="/find-donors">Find Donors Nearby</Link>
                    </nav>
                </div>

                {/* Resources */}
                <div className={styles.linkCol}>
                    <h4>Resources</h4>
                    <nav className={styles.linkList}>
                        <Link href="/about">About FastLIFE</Link>
                        <Link href="/settings">Account Settings</Link>
                        <span className={styles.comingSoon}>API Docs (Coming Soon)</span>
                        <span className={styles.comingSoon}>Mobile App (Coming Soon)</span>
                    </nav>
                </div>
            </div>

            {/* Bottom bar */}
            <div className={styles.bottomBar}>
                <p>
                    Built with <span className={styles.heart}>❤️</span> during a Hackathon &bull; Powered by Next.js &amp; TypeScript
                </p>
                <p className={styles.disclaimer}>
                    FastLIFE assists coordination only. All medical decisions, screening, and transfusions are handled by licensed professionals.
                </p>
            </div>
        </footer>
    );
}
