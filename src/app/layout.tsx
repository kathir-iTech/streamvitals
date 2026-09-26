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
      <body className="min-h-full flex flex-col bg-[#ffffff]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0d9b6e] focus:text-white focus:rounded">
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
              <Link href="/" className="text-[rgba(0,0,0,0.5)] hover:text-black transition-colors">Home</Link>
              <Link href="/field" className="text-[rgba(0,0,0,0.5)] hover:text-black transition-colors">Field Companion</Link>
              <Link href="/field" className="nav-pill">Log in →</Link>
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
