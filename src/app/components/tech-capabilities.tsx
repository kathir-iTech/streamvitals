'use client';

import { useEffect, useState } from 'react';

export function ViewTransition() {
  useEffect(() => {
    if (!document.startViewTransition) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.startViewTransition) return;
      document.startViewTransition(() => {
        target.classList.add('view-transition-active');
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

export function PrefetchLinks() {
  useEffect(() => {
    const links = document.querySelectorAll('a[href]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLElement;
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
              const prefetch = document.createElement('link');
              prefetch.rel = 'prefetch';
              prefetch.href = href;
              prefetch.as = 'document';
              document.head.appendChild(prefetch);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    links.forEach((link) => observer.observe(link));
    return () => observer.disconnect();
  }, []);

  return null;
}

export function CapabilityDetector() {
  const [capabilities, setCapabilities] = useState({
    webgpu: false,
    serviceworker: false,
    webtransport: false,
    viewtransition: false,
    containerqueries: false,
    intersectionobserver: false,
    paymentrequest: false,
    credentials: false,
    clipboard: false,
    geolocation: false,
    notifications: false,
    backgroundsync: false,
    push: false,
    indexeddb: false,
    webusb: false,
    webhid: false,
    webbluetooth: false,
    webxr: false,
  });

  useEffect(() => {
    setCapabilities({
      webgpu: !!(navigator as any).gpu,
      serviceworker: 'serviceWorker' in navigator,
      webtransport: 'connect' in window && 'Transport' in window,
      viewtransition: !!document.startViewTransition,
      containerqueries: CSS.supports('container-type', 'inline-size'),
      intersectionobserver: 'IntersectionObserver' in window,
      paymentrequest: 'PaymentRequest' in window,
      credentials: 'credentials' in navigator,
      clipboard: 'clipboard' in navigator,
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      backgroundsync: 'serviceWorker' in navigator && 'SyncManager' in window,
      push: 'PushManager' in window,
      indexeddb: 'indexedDB' in window,
      webusb: 'usb' in navigator,
      webhid: 'hid' in navigator,
      webbluetooth: 'bluetooth' in navigator,
      webxr: 'xr' in navigator,
    });
  }, []);

  return (
    <div className="sr-only" aria-live="polite" role="status">
      {JSON.stringify(capabilities)}
    </div>
  );
}

export function AdaptiveExperience() {
  const [deviceClass, setDeviceClass] = useState<'high' | 'mid' | 'low'>('high');

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      if (conn.downlink >= 10 && conn.effectiveType === '4g') {
        setDeviceClass('high');
      } else if (conn.downlink >= 3) {
        setDeviceClass('mid');
      } else {
        setDeviceClass('low');
      }
    }
    const handler = () => {
      if (conn) {
        if (conn.downlink >= 10 && conn.effectiveType === '4g') setDeviceClass('high');
        else if (conn.downlink >= 3) setDeviceClass('mid');
        else setDeviceClass('low');
      }
    };
    conn?.addEventListener('change', handler);
    return () => conn?.removeEventListener('change', handler);
  }, []);

  return <div data-device-class={deviceClass} className="sr-only" />;
}