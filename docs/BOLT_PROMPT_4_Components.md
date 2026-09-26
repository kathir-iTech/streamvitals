# BOLT PROMPT 4: REACT COMPONENTS
Paste this fourth into Bolt AI.

Create these components in src/components/:

## src/components/RiverProgress.tsx
```typescript
'use client';
const LABELS: Record<string, string> = { 'BMI-01': 'Macroinvertebrates', 'BIR-04': 'Birds', 'INV-11': 'Invasive Plants', 'FCL-06': 'Fecal Coliforms', 'DIA-10': 'Diatoms' };
interface RiverProgressProps { currentIndex: number; total: number; completedIds: string[]; labOnlyIds: string[]; }
export default function RiverProgress({ currentIndex, total, completedIds, labOnlyIds }: RiverProgressProps) {
  const progress = ((currentIndex + 1) / total) * 100;
  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Field Progress</span><span className="text-sm font-bold text-[#059669]">{currentIndex + 1} / {total}</span></div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#059669] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <div className="flex justify-between">
        {Array.from({ length: total }, (_, i) => {
          const id = ['BMI-01','BIR-04','INV-11','FCL-06','DIA-10'][i];
          const isComplete = completedIds.includes(id); const isCurrent = i === currentIdx; const isLab = labOnlyIds.includes(id);
          return (<div key={id} className="flex flex-col items-center gap-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isComplete || isCurrent ? 'bg-[#059669] text-white' : isLab ? 'bg-orange-50 border border-orange-200 text-orange-500' : 'bg-gray-100 border border-gray-200 text-gray-400'}`}>{isComplete ? '✓' : isLab ? '🧪' : i + 1}</div><span className={`text-[10px] ${isCurrent ? 'font-bold text-black' : 'text-gray-400'}`}>{LABELS[id] || id}</span></div>);
        })}
      </div>
    </div>
  );
}
```

## src/components/PhotoCapture.tsx
```typescript
'use client';
import { useRef, useState, useCallback } from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { savePhoto, downsampleImage } from '@/lib/field-session';
interface PhotoCaptureProps { sessionId: string; indicatorId: string; maxPhotos?: number; }
export default function PhotoCapture({ sessionId, indicatorId, maxPhotos = 3 }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<Array<{ photoId: string; url: string; timestamp: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCapture = useCallback(async () => {
    if (photos.length >= maxPhotos) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video'); video.srcObject = stream; video.play();
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480; const ctx = canvas.getContext('2d')!;
      setTimeout(() => { ctx.drawImage(video, 0, 0, 640, 480); stream.getTracks().forEach((t) => t.stop()); const dataUrl = canvas.toDataURL('image/jpeg', 0.7); const blob = await downsampleImage(dataUrl); const photoId = 'photo-' + Date.now(); savePhoto(photoId, sessionId, indicatorId, blob); setPhotos(prev => [...prev, { photoId, url: dataUrl, timestamp: new Date().toISOString() }]); }, 100);
    } catch { if (fileInputRef.current) fileInputRef.current.click(); }
  }, [photos.length, maxPhotos, sessionId, indicatorId]);
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; const dataUrl = URL.createObjectURL(file); const photoId = 'photo-' + Date.now(); await savePhoto(photoId, sessionId, indicatorId, file); setPhotos(prev => [...prev, { photoId, url: dataUrl, timestamp: new Date().toISOString() }]); e.target.value = '';
  }, [sessionId, indicatorId]);
  return (
    <div className="mb-4"><label className="text-sm font-semibold text-gray-600 block mb-2">Photos ({photos.length}/{maxPhotos})</label><div className="flex gap-3 flex-wrap">
      {photos.map((p) => (<div key={p.photoId} className="relative"><img src={p.url} alt="Capture" className="w-20 h-20 object-cover rounded-xl border border-gray-200" /></div>))}
      {photos.length < maxPhotos && (<> <button onClick={handleCapture} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-[#059669] hover:bg-green-50 transition-all"><Camera className="w-5 h-5 text-[#059669]/50" /><span className="text-[10px] text-[#059669]/50">Capture</span></button> <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" /> <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-[#059669] hover:bg-green-50 transition-all"><ImageIcon className="w-5 h-5 text-[#059669]/50" /><span className="text-[10px] text-[#059669]/50">Upload</span></button> </>)}
    </div></div>
  );
}
```

## src/components/CountdownTimer.tsx
```typescript
'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
interface CountdownTimerProps { seconds: number; onComplete?: () => void; }
export default function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => { setRemaining(seconds); }, [seconds]);
  useEffect(() => { if (remaining <= 0) { onComplete?.(); return; } const timer = setInterval(() => { setRemaining(prev => { if (prev <= 1) { clearInterval(timer); onComplete?.(); return 0; } return prev - 1; }); }, 1000); return () => clearInterval(timer); }, [remaining, onComplete]);
  const minutes = Math.floor(remaining / 60); const secs = remaining % 60;
  return (<div className="card mb-6"><div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#059669]" /><div className="flex-1"><div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2"><div className="h-full bg-[#059669] rounded-full transition-all duration-[1s] linear" style={{ width: `${(remaining / seconds) * 100}%` }} /></div><span className="text-xl font-mono font-bold text-black">{minutes}:{secs.toString().padStart(2, '0')}</span></div></div></div>);
}
```

## src/components/BoundedAssistant.tsx
```typescript
'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Bot, Shield, WifiOff, Loader2, Send } from 'lucide-react';
export default function BoundedAssistant({ indicatorId }: { indicatorId: string }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false); const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = () => setIsOnline(navigator.onLine); window.addEventListener('online', h); window.addEventListener('offline', () => setIsOnline(false)); return () => { window.removeEventListener('online', h); window.removeEventListener('offline', () => setIsOnline(false)); }; }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]); setInput(''); setLoading(true);
    try { const res = await fetch('/api/ai/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: input }) }); const data = await res.json(); setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No response.' }]); } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Offline mode: Using factsheet guidance.' }]); } finally { setLoading(false); }
  }, [input, loading]);
  return (
    <aside className="w-full bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold flex items-center gap-2"><Bot className="w-4 h-4 text-[#059669]" /> Field Assistant</h3><div className="flex items-center gap-2"><Shield className="w-3 h-3 text-[#059669]" /><span className="text-[10px] text-[#059669] font-semibold">Bounded Scope</span></div></div>
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">{messages.map((m, i) => (<div key={i} className={`rounded-lg p-2 text-xs ${m.role === 'user' ? 'bg-green-50 text-black ml-auto' : 'bg-gray-50 text-gray-700'}`}>{m.content}</div>))}<div ref={messagesEndRef} /></div>
      {!isOnline && <div className="mb-2 flex items-center gap-2"><WifiOff className="w-3 h-3 text-orange-500" /><span className="text-[10px] text-orange-500">Offline — showing factsheet reference</span></div>}
      <div className="flex gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about this indicator..." disabled={loading} className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#059669] focus:outline-none" /><button onClick={handleSend} disabled={loading || !input.trim()} className="px-3 py-2 bg-[#059669] text-white rounded-full hover:bg-[#047857] disabled:opacity-40">{loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}</button></div>
    </aside>
  );
}
```

## src/components/ExportButton.tsx
```typescript
'use client';
import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { getSession } from '@/lib/field-session';
interface ExportButtonProps { sessionId: string; }
export default function ExportButton({ sessionId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const generateJSON = useCallback(async () => { setExporting(true); const result = await getSession(sessionId); if (!result.data) return; const exportData = { exportTimestamp: new Date().toISOString(), framework: 'OneAquaHealth Key Indicators', doi: '10.5281/zenodo.20345207', session: result.data }; const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'streamvitals-' + sessionId + '.json'; a.click(); URL.revokeObjectURL(a.href); setExporting(false); }, [sessionId]);
  const generateCSV = useCallback(async () => { setExporting(true); const result = await getSession(sessionId); if (!result.data) return; const headers = ['indicatorId','name','category','is_lab_only','selectedState','notes']; const rows = Object.entries(result.data.observations || {}).map(([id, obs]: [string, any]) => [id, obs.indicatorId || id, obs.type || '', obs.selectedState || '', obs.isLabSample ? 'pending_lab_analysis' : 'complete', obs.notes || ''].join(',')); const csv = [headers.join(','), ...rows].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'streamvitals-' + sessionId + '.csv'; a.click(); URL.revokeObjectURL(a.href); setExporting(false); }, [sessionId]);
  return (<div className="flex gap-3 flex-wrap"><button onClick={generateJSON} disabled={exporting} className="btn-pill text-sm py-2 px-4"><Download className="w-4 h-4" /> Export JSON</button><button onClick={generateCSV} disabled={exporting} className="btn-pill-outline text-sm py-2 px-4"><Download className="w-4 h-4" /> Export CSV</button></div>);
}
```

CONSTRAINTS:
- Light theme ONLY (#f8f9fc, #ffffff, #e5e7eb, #059669)
- No dark glassmorphism, no dark backgrounds
- No tier ratings, no diagnostic text
- All buttons pill-shaped
- BoundedAssistant calls /api/ai/assistant endpoint
- PhotoCapture downsamples to <1MB via downsampleImage()
