'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function DonorRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'A+',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate AI Verification Processing
        setTimeout(() => {
            setLoading(false);
            // Store info locally for hackathon purpose
            localStorage.setItem('donorProfile', JSON.stringify({ ...formData, verified: false }));
            router.push('/donor/dashboard');
        }, 2000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h1 className="heading-gradient-red">Donor Registration</h1>
                    <p>Join the LifeFlow network. Your profile will be verified by our AI system.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
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
                            <label>Address (Real-time Location Based)</label>
                            <textarea name="address" required rows={3} placeholder="123 Lifeline Ave, City, Country" onChange={handleChange} />
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
                </form>
            </div>
        </div>
    );
}
