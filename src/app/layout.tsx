import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  description: "AI-Supported Assessment of urban stream health. The deterministic evidence engine evaluates confirmed observations against cited rules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded">
          Skip to main content
        </a>
        <nav className="bg-white border-b border-slate-200 px-6 py-3" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="StreamVitals home">
              <span className="text-xl font-bold text-teal-700">StreamVitals</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/about" className="text-slate-600 hover:text-teal-600 transition-colors">
                How It Works
              </Link>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                AI may interpret input. AI may not adjudicate.
              </span>
            </div>
          </div>
        </nav>
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
