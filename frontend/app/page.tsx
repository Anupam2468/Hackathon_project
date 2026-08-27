import styles from './page.module.css';
import Link from 'next/link';
import CampaignCarousel from './components/CampaignCarousel';
import ScrollReveal from './components/ScrollReveal';

export default function Home() {
  return (
    <div className={styles.main}>

      <section className={styles.hero}>
        <div className={styles.bgGlow}></div>
        
        {/* Floating particles for depth */}
        <div className={`${styles.particle} ${styles.particle1}`}></div>
        <div className={`${styles.particle} ${styles.particle2}`}></div>
        <div className={`${styles.particle} ${styles.particle3}`}></div>
        <div className={`${styles.particle} ${styles.particle4}`}></div>
        <div className={`${styles.particle} ${styles.particle5}`}></div>

        <div className={styles.heroGrid}>
        <div className={styles.heroContent}>
          <div className={`animate-fade-in`}>
            <span className={styles.tag}>Verified emergency coordination</span>
            <h1 className={styles.title}>
              Move emergencies forward <br />
              <span className="heading-gradient-red">with clarity and care</span>
            </h1>
            <p className={styles.subtitle}>
              FastLIFE helps hospitals coordinate verified donors, inventory, and recipients.
              Every donation still follows blood-bank screening and clinical approval.
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

        <div className={`${styles.heroArtwork} animate-fade-in fade-delay-2`} aria-label="Emergency coordination illustration">
          <svg className={styles.bloodDropSvg} viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7b93" />
                <stop offset="50%" stopColor="#f0445f" />
                <stop offset="100%" stopColor="#c0263f" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M50 5 C50 5 15 45 15 80 C15 99.33 30.67 115 50 115 C69.33 115 85 99.33 85 80 C85 45 50 5 50 5 Z" fill="url(#bloodGrad)" filter="url(#glow)"/>
            <path d="M35 75 C35 75 40 65 50 65" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="50" cy="85" r="15" fill="rgba(255,255,255,0.15)"/>
            <path d="M50 75 L50 95 M40 85 L60 85" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        </div>

        <ScrollReveal direction="up" delay={300} className={styles.statsGrid}>
          <div className={styles.glassPanel}>
            <div className={styles.accentBar}></div>
            <h3>Live</h3>
            <p>Inventory visibility</p>
          </div>
          <div className={styles.glassPanel}>
            <div className={styles.accentBar}></div>
            <h3>10</h3>
            <p>First accepting donors</p>
          </div>
          <div className={styles.glassPanel}>
            <div className={styles.accentBar}></div>
            <h3>Human</h3>
            <p>Clinical decision remains final</p>
          </div>
        </ScrollReveal>
      </section>

      <CampaignCarousel />

      <section className={styles.howItWorks}>
        <ScrollReveal direction="up">
          <h2 className="heading-gradient">How It Works</h2>
          <div className={styles.stepper}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>📝</div>
              <h3>1. Register & Verify</h3>
              <p>Sign up securely. Your eligibility is checked by verified hospitals.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>🤝</div>
              <h3>2. Get Matched</h3>
              <p>We alert you when nearby hospitals have an exact-match emergency.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>❤️</div>
              <h3>3. Save Lives</h3>
              <p>Donate at the verified center. Track your life-saving impact.</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className={styles.features}>
        <ScrollReveal direction="up">
          <p className={styles.tag}>Why FastLIFE</p>
          <h2 className="heading-gradient">Don&apos;t just find blood. Know the safest next step.</h2>
        </ScrollReveal>
        
        <div className={styles.featureCards}>
          <ScrollReveal direction="up" delay={100}>
            <Link href="/donor" className={styles.card}>
              <div className={styles.cardIcon}>🩺</div>
              <h3>For Donors</h3>
              <p>Share availability, receive nearby requests, and earn recognition for reliable responses. Final eligibility is always checked at the blood bank.</p>
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <Link href="/hospital" className={styles.card}>
              <div className={styles.cardIcon}>🏥</div>
              <h3>For Hospitals</h3>
              <p>Coordinate inventory, staged donor outreach, and alternate hospital routes with clear clinical checkpoints.</p>
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <Link href="/find-donors" className={styles.card}>
              <div className={styles.cardIcon}>📍</div>
              <h3>Find Donors Nearby</h3>
              <p>Find verified potential donors with privacy-protecting location ranges and hospital-controlled contact release.</p>
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <Link href="/recipient" className={styles.card}>
              <div className={styles.cardIcon}>❤️</div>
              <h3>For Recipients</h3>
              <p>Check nearby availability and follow a transparent, hospital-led emergency timeline from request to issue.</p>
            </Link>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
