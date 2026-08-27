'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    direction?: 'up' | 'left' | 'right' | 'scale';
    delay?: number;
    threshold?: number;
    className?: string;
}

export default function ScrollReveal({
    children,
    direction = 'up',
    delay = 0,
    threshold = 0.15,
    className = '',
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('revealed');
                    observer.unobserve(el);
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    const directionClass =
        direction === 'left'
            ? 'reveal-left'
            : direction === 'right'
                ? 'reveal-right'
                : direction === 'scale'
                    ? 'reveal-scale'
                    : 'reveal';

    return (
        <div
            ref={ref}
            className={`${directionClass} ${className}`}
            style={{ animationDelay: delay ? `${delay}s` : undefined }}
        >
            {children}
        </div>
    );
}
