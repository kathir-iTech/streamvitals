'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollObserver(options?: { threshold?: number; rootMargin?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: options?.threshold ?? 0.1, rootMargin: options?.rootMargin ?? '0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function useCountUp(end: number, duration = 1500, startOnView = true): { ref: React.RefObject<HTMLDivElement>; current: number } {
  const [current, setCurrent] = useState(0);
  const { ref, isVisible } = useScrollObserver();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isVisible || !startOnView) return;
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(end * eased));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, startOnView]);

  return { ref: ref as React.RefObject<HTMLDivElement>, current };
}
