import { useState, type KeyboardEvent } from 'react';
import { LEVELS } from '../../levels';
import { useGame } from '../../store/GameContext';
import { useSimulation } from '../../hooks/useSimulation';
import AutomataViz from '../game/AutomataViz';
import ExecutionTrace from '../game/ExecutionTrace';
import SimControls from '../game/SimControls';
import HintPanel from '../game/HintPanel';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results';

interface GameScreenProps {
  levelId: number;
  onNavigate: (screen: Screen, levelId?: number) => void;
}

export default function GameScreen({ levelId, onNavigate }: GameScreenProps) {
  const { state, completeLevel, isLevelUnlocked } = useGame();
  const level = LEVELS.find((l) => l.id === levelId);

  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'trace' | 'hints' | 'learn'>('trace');

  const sim = useSimulation(level!.automaton);

  if (!level) {
    return <div style={{ color: 'var(--neon-red)', padding: '2rem' }}>Level {levelId} not found.</div>;
  }

  if (!isLevelUnlocked(levelId)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}>This vault is locked. Complete the previous mission first.</p>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('missions')}>← Back to Missions</button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!sim.input.trim()) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    sim.runFull();
    setShowResult(true);

    // After runFull, result is synchronous
    setTimeout(() => {
      const accepted = sim.result?.accepted ?? false;

      if (accepted && !missionComplete) {
        setMissionComplete(true);
        completeLevel(levelId, newAttempts, hintsUsed);
      }
    }, 50);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const progress = state.levelProgress[levelId];
  const wasCompleted = progress?.completed ?? false;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('missions')}>
          ← Missions
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', fontSize: '0.9rem' }}>
            VAULT {String(levelId).padStart(2, '0')}
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {level.title.toUpperCase()}
          </span>
          <span className={`badge ${level.difficulty === 'Rookie' ? 'badge-rookie' : level.difficulty === 'Hacker' ? 'badge-hacker' : level.difficulty === 'Elite' ? 'badge-elite' : 'badge-master'}`}>
            {level.difficulty}
          </span>
          {wasCompleted && <span style={{ color: 'var(--neon-green)', fontSize: '0.8rem' }}>✓ COMPLETED</span>}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Score: {state.totalScore}
        </div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: '0', overflow: 'hidden', maxHeight: 'calc(100vh - 50px)' }}>

        {/* Left panel: Objective & Hints */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>
                MISSION OBJECTIVE
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {level.objective}
              </p>
            </div>

            <hr className="divider" />

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>
                INSTRUCTIONS
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {level.instructions}
              </p>
            </div>

            <hr className="divider" />

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                AUTOMATON INFO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Type: </span><span style={{ color: 'var(--neon-blue)' }}>{level.automaton.type}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>States: </span>{level.automaton.states.map(s => s.label).join(', ')}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Alphabet: </span>{'{'}{level.automaton.alphabet.join(', ')}{'}'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Start: </span><span style={{ color: 'var(--neon-cyan)' }}>{level.automaton.initialState}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Accept: </span><span style={{ color: 'var(--neon-green)' }}>{level.automaton.acceptingStates.join(', ')}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center panel: State diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Automaton viz */}
          <div style={{
            flex: '0 0 auto',
            padding: '1rem 1.5rem 0.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              STATE DIAGRAM — {level.automaton.type}
            </div>
            <AutomataViz
              automaton={level.automaton}
              activeStates={sim.activeStates}
              visitedTransitions={sim.visitedTransitions}
              width={580}
              height={260}
            />
          </div>

          {/* Tabs: trace / hints / learn */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              padding: '0 1rem',
            }}>
              {(['trace', 'hints', 'learn'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                    color: activeTab === tab ? 'var(--neon-cyan)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab === 'trace' ? '⟶ EXECUTION TRACE' : tab === 'hints' ? '💡 HINTS' : '📖 LEARN'}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {activeTab === 'trace' && (
                <ExecutionTrace
                  result={sim.result}
                  automatonType={level.automaton.type}
                  currentStep={sim.currentStep}
                />
              )}
              {activeTab === 'hints' && (
                <HintPanel
                  hints={level.hints}
                  hintsUsed={hintsUsed}
                  onHintUsed={(count) => setHintsUsed(count)}
                />
              )}
              {activeTab === 'learn' && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CONCEPT</div>
                    <p>{level.explanation.conceptDescription}</p>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AUTOMATON</div>
                    <p>{level.explanation.automatonExplanation}</p>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>HOW TO READ</div>
                    <p>{level.explanation.howToRead}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '4px', padding: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--neon-green)', marginBottom: '0.25rem' }}>✓ ACCEPTED: "{level.explanation.acceptedExample.input}"</div>
                      <p style={{ fontSize: '0.75rem' }}>{level.explanation.acceptedExample.why}</p>
                    </div>
                    <div style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '4px', padding: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--neon-red)', marginBottom: '0.25rem' }}>✗ REJECTED: "{level.explanation.rejectedExample.input}"</div>
                      <p style={{ fontSize: '0.75rem' }}>{level.explanation.rejectedExample.why}</p>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '4px', padding: '0.6rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--neon-cyan)', marginBottom: '0.25rem' }}>KEY TAKEAWAY</div>
                    <p>{level.explanation.takeaway}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Input & Controls */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          gap: '1rem',
          overflowY: 'auto',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              ACCESS CODE INPUT
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <input
                className="input"
                value={sim.input}
                onChange={(e) => sim.setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`e.g. ${level.testCases[0]?.input ?? '01'}`}
                maxLength={50}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Alphabet: {'{'}{level.automaton.alphabet.join(', ')}{'}'} &nbsp;|&nbsp; Press Enter to submit
            </div>
          </div>

          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={!sim.input.trim()}
          >
            ⚡ SUBMIT ACCESS CODE
          </button>

          {/* Result indicator */}
          {showResult && sim.status === 'done' && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '6px',
              background: sim.result?.accepted ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
              border: `1px solid ${sim.result?.accepted ? 'rgba(0,255,136,0.4)' : 'rgba(255,68,68,0.4)'}`,
              textAlign: 'center',
            }} className="anim-slide-up">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {sim.result?.accepted ? '🔓' : '🔒'}
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                color: sim.result?.accepted ? 'var(--neon-green)' : 'var(--neon-red)',
              }}>
                {sim.result?.accepted ? 'VAULT UNLOCKED' : 'ACCESS DENIED'}
              </div>
              {!sim.result?.accepted && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>
                  {sim.result?.rejectionReason}
                </div>
              )}
            </div>
          )}

          {sim.errorMessage && (
            <div style={{
              padding: '0.6rem',
              borderRadius: '4px',
              background: 'rgba(255,68,68,0.08)',
              border: '1px solid rgba(255,68,68,0.3)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-red)',
            }}>
              ⚠ {sim.errorMessage}
            </div>
          )}

          <hr className="divider" />

          {/* Simulation controls */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              SIMULATION CONTROLS
            </div>
            <SimControls
              status={sim.status}
              input={sim.input}
              onStart={sim.start}
              onPause={sim.pause}
              onResume={sim.resume}
              onReset={sim.reset}
              onStepForward={sim.stepForward}
              onRunFull={sim.runFull}
              speed={sim.speed}
              onSpeedChange={sim.setSpeed}
              currentStep={sim.currentStep}
              totalSteps={sim.totalSteps}
            />
          </div>

          <hr className="divider" />

          {/* Test cases */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              EXAMPLE STRINGS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {level.testCases.slice(0, 5).map((tc, i) => (
                <button
                  key={i}
                  onClick={() => sim.setInput(tc.input)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.35rem 0.6rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--neon-cyan)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--neon-cyan)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                >
                  <span style={{ color: tc.expected ? 'var(--neon-green)' : 'var(--neon-red)', fontSize: '0.65rem', width: '10px', flexShrink: 0 }}>
                    {tc.expected ? '✓' : '✗'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
                    "{tc.input === '' ? 'ε' : tc.input}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <hr className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span>Attempts: <span style={{ color: 'var(--text-secondary)' }}>{attempts}</span></span>
            <span>Hints: <span style={{ color: 'var(--text-secondary)' }}>{hintsUsed}</span></span>
          </div>

          {/* Mission complete overlay/buttons */}
          {missionComplete && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="anim-slide-up">
              <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-green)', textAlign: 'center', fontSize: '1rem' }}>
                🏆 VAULT CRACKED!
              </div>
              <button className="btn btn-success" onClick={() => {
                if (levelId < LEVELS.length && (state.unlockedLevels.includes(levelId + 1))) {
                  onNavigate('game', levelId + 1);
                } else {
                  onNavigate('missions');
                }
              }}>
                {levelId < LEVELS.length ? '▶ Next Vault' : '▶ All Vaults Done!'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
