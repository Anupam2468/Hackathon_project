'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './DonorMap.module.css';

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    type: 'donor' | 'hospital' | 'user';
    label: string;
    bloodGroup?: string;
    distance?: number;
    eta?: string;
    verified?: boolean;
}

interface DonorMapProps {
    center: { lat: number; lng: number };
    markers: MapMarker[];
    zoom?: number;
    height?: string;
    onMarkerClick?: (marker: MapMarker) => void;
}

export default function DonorMap({ center, markers, zoom = 13, height = '500px', onMarkerClick }: DonorMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Dynamically import Leaflet (no SSR)
        import('leaflet').then((L) => {
            // Import Leaflet CSS
            if (!document.querySelector('link[href*="leaflet"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Wait for CSS to load
            setTimeout(() => {
                if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

                const map = L.map(mapRef.current, {
                    zoomControl: true,
                    attributionControl: true,
                }).setView([center.lat, center.lng], zoom);

                // Dark-style OpenStreetMap tiles
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
                    maxZoom: 19,
                }).addTo(map);

                mapInstanceRef.current = map;

                // Add markers
                const bounds: [number, number][] = [];

                markers.forEach((marker) => {
                    let icon;

                    if (marker.type === 'user') {
                        // Blue pulsing circle for user
                        icon = L.divIcon({
                            className: 'user-location-marker',
                            html: `<div style="position:relative;width:24px;height:24px;">
                                <div style="position:absolute;top:0;left:0;width:24px;height:24px;border-radius:50%;background:rgba(59,130,246,0.25);animation:userPulseAnim 2s ease-out infinite;"></div>
                                <div style="position:absolute;top:6px;left:6px;width:12px;height:12px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 0 10px rgba(59,130,246,0.6);"></div>
                            </div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                        });
                    } else if (marker.type === 'donor') {
                        // Red drop pin for donors
                        icon = L.divIcon({
                            className: 'donor-marker',
                            html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
                                <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#E11D48,#F43F5E);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(225,29,72,0.5);border:2px solid rgba(255,255,255,0.3);">
                                    <span style="transform:rotate(45deg);color:#fff;font-size:11px;font-weight:800;">${marker.bloodGroup || '🩸'}</span>
                                </div>
                            </div>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 36],
                            popupAnchor: [0, -36],
                        });
                    } else {
                        // Green marker for hospitals
                        icon = L.divIcon({
                            className: 'hospital-marker',
                            html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
                                <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#059669,#10B981);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(16,185,129,0.5);border:2px solid rgba(255,255,255,0.3);">
                                    <span style="transform:rotate(45deg);font-size:16px;">🏥</span>
                                </div>
                            </div>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 36],
                            popupAnchor: [0, -36],
                        });
                    }

                    const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

                    // Build popup content
                    if (marker.type !== 'user') {
                        const badgeClass = marker.type === 'donor' ? 'donor' : 'hospital';
                        const badgeColor = marker.type === 'donor' ? '#F43F5E' : '#10B981';
                        const bgColor = marker.type === 'donor' ? 'rgba(225,29,72,0.12)' : 'rgba(16,185,129,0.12)';
                        
                        let popupHtml = `
                            <div style="padding:0.5rem 0.25rem;min-width:200px;font-family:'Inter',sans-serif;">
                                <h4 style="font-family:'Outfit',sans-serif;font-size:1rem;margin:0 0 0.5rem 0;display:flex;align-items:center;gap:0.5rem;">
                                    ${marker.label}
                                    ${marker.verified ? '<span style="color:#3B82F6;font-size:14px;">✓</span>' : ''}
                                </h4>
                                <span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:700;background:${bgColor};color:${badgeColor};">
                                    ${marker.type === 'donor' ? '🩸 ' + marker.bloodGroup : '🏥 Hospital'}
                                </span>`;

                        if (marker.distance !== undefined) {
                            popupHtml += `
                                <div style="display:flex;align-items:center;gap:0.35rem;margin-top:0.6rem;padding-top:0.5rem;border-top:1px solid rgba(255,255,255,0.08);font-size:0.85rem;font-weight:500;">
                                    <span>📍 ${marker.distance} km away</span>
                                    ${marker.eta ? '<span style="color:var(--text-secondary);">• 🚗 ${marker.eta}</span>' : ''}
                                </div>`;
                        }

                        popupHtml += `</div>`;

                        leafletMarker.bindPopup(popupHtml, {
                            maxWidth: 280,
                            className: 'custom-popup'
                        });
                    } else {
                        leafletMarker.bindPopup(`
                            <div style="padding:0.25rem;font-family:'Inter',sans-serif;text-align:center;">
                                <strong style="font-family:'Outfit',sans-serif;">📍 Your Location</strong>
                            </div>
                        `);
                    }

                    if (onMarkerClick && marker.type !== 'user') {
                        leafletMarker.on('click', () => onMarkerClick(marker));
                    }

                    bounds.push([marker.lat, marker.lng]);
                });

                // Auto-fit bounds if multiple markers
                if (bounds.length > 1) {
                    map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 14 });
                }

                // Add CSS animation for user pulse
                if (!document.querySelector('#leaflet-custom-animations')) {
                    const style = document.createElement('style');
                    style.id = 'leaflet-custom-animations';
                    style.textContent = `
                        @keyframes userPulseAnim {
                            0% { transform: scale(1); opacity: 0.8; }
                            100% { transform: scale(3); opacity: 0; }
                        }
                        .user-location-marker, .donor-marker, .hospital-marker {
                            background: transparent !important;
                            border: none !important;
                        }
                    `;
                    document.head.appendChild(style);
                }

                setIsLoaded(true);
            }, 200);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when they change
    useEffect(() => {
        if (!mapInstanceRef.current || !isLoaded) return;

        const map = mapInstanceRef.current;
        const currentCenter = map.getCenter();
        
        // Only recenter if center has changed significantly
        if (Math.abs(currentCenter.lat - center.lat) > 0.001 || Math.abs(currentCenter.lng - center.lng) > 0.001) {
            map.setView([center.lat, center.lng], zoom);
        }
    }, [center, zoom, isLoaded]);

    return (
        <div className={styles.mapWrapper} style={{ height }}>
            {!isLoaded && (
                <div className={styles.mapLoading}>
                    <div className={styles.loadingPulse}></div>
                    <p>Loading map...</p>
                </div>
            )}
            <div
                ref={mapRef}
                className={styles.mapContainer}
                style={{ height }}
            />
        </div>
    );
}
