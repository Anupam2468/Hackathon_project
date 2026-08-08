'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Theme initialization
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <Link href="/">
                            <span className={styles.logoIcon}>❤️</span> FastLIFE
                        </Link>
                    </div>
                    <div className={styles.topLeftMenu}>
                        <Link href="/settings" className={styles.topLink}>Settings</Link>
                        <Link href="/about" className={styles.topLink}>About the website</Link>
                        <div className="theme-switch-wrapper">
                            <label className="theme-switch">
                                <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link href="/donor" className={`${styles.link} ${pathname === '/donor' ? styles.active : ''}`}>
                        Donor
                    </Link>
                    <Link href="/hospital" className={`${styles.link} ${pathname === '/hospital' ? styles.active : ''}`}>
                        Hospital
                    </Link>
                    <Link href="/recipient" className={`${styles.link} ${pathname === '/recipient' ? styles.active : ''}`}>
                        Recipient
                    </Link>
                </nav>

                {pathname !== '/' && !pathname.startsWith('/donor') && (
                    <div className={styles.actions}>
                        <button className="btn-primary">Emergency Request</button>
                    </div>
                )}
            </div>
        </header>
    );
}
