
import { LEVELS } from '../../levels';
import { useGame } from '../../store/GameContext';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results';

interface MissionSelectProps {
  onNavigate: (screen: Screen, levelId?: number) => void;
}

const DIFF_BADGE: Record<string, string> = {
  Rookie: 'badge-rookie',
  Hacker: 'badge-hacker',
  Elite: 'badge-elite',
  Master: 'badge-master',
};

function Stars({ count }: { count: number }) {
  return (
    <span>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ color: i <= count ? '#ffdd00' : 'var(--border-color)', fontSize: '1rem' }}>★</span>
      ))}
    </span>
  );
}

export default function MissionSelect({ onNavigate }: MissionSelectProps) {
  const { state, isLevelUnlocked } = useGame();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('landing')}>
            ← Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', fontSize: '1.5rem' }}>
            MISSION SELECT
          </h1>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {Object.values(state.levelProgress).filter(lp => lp.completed).length} / {LEVELS.length} vaults cracked &nbsp;|&nbsp; Total Score: {state.totalScore}
        </div>

        {/* Level grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const progress = state.levelProgress[level.id];
            const completed = progress?.completed ?? false;

            return (
              <div
                key={level.id}
                onClick={() => unlocked && onNavigate('game', level.id)}
                style={{
                  background: unlocked ? 'var(--bg-card)' : 'rgba(9,14,26,0.8)',
                  border: `1px solid ${completed ? 'rgba(0,255,136,0.3)' : unlocked ? 'var(--border-color)' : 'rgba(30,58,95,0.4)'}`,
                  borderRadius: '8px',
                  padding: '1.25rem',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.45,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (unlocked) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = completed ? 'rgba(0,255,136,0.6)' : 'rgba(0,212,255,0.5)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,212,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = completed ? 'rgba(0,255,136,0.3)' : unlocked ? 'var(--border-color)' : 'rgba(30,58,95,0.4)';
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                {/* Lock overlay */}
                {!unlocked && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '2rem', opacity: 0.4 }}>
                    🔒
                  </div>
                )}

                {/* Completion badge */}
                {completed && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--neon-green)', fontSize: '1.1rem' }}>
                    ✓
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    color: completed ? 'var(--neon-green)' : unlocked ? 'var(--neon-cyan)' : 'var(--text-muted)',
                    minWidth: '2rem',
                    opacity: unlocked ? 1 : 0.4,
                  }}>
                    {String(level.id).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                      {level.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {level.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {level.concept}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className={`badge ${DIFF_BADGE[level.difficulty] ?? 'badge-hacker'}`}>
                    {level.difficulty}
                  </span>
                  <span className="badge" style={{ background: 'rgba(68,136,255,0.12)', color: 'var(--neon-blue)', border: '1px solid rgba(68,136,255,0.3)' }}>
                    {level.automaton.type}
                  </span>
                </div>

                {completed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    <Stars count={progress?.stars ?? 0} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--neon-green)' }}>
                      {progress?.bestScore ?? 0} pts
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
