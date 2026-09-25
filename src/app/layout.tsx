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
  description: "Field data collection tool for OneAquaHealth stream monitoring volunteers. Collect real data. No assessment. No verdict.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fc]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0d9b6e] focus:text-white focus:rounded">
          Skip to main content
        </a>
        <nav className="bg-white/90 backdrop-blur-md border-b border-[#e8e8e8] px-6 py-3 shadow-sm" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="StreamVitals home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d9b6e] to-[#0a7d58] flex items-center justify-center shadow-sm shadow-[#0d9b6e]/20">
                <span className="text-lg font-black text-white">S</span>
              </div>
              <div>
                <span className="text-xl font-bold text-[#1a1a2e] tracking-tight">StreamVitals</span>
                <span className="text-[10px] bg-[#0d9b6e]/10 text-[#0d9b6e] px-2 py-0.5 rounded-full ml-2 font-medium">IEEE 2026</span>
              </div>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-2 text-[#0d9b6e] hover:text-[#0a7d58] hover:bg-[#0d9b6e]/5 rounded-lg transition-all font-medium">
                Home
              </Link>
              <Link href="/field" className="px-3 py-2 text-[#1a1a2e]/60 hover:text-[#1a1a2e] hover:bg-[#f0f2f5] rounded-lg transition-all font-medium">
                Field Companion
              </Link>
              <span className="ml-3 flex items-center gap-2 text-xs text-[#1a1a2e]/40 bg-[#f0f2f5] px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#0d9b6e] rounded-full" />
                OneAquaHealth
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
