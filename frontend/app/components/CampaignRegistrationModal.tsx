'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './CampaignCarousel.module.css'; // We'll put styles in one file

// Dynamically import DonorMap to avoid SSR issues
const DonorMap = dynamic(() => import('./DonorMap'), {
    ssr: false,
    loading: () => <p>Loading map...</p>,
});

interface CampaignRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: {
        id: string;
        title: string;
        date: string;
        location: string;
        lat: number;
        lng: number;
    } | null;
}

export default function CampaignRegistrationModal({ isOpen, onClose, campaign }: CampaignRegistrationModalProps) {
    const [step, setStep] = useState<1 | 2>(1); // 1: Form, 2: Success & Map
    const [formData, setFormData] = useState({ name: '', phone: '', bloodGroup: 'A+' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !campaign) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate an API call
        await new Promise(r => setTimeout(r, 1000));
        setIsSubmitting(false);
        setStep(2);
    };

    const handleClose = () => {
        setStep(1);
        setFormData({ name: '', phone: '', bloodGroup: 'A+' });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
                
                {step === 1 ? (
                    <div className={styles.registrationForm}>
                        <h2 className="heading-gradient-red" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Register for {campaign.title}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Date: {campaign.date} <br/> Location: {campaign.location}
                        </p>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <input 
                                    type="tel" 
                                    required 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Blood Group</label>
                                <select 
                                    value={formData.bloodGroup}
                                    onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '1rem' }}>
                                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className={styles.successView}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                            <h2 style={{ color: '#10B981', marginBottom: '0.5rem' }}>Registration Successful!</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Thank you, {formData.name}. We look forward to seeing you at {campaign.location}.
                            </p>
                        </div>
                        
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <DonorMap 
                                center={{ lat: campaign.lat, lng: campaign.lng }}
                                markers={[{
                                    id: campaign.id,
                                    type: 'hospital',
                                    lat: campaign.lat,
                                    lng: campaign.lng,
                                    label: campaign.title,
                                }]}
                                zoom={15}
                                height="250px"
                            />
                        </div>
                        <button onClick={handleClose} className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
