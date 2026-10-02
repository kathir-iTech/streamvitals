'use client';

import { Component, type ReactNode } from 'react';
import { reportClientError } from '@/lib/telemetry';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Short reference code so a tester can quote it in feedback without
// pasting a stack trace.
function refCode(message: string): string {
  let hash = 5381;
  for (let i = 0; i < message.length; i++) hash = ((hash << 5) + hash + message.charCodeAt(i)) >>> 0;
  return hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    reportClientError('error-boundary', error);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <div role="alert" data-testid="error-boundary" className="max-w-xl mx-auto mt-16 mb-16 p-8 bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl text-center">
          <h2 className="text-xl font-black text-black mb-2">This screen hit an error</h2>
          <p className="text-sm text-[rgba(0,0,0,0.62)] mb-1">It was reported to the developer. Your saved session data stays on this device.</p>
          <p className="text-xs text-[rgba(0,0,0,0.45)] mb-5 font-mono" data-testid="error-ref">Reference: {refCode(error.message)}</p>
          <div className="flex gap-3 justify-center">
            <button type="button" onClick={() => this.setState({ error: null })} className="btn-pill-outline text-sm">Try again</button>
            <button type="button" onClick={() => window.location.reload()} className="btn-pill-accent text-sm">Reload page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
