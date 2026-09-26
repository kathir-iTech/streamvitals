# BOLT PROMPT 1: FOUNDATION & CONFIGURATION
Paste this first into Bolt AI.

Create the following project for the IEEE OneAquaHealth Hackathon 2026:

## package.json
```json
{"name":"streamvitals","version":"1.0.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start","lint":"eslint","test":"node run-tests.js"},"dependencies":{"next":"^14.2.5","react":"^18.3.1","react-dom":"^18.3.1","lucide-react":"^0.400.0","zod":"^3.24.0"},"devDependencies":{"@types/node":"^20.14.0","@types/react":"^18.3.3","@types/react-dom":"^18.3.0","typescript":"^5.4.5","tailwindcss":"^4.0.0","@tailwindcss/postcss":"^4.0.0","eslint":"^9.0.0","eslint-config-next":"14.2.5","vitest":"^2.0.0"}}
```

## tsconfig.json
```json
{"compilerOptions":{"target":"ES2017","lib":["dom","dom.iterable","esnext"],"allowJs":true,"skipLibCheck":true,"strict":true,"noEmit":true,"esModuleInterop":true,"module":"esnext","moduleResolution":"bundler","resolveJsonModule":true,"isolatedModules":true,"jsx":"react-jsx","incremental":true,"plugins":[{"name":"next"}],"paths":{"@/*":["./src/*"]}},"include":["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"],"exclude":["node_modules"]}
```

## next.config.ts
```typescript
import type { NextConfig } from 'next';
const nextConfig: NextConfig = { reactStrictMode: true, swcMinify: true, poweredByHeader: false, output: 'standalone' };
export default nextConfig;
```

## vercel.json
```json
{"framework":"nextjs","regions":["iad1"],"buildCommand":"next build","devCommand":"next dev","installCommand":"npm install --force --legacy-peer-deps","env":{"NEXT_PUBLIC_APP_NAME":"StreamVitals","GROQ_API_KEY":"@groq_api_key"}}
```

## tailwind.config.ts (or equivalent for Tailwind 4)
Configure Tailwind CSS 4 with @import "tailwindcss" in globals.css. Use @layer base with CSS custom properties.

## src/app/globals.css
```css
@import "tailwindcss";
:root { --bg: #f8f9fc; --card: #ffffff; --border: #e5e7eb; --accent: #059669; --accent-hover: #047857; --text-primary: #000000; --text-secondary: rgba(0,0,0,0.6); --text-muted: rgba(0,0,0,0.4); --coral: #e85d3a; }
body { background: var(--bg); color: var(--text-primary); font-family: 'DM Sans', system-ui, sans-serif; font-size: 16px; -webkit-font-smoothing: antialiased; }
h1,h2,h3,h4,h5,h6 { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800; letter-spacing: -0.03em; }
.btn-pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--accent); color: white; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border: none; border-radius: 9999px; padding: 12px 32px; font-size: 16px; cursor: pointer; }
.btn-pill:hover { background: var(--accent-hover); }
.btn-pill:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-pill-outline { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: transparent; color: var(--accent); font-weight: 600; font-family: 'Space Grotesk', sans-serif; border: 2px solid var(--accent); border-radius: 9999px; padding: 10px 28px; font-size: 15px; cursor: pointer; }
.btn-pill-outline:hover { background: var(--accent); color: white; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
@media print { body { background: white; } .card { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; } .no-print { display: none; } }
.animate-fadeInUp { animation: fadeInUp 0.5s ease-out both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
```

## src/app/layout.tsx
```typescript
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "StreamVitals — OneAquaHealth IEEE Global Hackathon 2026", description: "Field data collection tool for OneAquaHealth stream monitoring volunteers." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className="h-full antialiased"><body className="min-h-full flex flex-col bg-[#f8f9fc]"><nav className="bg-white border-b border-gray-200 px-6 py-3"><div className="max-w-4xl mx-auto flex items-center justify-between"><span className="text-lg font-bold text-black">StreamVitals</span><span className="text-xs text-gray-500">OneAquaHealth IEEE 2026</span></div></nav><main id="main-content" className="flex-1" role="main">{children}</main></body></html>);
}
```

## src/app/page.tsx
```typescript
'use client';
export { default } from './field/page';
```

CONSTRAINTS:
- Light theme ONLY: #f8f9fc background, #ffffff cards, #e5e7eb borders, #059669 emerald accents
- Do NOT use dark glassmorphism, dark backgrounds, or particle animations
- Use DM Sans for body, Space Grotesk for headings
- All buttons must be pill-shaped (border-radius: 9999px)
