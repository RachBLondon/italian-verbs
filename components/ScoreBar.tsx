'use client';

import Link from 'next/link';

export default function ScoreBar({
  modeLabel,
  correct,
  total,
  onReset
}: {
  modeLabel: string;
  correct: number;
  total: number;
  onReset: () => void;
}) {
  return (
    <div
      className="card cardFrame"
      style={{
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: 14
      }}
    >
      <Link className="brandBlock" href="/">
        Verbissimo!
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div className="row" style={{ alignItems: 'center' }}>
          <span className="pill">Mode: {modeLabel}</span>
          <span className="pill">
            Score: {correct} / {total}
          </span>
        </div>
        <div className="row">
          <button className="btn btnDanger" type="button" onClick={onReset}>
            Reset
          </button>
          <Link className="btn" href="/">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
