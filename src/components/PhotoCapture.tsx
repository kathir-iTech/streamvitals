'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X, ImageIcon } from 'lucide-react';
import { savePhoto, deletePhoto, getSessionPhotos } from '@/lib/field-session';

interface PhotoCaptureProps {
  sessionId: string;
  indicatorId: string;
  maxPhotos?: number;
  onPhotosChange?: (photoIds: string[]) => void;
}

export default function PhotoCapture({ sessionId, indicatorId, maxPhotos = 3, onPhotosChange }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<{ photoId: string; url: string; timestamp: string }[]>([]);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyChange = useCallback((newPhotos: { photoId: string; url: string; timestamp: string }[]) => {
    onPhotosChange?.(newPhotos.map((p) => p.photoId));
  }, [onPhotosChange]);

  useEffect(() => {
    if (!sessionId) return;
    getSessionPhotos(sessionId).then((savedPhotos) => {
      const indicatorPhotos = savedPhotos
        .filter((p) => p.indicatorId === indicatorId)
        .map((p) => ({ photoId: p.photoId, url: p.dataUrl, timestamp: p.timestamp }));
      if (indicatorPhotos.length > 0) {
        setPhotos(indicatorPhotos);
        notifyChange(indicatorPhotos);
      }
    });
  }, [sessionId, indicatorId, notifyChange]);

  const handleCapture = useCallback(async () => {
    setPhotos((currentPhotos) => {
      if (currentPhotos.length >= maxPhotos) return currentPhotos;
      (async () => {
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
              const newPhotos = [...currentPhotos, { photoId, url: dataUrl, timestamp: new Date().toISOString() }];
              setPhotos(newPhotos);
              notifyChange(newPhotos);
            }
          };
          setTimeout(doCapture, 100);
        } catch {
          if (fileInputRef.current) fileInputRef.current.click();
        }
      })();
      return currentPhotos;
    });
  }, [maxPhotos, sessionId, indicatorId, notifyChange]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const blob = file;
    const result = await savePhoto(photoId, sessionId, indicatorId, blob);
    if (result.success) {
      const url = URL.createObjectURL(blob);
      setPhotos((prev) => {
        const newPhotos = [...prev, { photoId, url, timestamp: new Date().toISOString() }];
        notifyChange(newPhotos);
        return newPhotos;
      });
    }
    e.target.value = '';
  }, [sessionId, indicatorId, notifyChange]);

  const handleRemove = useCallback(async (photoId: string) => {
    await deletePhoto(photoId);
    setPhotos((prev) => {
      const newPhotos = prev.filter((p) => p.photoId !== photoId);
      notifyChange(newPhotos);
      return newPhotos;
    });
  }, [notifyChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[rgba(0,0,0,0.62)]">Photos</label>
        <span className="text-xs text-[rgba(0,0,0,0.55)]">{photos.length}/{maxPhotos}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {photos.map((p) => (
          <div key={p.photoId} className="relative">
            <Image src={p.url} alt="Capture" width={144} height={144} unoptimized className="w-36 h-36 object-cover rounded-2xl border border-[rgba(0,0,0,0.08)]" />
            <button onClick={() => handleRemove(p.photoId)} className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs hover:bg-[rgba(0,0,0,0.7)] transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <>
            <button onClick={handleCapture} disabled={capturing} className="w-20 h-20 rounded-xl border-2 border-dashed border-[rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1 hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.04)] transition-all" aria-label="Capture photo">
              <Camera className="w-5 h-5 text-[#0a7d58]" />
              <span className="text-[10px] text-[#0a7d58]">Capture</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" suppressHydrationWarning />
            <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-[rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1 hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.04)] transition-all" aria-label="Upload photo">
              <ImageIcon className="w-5 h-5 text-[#0a7d58]" />
              <span className="text-[10px] text-[#0a7d58]">Upload</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}