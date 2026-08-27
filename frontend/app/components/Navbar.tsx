'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Theme initialization
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.documentElement.classList.add('light-theme');
            if (meta) meta.setAttribute('content', '#FFF6E5');
        } else {
            document.body.classList.remove('light-theme');
            document.documentElement.classList.remove('light-theme');
            if (meta) meta.setAttribute('content', '#0F172A');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (newTheme === 'light') {
            document.body.classList.add('light-theme');
            document.documentElement.classList.add('light-theme');
            if (meta) meta.setAttribute('content', '#FFF6E5');
        } else {
            document.body.classList.remove('light-theme');
            document.documentElement.classList.remove('light-theme');
            if (meta) meta.setAttribute('content', '#0F172A');
        }
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.logoAndToggle}>
                    <div className={styles.logo}>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                            <span className={styles.logoIcon}>
                                <svg
                                    width="20"
                                    height="28"
                                    viewBox="0 0 24 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.logoDrop}
                                    aria-hidden="true"
                                >
                                    <defs>
                                        <linearGradient id="navbarBloodDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ff6379" />
                                            <stop offset="100%" stopColor="#db2a4a" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M12 2.5C12 2.5 4 14.2 4 21.5C4 26.2 7.6 30 12 30C16.4 30 20 26.2 20 21.5C20 14.2 12 2.5 12 2.5Z"
                                        fill="url(#navbarBloodDropGrad)"
                                    />
                                    <path
                                        d="M8.5 17.5C8.5 14 10.2 9.5 12 6"
                                        stroke="rgba(255, 255, 255, 0.45)"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            FastLIFE
                        </Link>
                    </div>

                    <div className={styles.mobileRightControls}>
                        <button
                            className={styles.mobileThemeBtn}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            type="button"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Menu"
                            aria-expanded={mobileMenuOpen}
                            type="button"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>

                <div className={`${styles.menuContainer} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <div className={styles.topLeftMenu}>
                        <Link href="/settings" className={styles.topLink} onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                        <Link href="/about" className={styles.topLink} onClick={() => setMobileMenuOpen(false)}>About the website</Link>
                        <div className={`theme-switch-wrapper ${styles.desktopThemeToggle}`}>
                            <label className="theme-switch" htmlFor="theme-toggle-desktop">
                                <input id="theme-toggle-desktop" type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <nav className={styles.nav}>
                        <Link href="/donor" className={`${styles.link} ${pathname === '/donor' ? styles.active : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            Donor
                        </Link>
                        <Link href="/hospital" className={`${styles.link} ${pathname === '/hospital' ? styles.active : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            Hospital
                        </Link>
                        <Link href="/find-donors" className={`${styles.link} ${pathname === '/find-donors' ? styles.active : ''}`} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📍 Find Donors
                        </Link>
                        <Link href="/recipient" className={`${styles.link} ${pathname === '/recipient' ? styles.active : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            Recipient
                        </Link>
                    </nav>

                    {pathname !== '/' && !pathname.startsWith('/donor') && (
                        <div className={styles.actions}>
                            <Link href="/recipient" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>
                                Emergency Request
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
