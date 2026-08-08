import styles from '../page.module.css';

export default function Settings() {
    return (
        <div className={styles.main}>
            <section className={styles.hero} style={{ minHeight: '60vh', textAlign: 'center' }}>
                <div className={styles.bgGlow}></div>
                <div className={styles.heroContent} style={{ zIndex: 10 }}>
                    <h1 className="heading-gradient">Account Settings</h1>
                    <p className={styles.subtitle} style={{ marginTop: '1rem' }}>
                        Manage your FastLIFE preferences, security, and notification alerts.
                    </p>

                    <div className="glass-panel" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'left', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Notifications</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Coming Soon: Manage SMS, WhatsApp, and Email alerts for emergency blood requests.</p>

                        <h3 style={{ marginBottom: '1rem' }}>Privacy</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Coming Soon: Control who can see your real-time location.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
