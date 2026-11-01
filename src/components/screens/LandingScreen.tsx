import { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { LEVELS } from '../../levels';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results';

interface LandingScreenProps {
  onNavigate: (screen: Screen, levelId?: number) => void;
}

export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  const { state, resetProgress } = useGame();
  const [showReset, setShowReset] = useState(false);

  const completedCount = Object.values(state.levelProgress).filter((lp) => lp.completed).length;
  const hasProgress = completedCount > 0;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Scan line effect */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)',
        animation: 'scan-line 4s linear infinite',
        pointerEvents: 'none', zIndex: 10,
      }} />

      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        {/* Title */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
            ▶ INITIALIZING SYSTEM... VAULT BREACH PROTOCOL ACTIVE ◀
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 900,
            color: 'var(--neon-cyan)',
            textShadow: '0 0 40px rgba(0,212,255,0.5)',
            lineHeight: 1.1,
            marginBottom: '0.25rem',
          }}>
            CYBER HEIST
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
            color: 'var(--text-secondary)',
            fontWeight: 400,
            letterSpacing: '0.15em',
          }}>
            CRACK THE VAULT USING FINITE AUTOMATA
          </h2>
        </div>

        {/* Story */}
        <div style={{
          background: 'rgba(0,212,255,0.04)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: '8px',
          padding: '1.25rem',
          marginBottom: '2rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          textAlign: 'left',
        }}>
          <span style={{ color: 'var(--neon-green)' }}>$ </span>
          Welcome, Agent. You are a cybersecurity specialist tasked with infiltrating a series of
          digital vaults. Each vault is protected by a <span style={{ color: 'var(--neon-cyan)' }}>Finite Automaton</span> —
          a mathematical machine that accepts or rejects access codes. Analyze each automaton's
          state transitions, master DFAs and NFAs, and crack all 8 vaults to complete your mission.
        </div>

        {/* Progress summary if exists */}
        {hasProgress && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--neon-cyan)' }}>{completedCount}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>VAULTS CRACKED</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--neon-green)' }}>{state.totalScore}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL SCORE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--neon-purple)' }}>{LEVELS.length}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL VAULTS</div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('missions')}
            style={{ minWidth: '180px' }}
          >
            {hasProgress ? '▶ CONTINUE' : '▶ START MISSION'}
          </button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('jflap')}
            style={{ minWidth: '180px' }}
          >
            🔬 JFLAP LAB
          </button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('howtoplay')}
            style={{ minWidth: '180px' }}
          >
            ❓ HOW TO PLAY
          </button>
        </div>

        {/* Reset */}
        {hasProgress && (
          <div>
            {!showReset ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReset(true)}>
                ↺ Reset Progress
              </button>
            ) : (
              <div style={{
                background: 'rgba(255,68,68,0.08)',
                border: '1px solid rgba(255,68,68,0.3)',
                borderRadius: '6px',
                padding: '1rem',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-red)' }}>
                  ⚠ This will erase ALL progress. Are you sure?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-danger btn-sm" onClick={() => { resetProgress(); setShowReset(false); }}>
                    Yes, Reset
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.6 }}>
          Theory of Computation — Educational Project | DFA · NFA · JFLAP
        </div>
      </div>
    </div>
  );
}
