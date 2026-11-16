// ============================================================
// Wire Cutter — DFA Builder Mini-Game Screen
// Players build a DFA from scratch to match a target language.
// ============================================================

import { useState, useCallback } from 'react';
import DFABuilder from '../game/DFABuilder';
import {
  WIRE_PUZZLES,
  checkSolution,
  type BuilderAutomaton,
  type CheckResult,
} from '../game/WireCutterEngine';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results' | 'wirecutter';

interface WireCutterProps {
  onNavigate: (screen: Screen) => void;
}

const EMPTY_BUILDER: BuilderAutomaton = {
  states: [],
  initialStateId: null,
  transitions: [],
};

export default function WireCutter({ onNavigate }: WireCutterProps) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [builder, setBuilder] = useState<BuilderAutomaton>(EMPTY_BUILDER);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<number>>(new Set());
  const [showCongrats, setShowCongrats] = useState(false);

  const puzzle = WIRE_PUZZLES[puzzleIdx];

  const handleCheck = () => {
    const r = checkSolution(builder, puzzle);
    setResult(r);
    if (r.perfect && !solvedPuzzles.has(puzzle.id)) {
      setTotalScore((s) => s + r.score);
      setSolvedPuzzles((prev) => new Set([...prev, puzzle.id]));
      setShowCongrats(true);
    }
  };

  const handlePuzzleChange = useCallback((idx: number) => {
    setPuzzleIdx(idx);
    setBuilder(EMPTY_BUILDER);
    setResult(null);
    setShowHint(false);
    setShowCongrats(false);
  }, []);

  const handleNext = () => {
    if (puzzleIdx < WIRE_PUZZLES.length - 1) {
      handlePuzzleChange(puzzleIdx + 1);
    }
  };

  const handleReset = () => {
    setBuilder(EMPTY_BUILDER);
    setResult(null);
    setShowCongrats(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Top nav */}
      <nav style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.6rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('landing')}>← Back</button>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', fontSize: '1rem' }}>
            ✂ WIRE CUTTER
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
            Build the DFA — crack the vault
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-green)', fontSize: '0.9rem' }}>
          SCORE: {totalScore}
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', maxWidth: '1100px', margin: '0 auto', gap: '1rem', padding: '1rem' }}>

        {/* Left — Puzzle list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            PUZZLES
          </div>
          {WIRE_PUZZLES.map((p, i) => {
            const solved = solvedPuzzles.has(p.id);
            const active = i === puzzleIdx;
            return (
              <button key={p.id} onClick={() => handlePuzzleChange(i)} style={{
                background: active ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
                border: `1px solid ${active ? 'rgba(0,212,255,0.4)' : solved ? 'rgba(0,255,136,0.3)' : 'var(--border-color)'}`,
                borderRadius: '6px', padding: '0.6rem 0.75rem',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: active ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                    {String(i + 1).padStart(2, '0')} {p.title}
                  </span>
                  {solved && <span style={{ color: 'var(--neon-green)', fontSize: '0.8rem' }}>✓</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {p.points} pts · {p.minStates}+ states
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.9, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem 0.75rem' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>LEGEND</div>
            <div><span style={{ color: 'var(--neon-blue)' }}>→</span> Initial state</div>
            <div><span style={{ color: 'var(--neon-green)' }}>⊙</span> Accepting state</div>
            <div><span style={{ color: 'var(--neon-cyan)' }}>●</span> Regular state</div>
          </div>
        </div>

        {/* Right — Active puzzle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Puzzle header */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  PUZZLE {puzzleIdx + 1} / {WIRE_PUZZLES.length}
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                  {puzzle.title}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {puzzle.description}
                </p>
                <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target language: </span>
                  <span style={{ color: 'var(--neon-purple)' }}>{puzzle.targetLanguage}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>Alphabet: </span>
                  <span style={{ color: 'var(--neon-cyan)' }}>{'{' + puzzle.alphabet.join(', ') + '}'}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>Min states: </span>
                  <span style={{ color: 'var(--neon-orange)' }}>{puzzle.minStates}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowHint(!showHint)}>
                  {showHint ? 'Hide Hint' : '💡 Hint'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                  ↺ Reset
                </button>
              </div>
            </div>
            {showHint && (
              <div style={{
                marginTop: '0.75rem', padding: '0.6rem 0.75rem',
                background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5,
              }} className="anim-fade-in">
                💡 {puzzle.hint}
              </div>
            )}
          </div>

          {/* Builder canvas */}
          <div className="card" style={{ padding: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              DFA BUILDER CANVAS
            </div>
            <DFABuilder
              alphabet={puzzle.alphabet}
              value={builder}
              onChange={setBuilder}
            />
          </div>

          {/* Check + test cases */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

            {/* Check button + result */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                VERIFY SOLUTION
              </div>
              <button className="btn btn-success" onClick={handleCheck}
                style={{ width: '100%' }}>
                ⚡ CHECK MY DFA
              </button>

              {result && !result.valid && (
                <div style={{ padding: '0.6rem', borderRadius: '4px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}>
                  {result.validationErrors.map((e, i) => <div key={i}>⚠ {e}</div>)}
                </div>
              )}

              {result?.valid && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{
                    padding: '0.6rem', borderRadius: '4px',
                    background: result.perfect ? 'rgba(0,255,136,0.08)' : 'rgba(255,136,68,0.08)',
                    border: `1px solid ${result.perfect ? 'rgba(0,255,136,0.3)' : 'rgba(255,136,68,0.3)'}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: result.perfect ? 'var(--neon-green)' : 'var(--neon-orange)' }}>
                      {result.perfect ? '🔓 PERFECT!' : `${result.passed} / ${result.total} passed`}
                    </div>
                    {result.perfect && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--neon-green)', marginTop: '0.2rem' }}>
                        +{result.score} points
                      </div>
                    )}
                  </div>

                  {/* Per-test result rows */}
                  {result.results.map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                      color: r.pass ? 'var(--text-secondary)' : 'var(--neon-red)',
                    }}>
                      <span style={{ color: r.pass ? 'var(--neon-green)' : 'var(--neon-red)', fontSize: '0.8rem', width: '12px' }}>
                        {r.pass ? '✓' : '✗'}
                      </span>
                      <span style={{ color: 'var(--neon-cyan)' }}>{r.label}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        got {r.got ? 'ACCEPT' : 'REJECT'}, want {r.expected ? 'ACCEPT' : 'REJECT'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next puzzle */}
              {result?.perfect && puzzleIdx < WIRE_PUZZLES.length - 1 && (
                <button className="btn btn-primary btn-sm" onClick={handleNext}>
                  Next Puzzle →
                </button>
              )}
              {result?.perfect && puzzleIdx === WIRE_PUZZLES.length - 1 && (
                <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-purple)', textAlign: 'center', fontSize: '0.9rem' }}>
                  🏆 All puzzles complete!
                </div>
              )}
            </div>

            {/* Expected test cases */}
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                TEST CASES YOUR DFA MUST PASS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {puzzle.testCases.map((tc, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.3rem 0.5rem',
                    background: 'rgba(0,0,0,0.2)', borderRadius: '3px',
                    fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                  }}>
                    <span style={{ color: tc.expected ? 'var(--neon-green)' : 'var(--neon-red)', width: '12px' }}>
                      {tc.expected ? '✓' : '✗'}
                    </span>
                    <span style={{ color: 'var(--neon-cyan)', minWidth: '60px' }}>
                      "{tc.input === '' ? 'ε' : tc.input}"
                    </span>
                    <span style={{ color: tc.expected ? 'var(--neon-green)' : 'var(--neon-red)', fontSize: '0.65rem' }}>
                      {tc.expected ? 'ACCEPT' : 'REJECT'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Builder stats */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span>States: <span style={{ color: 'var(--text-secondary)' }}>{builder.states.length}</span></span>
                <span>Transitions: <span style={{ color: 'var(--text-secondary)' }}>{builder.transitions.length}</span></span>
                <span>Accepting: <span style={{ color: 'var(--neon-green)' }}>{builder.states.filter(s => s.isAccepting).length}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Congrats overlay */}
      {showCongrats && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }} onClick={() => setShowCongrats(false)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(0,255,136,0.4)',
            borderRadius: '12px', padding: '2rem', textAlign: 'center', maxWidth: '380px',
          }} onClick={(e) => e.stopPropagation()} className="anim-slide-up">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔓</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-green)', marginBottom: '0.5rem' }}>
              VAULT CRACKED!
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Your DFA passes all test cases for<br />
              <span style={{ color: 'var(--neon-cyan)' }}>{puzzle.title}</span>
            </p>
            <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-yellow)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              +{puzzle.points} pts
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {puzzleIdx < WIRE_PUZZLES.length - 1 && (
                <button className="btn btn-primary btn-sm" onClick={() => { setShowCongrats(false); handleNext(); }}>
                  Next Puzzle →
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCongrats(false)}>
                Keep Building
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
