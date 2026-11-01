import { useState } from 'react';
import type { LevelHint } from '../../levels/types';

interface HintPanelProps {
  hints: LevelHint[];
  onHintUsed: (count: number) => void;
  hintsUsed: number;
}

export default function HintPanel({ hints, onHintUsed, hintsUsed }: HintPanelProps) {
  const [revealed, setRevealed] = useState(hintsUsed);

  const revealNext = () => {
    if (revealed < hints.length) {
      const next = revealed + 1;
      setRevealed(next);
      onHintUsed(next);
    }
  };

  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {sortedHints.slice(0, revealed).map((hint, i) => (
        <div
          key={i}
          className="anim-slide-up"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '4px',
            padding: '0.6rem 0.8rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>
            HINT {i + 1}
          </span>
          {hint.text}
        </div>
      ))}

      {revealed < hints.length ? (
        <button className="btn btn-secondary btn-sm" onClick={revealNext} style={{ alignSelf: 'flex-start' }}>
          💡 Get Hint {revealed + 1} of {hints.length}
        </button>
      ) : (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          All hints revealed.
        </p>
      )}
    </div>
  );
}
