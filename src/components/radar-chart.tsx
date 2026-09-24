'use client';

import { useEffect, useRef, useState } from 'react';

interface RadarChartProps {
  data: { label: string; value: number; max: number; color: string }[];
  size?: number;
  animate?: boolean;
}

export default function RadarChart({ data, size = 200, animate = true }: RadarChartProps) {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  const svgSize = size;
  const center = size / 2;
  const radius = size * 0.35;
  const sides = data.length;

  useEffect(() => {
    if (animate) {
      const start = performance.now();
      const duration = 1200;
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setProgress(t);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [animate]);

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const r = (value / 100) * radius * progress;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const gridLevels = [25, 50, 75, 100];
  const gridPoints = gridLevels.map((level) =>
    data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const r = (level / 100) * radius * progress;
      return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    })
  );

  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';

  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="overflow-visible">
      {/* Grid */}
      {gridPoints.map((points, li) => (
        <polygon
          key={li}
          points={points.map((p) => `${p[0]},${p[1]}`).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {data.map((_, i) => {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const endX = center + radius * progress * Math.cos(angle);
        const endY = center + radius * progress * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={endX} y2={endY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="rgba(45, 212, 191, 0.15)" stroke="rgba(45, 212, 191, 0.8)" strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={data[i].color} stroke="white" strokeWidth="1">
          {animate && <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const labelR = radius * progress + 20;
        const lx = center + labelR * Math.cos(angle);
        const ly = center + labelR * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="10">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
