import styles from '../page.module.css';

export default function About() {
    return (
        <div className={styles.main}>
            <section className={styles.hero} style={{ minHeight: '60vh', textAlign: 'center' }}>
                <div className={styles.bgGlow}></div>
                <div className={styles.heroContent} style={{ zIndex: 10 }}>
                    <h1 className="heading-gradient-red">About FastLIFE</h1>
                    <p className={styles.subtitle} style={{ marginTop: '1rem' }}>
                        The intelligent network connecting donors, hospitals, and recipients.
                    </p>

                    <div className="glass-panel" style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'left', padding: '2.5rem', lineHeight: '1.8' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-red)' }}>Our Mission</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            FastLIFE was created during a hackathon to solve a critical issue: the communication gap during blood emergencies. Often, hospitals run out of stock and individuals scramble on social media to find willing donors. FastLIFE automates this through AI and location-based matching.
                        </p>

                        <h3 style={{ marginBottom: '1rem', color: '#10B981' }}>How it Works</h3>
                        <ul style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem', marginBottom: '2rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}><strong>For Hospitals:</strong> Manage live inventory, predict shortages using ML, and ping local donors automatically.</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>For Donors:</strong> Register securely, get verified, and receive WhatsApp/SMS alerts when someone nearby explicitly needs your blood type.</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>For Recipients:</strong> Hit the Emergency button to scan a 5-stage radius (Local hospitals → Local Donors → Wide Broadcast).</li>
                        </ul>

                        <p style={{ color: 'var(--text-secondary)' }}>Built with Next.js, TypeScript, and 💖.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
