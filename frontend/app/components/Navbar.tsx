'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href="/">
                        <span className={styles.logoIcon}>❤️</span> LifeFlow
                    </Link>
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
