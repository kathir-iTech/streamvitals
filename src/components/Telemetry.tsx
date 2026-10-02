'use client';

import { useEffect } from 'react';
import { reportClientError, reportVital } from '@/lib/telemetry';

// Mounts once in the root layout. Captures uncaught errors, unhandled promise
// rejections, and two layout metrics (LCP, CLS), reported when the page goes
// to the background. Renders nothing.
export default function Telemetry() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      reportClientError('window', e.error instanceof Error ? e.error : e.message);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      reportClientError('rejection', e.reason);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    let lcp = 0;
    let cls = 0;
    let lcpObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;
    try {
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) lcp = last.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Metric unsupported — errors still reported.
    }
    try {
      clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as unknown as Array<PerformanceEntry & { hadRecentInput: boolean; value: number }>;
        for (const entry of entries) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') cls += entry.value;
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Metric unsupported — errors still reported.
    }

    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      if (lcp > 0) reportVital('LCP', lcp);
      if (cls > 0) reportVital('CLS', cls);
      document.removeEventListener('visibilitychange', onHide);
    };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      document.removeEventListener('visibilitychange', onHide);
      lcpObserver?.disconnect();
      clsObserver?.disconnect();
    };
  }, []);

  return null;
}
