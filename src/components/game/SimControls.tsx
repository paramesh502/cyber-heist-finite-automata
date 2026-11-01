

type SimStatus = 'idle' | 'running' | 'paused' | 'done' | 'error';

interface SimControlsProps {
  status: SimStatus;
  input: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onRunFull: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  currentStep: number;
  totalSteps: number;
}

export default function SimControls({
  status,
  input,
  onStart,
  onPause,
  onResume,
  onReset,
  onStepForward,
  onRunFull,
  speed,
  onSpeedChange,
  currentStep,
  totalSteps,
}: SimControlsProps) {
  const canStart = (status === 'idle' || status === 'done' || status === 'error') && input.length > 0;
  const canStep = (status === 'idle' || status === 'paused') && input.length > 0;
  const canRunFull = (status === 'idle' || status === 'paused' || status === 'done' || status === 'error') && input.length > 0;
  const canReset = status !== 'idle';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Primary controls */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {status === 'running' ? (
          <button className="btn btn-primary btn-sm" onClick={onPause}>
            ⏸ Pause
          </button>
        ) : status === 'paused' ? (
          <button className="btn btn-primary btn-sm" onClick={onResume}>
            ▶ Resume
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onStart} disabled={!canStart}>
            ▶ Simulate
          </button>
        )}

        <button className="btn btn-secondary btn-sm" onClick={onStepForward} disabled={!canStep}>
          ⏭ Step
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onRunFull} disabled={!canRunFull}>
          ⏩ Run Full
        </button>

        {canReset && (
          <button className="btn btn-ghost btn-sm" onClick={onReset}>
            ↺ Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            <span>Step {currentStep} / {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%`,
                background: 'var(--neon-cyan)',
                transition: 'width 0.2s ease',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      )}

      {/* Speed control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          Speed:
        </span>
        <input
          type="range"
          min={100}
          max={1500}
          step={100}
          value={1600 - speed} // invert: higher = faster
          onChange={(e) => onSpeedChange(1600 - parseInt(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {speed <= 300 ? 'Fast' : speed <= 700 ? 'Normal' : 'Slow'}
        </span>
      </div>
    </div>
  );
}
