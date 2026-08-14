'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './CampaignCarousel.module.css';
import CampaignRegistrationModal from './CampaignRegistrationModal';

const CAMPAIGNS = [
    {
        id: 'camp1',
        title: 'Mega Blood Drive',
        date: 'Oct 15 - 16, 2026',
        location: 'Apollo Gleneagles Hospitals, Kolkata',
        image: '/campaigns/poster1.jpg',
        lat: 22.5768,
        lng: 88.4037
    },
    {
        id: 'camp2',
        title: 'Save a Life Weekend',
        date: 'Oct 22 - 23, 2026',
        location: 'AIIMS Bhubaneswar',
        image: '/campaigns/poster2.jpg',
        lat: 20.234,
        lng: 85.776
    },
    {
        id: 'camp3',
        title: 'Youth Blood Drive',
        date: 'Nov 5, 2026',
        location: 'Midnapore Medical College',
        image: '/campaigns/poster3.jpg',
        lat: 22.4239,
        lng: 87.3204
    }
];

export default function CampaignCarousel() {
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    return (
        <section className={styles.carouselSection}>
            <div className={styles.carouselHeader}>
                <h2 className="heading-gradient-red">Upcoming Campaigns</h2>
                <p>Register for blood donation camps near you.</p>
            </div>
            
            <div className={styles.marqueeContainer}>
                <div className={styles.marqueeContent}>
                    {/* Render twice for continuous loop effect */}
                    {[...CAMPAIGNS, ...CAMPAIGNS].map((camp, index) => (
                        <div 
                            key={`${camp.id}-${index}`} 
                            className={styles.posterCard}
                            onClick={() => setSelectedCampaign(camp)}
                        >
                            <div className={styles.imageWrapper}>
                                <Image 
                                    src={camp.image} 
                                    alt={camp.title} 
                                    fill 
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div className={styles.posterOverlay}>
                                <h3>{camp.title}</h3>
                                <span>Click to Register</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CampaignRegistrationModal 
                isOpen={!!selectedCampaign} 
                onClose={() => setSelectedCampaign(null)} 
                campaign={selectedCampaign} 
            />
        </section>
    );
}
