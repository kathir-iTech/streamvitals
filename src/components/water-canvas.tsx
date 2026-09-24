'use client';

import { useEffect, useRef } from 'react';
import { AnimationEngine, Particle, createGlow } from '@/lib/animation-engine';

interface WaterCanvasProps {
  className?: string;
  particleCount?: number;
  color?: string;
  speed?: number;
}

export default function WaterCanvas({ className = '', particleCount = 80, color = 'rgba(45, 212, 191, 0.5)', speed = 1 }: WaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AnimationEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    engineRef.current = new AnimationEngine(canvas, (ctx, engine) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = engine.getTime() * speed;

      // Create wave layers
      for (let layer = 0; layer < 3; layer++) {
        const amp = 20 - layer * 5;
        const freq = 0.008 + layer * 0.003;
        const yOff = h * 0.5 + layer * 40;
        const alpha = 0.08 - layer * 0.02;

        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const y = yOff + Math.sin(x * freq + t * (1 + layer * 0.3)) * amp + Math.sin(x * freq * 0.5 + t * 0.7) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const r = layer === 0 ? 45 : layer === 1 ? 16 : 59;
        const g = layer === 0 ? 212 : layer === 1 ? 185 : 246;
        const b = layer === 0 ? 191 : layer === 1 ? 129 : 246;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      // Glow spots
      const time = engine.getTime();
      for (let i = 0; i < 3; i++) {
        const gx = (w * 0.3) + Math.sin(time * 0.5 + i * 2) * w * 0.2;
        const gy = h * 0.3 + Math.cos(time * 0.3 + i) * h * 0.1;
        createGlow(ctx, gx, gy, 120 + Math.sin(time + i) * 30, `rgba(45, 212, 191, ${0.03 + Math.sin(time + i) * 0.02})`);
      }
    }, particleCount);

    return () => { engineRef.current?.destroy(); };
  }, [particleCount, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
}
