'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, X, ImageIcon } from 'lucide-react';
import { savePhoto, deletePhoto } from '@/lib/field-session';

interface PhotoCaptureProps {
  sessionId: string;
  indicatorId: string;
  maxPhotos?: number;
}

export default function PhotoCapture({ sessionId, indicatorId, maxPhotos = 3 }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<{ photoId: string; url: string; timestamp: string }[]>([]);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = useCallback(async () => {
    if (photos.length >= maxPhotos) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      setCapturing(true);

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;

      const doCapture = async () => {
        ctx.drawImage(video, 0, 0, 640, 480);
        stream.getTracks().forEach((t) => t.stop());
        setCapturing(false);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const blob = await (await fetch(dataUrl)).blob();
        const result = await savePhoto(photoId, sessionId, indicatorId, blob);
        if (result.success) {
          setPhotos((prev) => [...prev, { photoId, url: dataUrl, timestamp: new Date().toISOString() }]);
        }
      };

      setTimeout(doCapture, 100);
    } catch {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  }, [photos.length, maxPhotos, sessionId, indicatorId]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const blob = file;
    const result = await savePhoto(photoId, sessionId, indicatorId, blob);
    if (result.success) {
      const url = URL.createObjectURL(blob);
      setPhotos((prev) => [...prev, { photoId, url, timestamp: new Date().toISOString() }]);
    }
    e.target.value = '';
  }, [sessionId, indicatorId]);

  const handleRemove = useCallback(async (photoId: string) => {
    await deletePhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.photoId !== photoId));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#1a1a2e]/70">Photos</label>
        <span className="text-xs text-[#1a1a2e]/30">{photos.length}/{maxPhotos}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {photos.map((p) => (
          <div key={p.photoId} className="relative">
            <img src={p.url} alt="Capture" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
            <button onClick={() => handleRemove(p.photoId)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <>
            <button
              onClick={handleCapture}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              aria-label="Capture photo"
            >
              <Camera className="w-6 h-6 text-emerald-600/40" />
              <span className="text-[10px] text-emerald-600/40">Capture</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              aria-label="Upload photo"
            >
              <ImageIcon className="w-6 h-6 text-emerald-600/40" />
              <span className="text-[10px] text-emerald-600/40">Upload</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}