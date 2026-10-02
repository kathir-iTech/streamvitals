import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import ErrorBoundary from "@/components/ErrorBoundary";
import Telemetry from "@/components/Telemetry";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamVitals — OneAquaHealth IEEE Global Hackathon 2026",
  description: "Field companion for OneAquaHealth stream monitoring: guided observations with deterministic, auditable assessment. AI may explain — AI never scores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fc]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0a7d58] focus:text-white focus:rounded">
          Skip to main content
        </a>
        <nav className="bg-white border-b border-[rgba(0,0,0,0.06)] px-6 py-3" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="StreamVitals home">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <span className="text-sm font-black text-white">S</span>
              </div>
              <span className="text-lg font-bold text-black tracking-tight font-['Space_Grotesk']">StreamVitals</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-[rgba(0,0,0,0.62)] hover:text-black transition-colors">Home</Link>
              <Link href="/field" className="text-[rgba(0,0,0,0.62)] hover:text-black transition-colors">Field Companion</Link>
              <Link href="/about" className="text-[rgba(0,0,0,0.62)] hover:text-black transition-colors">How it works</Link>
            </div>
          </div>
        </nav>
        <main id="main-content" className="flex-1" role="main">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <footer className="bg-white border-t border-[rgba(0,0,0,0.06)] px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[rgba(0,0,0,0.62)]">
            <p>
              StreamVitals — OneAquaHealth IEEE Global Hackathon 2026, Track 3.
              Deterministic assessment (streamvitals-assessment/1.0.0) — AI never scores.
            </p>
            <nav aria-label="Footer" className="flex items-center gap-5">
              <Link href="/about" className="hover:text-black transition-colors">How it works</Link>
              <Link href="/provenance" className="hover:text-black transition-colors">Provenance</Link>
              <a href="https://doi.org/10.5281/zenodo.20345207" className="hover:text-black transition-colors">Factsheets (DOI)</a>
              <a href="https://github.com/kathir-iTech/streamvitals" className="hover:text-black transition-colors">GitHub</a>
            </nav>
          </div>
        </footer>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(function () {}); }`}
        </Script>
        <Telemetry />
      </body>
    </html>
  );
}
