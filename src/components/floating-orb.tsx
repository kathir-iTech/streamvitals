'use client';

import { useRef, useEffect, useState } from 'react';

interface FloatingOrbProps {
  className?: string;
  size?: number;
  color?: string;
  speed?: number;
  mouseReact?: boolean;
}

export default function FloatingOrb({ className = '', size = 120, color = 'rgba(45, 212, 191, 0.15)', speed = 1, mouseReact = true }: FloatingOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame: number;
    let t = 0;

    const animate = () => {
      t += 0.01 * speed;
      const x = Math.sin(t) * 30 + (mouseReact ? (mouse.x - 0.5) * 20 : 0);
      const y = Math.cos(t * 0.7) * 20 + (mouseReact ? (mouse.y - 0.5) * 20 : 0);
      setPos({ x, y });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [speed, mouseReact]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: size, height: size,
        background: color,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'none',
      }}
    />
  );
}
