import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.main}>

      <section className={styles.hero}>
        <div className={styles.bgGlow}></div>
        <div className={styles.heroContent}>
          <div className={`animate-fade-in`}>
            <span className={styles.tag}>AI-Powered Real-time Matching</span>
            <h1 className={styles.title}>
              Save Lives With <br />
              <span className="heading-gradient-red">Intelligent Connections</span>
            </h1>
            <p className={styles.subtitle}>
              FastLIFE instantly connects donors, hospitals, and recipients in emergencies.
              Verified profiles, real-time inventory matching, and immediate notifications.
            </p>
          </div>

          <div className={`${styles.ctaGroup} animate-fade-in fade-delay-2`}>
            <Link href="/donor" className="btn-primary">
              Become a Donor
            </Link>
            <Link href="/recipient" className="btn-secondary" style={{ backgroundColor: '#10B981', borderColor: '#10B981', color: 'white' }}>
              Recipient
            </Link>
          </div>
        </div>

        <div className={`${styles.statsGrid} animate-fade-in fade-delay-3`}>
          <div className="glass-panel">
            <h3>15M+</h3>
            <p>Units Needed Yearly</p>
          </div>
          <div className="glass-panel">
            <h3>&lt; 2 Mins</h3>
            <p>Emergency Match Time</p>
          </div>
          <div className="glass-panel">
            <h3>100%</h3>
            <p>AI Verified Records</p>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className="heading-gradient">Who are you?</h2>
        <div className={styles.featureCards}>
          <Link href="/donor" className={styles.card}>
            <div className={styles.cardIcon}>🩺</div>
            <h3>For Donors</h3>
            <p>Create a verified profile. Get instant notifications when someone nearby needs your exact blood type. Earn badges for saving lives.</p>
          </Link>

          <Link href="/hospital" className={styles.card}>
            <div className={styles.cardIcon}>🏥</div>
            <h3>For Hospitals</h3>
            <p>Manage blood inventory with ML. Instantly ping local donors when stocks run low or emergencies strike.</p>
          </Link>

          <Link href="/recipient" className={styles.card}>
            <div className={styles.cardIcon}>❤️</div>
            <h3>For Recipients</h3>
            <p>Check nearby hospital inventory in real-time. Can't find it? Request emergency donors nearby like calling a cab.</p>
          </Link>
        </div>
      </section>

    </div>
  );
}
