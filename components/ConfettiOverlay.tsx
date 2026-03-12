'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  active: boolean;
  durationMs?: number;
};

const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-info)'];

export default function ConfettiOverlay({ active, durationMs = 1400 }: Props) {
  const [visible, setVisible] = useState(false);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (!active) return;
    setSeed((s) => s + 1);
    setVisible(true);

    const t = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs]);

  const pieces = useMemo(() => {
    const count = 70;
    const rand = mulberry32(seed + 1);

    return Array.from({ length: count }, (_, i) => {
      const left = rand() * 100;
      const delay = rand() * 180;
      const fall = 900 + rand() * 700;
      const size = 6 + rand() * 6;
      const color = COLORS[Math.floor(rand() * COLORS.length)];

      return {
        key: `${seed}-${i}`,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${Math.max(4, size * 0.55)}px`,
          background: color,
          animationDelay: `${delay}ms`,
          animationDuration: `${fall}ms`
        } as React.CSSProperties
      };
    });
  }, [seed]);

  if (!visible) return null;

  return (
    <div className="confettiOverlay" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.key} className="confettiPiece" style={p.style} />
      ))}
    </div>
  );
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
