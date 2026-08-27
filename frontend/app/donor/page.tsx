'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { registerDonor, loginDonor } from '../actions/donor';

export default function DonorAuth() {
    const router = useRouter();
    const [authMode, setAuthMode] = useState<'selection' | 'login' | 'register'>('selection');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [locationStatus, setLocationStatus] = useState('');

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('GPS failed');
            return;
        }

        setLocationStatus('Acquiring GPS...');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                        headers: { 'User-Agent': 'FastLIFE-BloodDonation/1.0' }
                    });
                    const data = await res.json();
                    if (data && data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }));
                    }
                } catch (error) {
                    console.error("Geocoding failed", error);
                }
                
                setLocationStatus('Location found!');
            },
            (error) => {
                setLocationStatus('GPS failed');
            }
        );
    };

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'A+',
        phone: '',
        whatsapp: '',
        email: '',
        password: '',
        address: '',
        latitude: '',
        longitude: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const result = await loginDonor(formData);

        if (result.success && result.donor) {
            localStorage.setItem('donorProfileId', result.donor.id);
            localStorage.setItem('donorProfile', JSON.stringify(result.donor));
            router.push('/donor/dashboard');
        } else {
            setErrorMsg(result.message || 'Login failed');
            setLoading(false);
        }
    }

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const result = await registerDonor(formData);

        if (result.success && result.donor) {
            localStorage.setItem('donorProfileId', result.donor.id);
            localStorage.setItem('donorProfile', JSON.stringify(result.donor));
            router.push('/donor/dashboard');
        } else {
            setErrorMsg(result.message || 'Registration failed');
            setLoading(false);
        }
    };

    const getStepStatus = () => {
        if (authMode === 'selection') return 1;
        if (authMode === 'register') return 2;
        return 3;
    };

    return (
        <div className={styles.container}>
            <svg className={styles.bgSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0 C50 0 10 40 10 65 C10 87 28 100 50 100 C72 100 90 87 90 65 C90 40 50 0 50 0 Z" />
            </svg>
            
            <div className={styles.formWrapper}>
                <div className={styles.stepIndicator}>
                    <div className={`${styles.step} ${getStepStatus() >= 1 ? styles.active : ''}`}>1. Select</div>
                    <div className={`${styles.step} ${getStepStatus() >= 2 ? styles.active : ''}`}>2. Details</div>
                    <div className={`${styles.step} ${getStepStatus() >= 3 ? styles.active : ''}`}>3. Verify</div>
                </div>

                {authMode === 'selection' && (
                    <div style={{ textAlign: 'center' }}>
                        <h1 className="heading-gradient-red" style={{ marginBottom: '1rem' }}>Welcome Donor</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Join the FastLIFE network or log back in.</p>

                        <div className={styles.authGrid}>
                            <div className={styles.authCard} onClick={() => setAuthMode('register')}>
                                <span className={styles.authIcon}>🆕</span>
                                <span className={styles.authTitle}>Create & Verify New Donor</span>
                            </div>
                            <div className={styles.authCard} onClick={() => setAuthMode('login')}>
                                <span className={styles.authIcon}>🔑</span>
                                <span className={styles.authTitle}>Login to Existing Account</span>
                            </div>
                        </div>
                    </div>
                )}

                {authMode === 'login' && (
                    <>
                        <div className={styles.header}>
                            <h1 className="heading-gradient-red">Donor Login</h1>
                            <p>Welcome back.</p>
                            {errorMsg && <p style={{ color: '#EF4444', marginTop: '1rem' }}>{errorMsg}</p>}
                        </div>
                        <form onSubmit={handleLoginSubmit} className={styles.form}>
                            <div className={styles.formGroup} style={{ width: '100%' }}>
                                <label>Email Address</label>
                                <input type="email" name="email" required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup} style={{ width: '100%' }}>
                                <label>Password</label>
                                <input type="password" name="password" required onChange={handleChange} />
                            </div>
                            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading} style={{ marginTop: '2rem' }}>
                                {loading ? 'Authenticating...' : 'Login'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setAuthMode('selection')} style={{ width: '100%', marginTop: '1rem' }}>Back</button>
                        </form>
                    </>
                )}

                {authMode === 'register' && (
                    <>
                        <div className={styles.header}>
                            <h1 className="heading-gradient-red">Donor Registration</h1>
                            <p>Join the FastLIFE network. Your profile will be verified by our AI system.</p>
                            {errorMsg && <p style={{ color: '#EF4444', marginTop: '1rem' }}>{errorMsg}</p>}
                        </div>

                        <form onSubmit={handleRegisterSubmit} className={styles.form}>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input name="name" required placeholder="John Doe" onChange={handleChange} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Age</label>
                                    <input type="number" name="age" required min="18" max="65" placeholder="25" onChange={handleChange} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Gender</label>
                                    <select name="gender" onChange={handleChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Blood Group</label>
                                    <select name="bloodGroup" onChange={handleChange}>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" required placeholder="+1 234 567 890" onChange={handleChange} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>WhatsApp Number</label>
                                    <input type="tel" name="whatsapp" required placeholder="+1 234 567 890" onChange={handleChange} />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Email Address</label>
                                    <input type="email" name="email" required placeholder="john@example.com" onChange={handleChange} />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Password</label>
                                    <input type="password" name="password" required placeholder="Enter strong password" onChange={handleChange} />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Address (Real-time Location Based)</label>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <textarea 
                                            name="address" 
                                            required 
                                            rows={3} 
                                            placeholder="123 Lifeline Ave, City, Country" 
                                            value={formData.address}
                                            onChange={handleChange} 
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={locationStatus === 'Acquiring GPS...'}
                                            className={`${styles.locationBtn} ${locationStatus === 'Location found!' ? styles.found : locationStatus === 'Acquiring GPS...' ? styles.searching : styles.idle}`}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>{locationStatus === 'Location found!' ? '✅' : '📍'}</span>
                                            <span style={{ fontSize: '0.7rem' }}>
                                                {locationStatus || 'Use GPS'}
                                            </span>
                                        </button>
                                    </div>
                                    {formData.latitude && (
                                        <p style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.35rem' }}>
                                            ✓ GPS: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                                        </p>
                                    )}
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Profile Picture</label>
                                    <input type="file" accept="image/*" className={styles.fileInput} />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Medical Records (Min 2 months, AI Analyzed)</label>
                                    <input type="file" accept=".pdf,image/*" multiple className={styles.fileInput} />
                                </div>
                            </div>

                            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                                {loading ? 'AI Verifying...' : 'Submit Profile for Verification'}
                            </button>

                            <button type="button" className="btn-secondary" onClick={() => setAuthMode('selection')} style={{ width: '100%', marginTop: '1rem' }}>Back</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
