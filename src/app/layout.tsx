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
      <body className="min-h-full flex flex-col bg-[#070d1a]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded">
          Skip to main content
        </a>
        <nav className="bg-[#0a1628]/90 backdrop-blur-xl border-b border-emerald-500/10 px-6 py-3" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="StreamVitals home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-lg font-black text-white">S</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">StreamVitals</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full ml-2 font-medium">IEEE 2026</span>
              </div>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link href="/guided" className="px-3 py-2 text-emerald-300 hover:text-white hover:bg-emerald-500/10 rounded-lg transition-all font-medium">
                Assessment
              </Link>
              <Link href="/map" className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium">
                Map
              </Link>
              <Link href="/ai-copilot" className="px-3 py-2 text-white/50 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all font-medium">
                AI Copilot
              </Link>
              <Link href="/predict" className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium">
                Predictions
              </Link>
              <Link href="/report" className="px-3 py-2 text-white/50 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all font-medium">
                Report
              </Link>
              <Link href="/citizen" className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium">
                Citizen
              </Link>
              <span className="ml-3 flex items-center gap-2 text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                AI-Powered
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