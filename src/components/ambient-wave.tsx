'use client';

import { useEffect, useRef } from 'react';

interface AmbientWaveProps {
  color?: string;
  speed?: number;
  amplitude?: number;
}

export default function AmbientWave({ color = 'rgba(45, 212, 191, 0.08)', speed = 1, amplitude = 40 }: AmbientWaveProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let time = 0;
    const animate = () => {
      time += 0.02 * speed;
      const paths = svg.querySelectorAll('path.wave-path');
      paths.forEach((path, i) => {
        const amp = amplitude - i * 10;
        const freq = 0.005 + i * 0.002;
        const yOff = 100 + i * 30;
        const d = Array.from({ length: 100 }, (_, x) => {
          const px = (x / 99) * 100;
          const py = yOff + Math.sin(px * freq + time + i * 0.5) * amp + Math.sin(px * freq * 0.5 + time * 0.7 + i) * (amp * 0.4);
          return `${x === 0 ? 'M' : 'L'}${px},${py}`;
        }).join(' ');
        (path as SVGPathElement).setAttribute('d', d + ' L100,200 L0,200 Z');
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, [color, speed, amplitude]);

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(45, 212, 191, 0.1)" />
          <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <path key={i} className="wave-path" fill={`rgba(45, 212, 191, ${0.06 - i * 0.015})`} />
      ))}
    </svg>
  );
}
