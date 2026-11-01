
import type { DFAResult, NFAResult } from '../../engine/types';

interface ExecutionTraceProps {
  result: DFAResult | NFAResult | null;
  automatonType: 'DFA' | 'NFA';
  currentStep: number;
}

export default function ExecutionTrace({
  result,
  automatonType,
  currentStep,
}: ExecutionTraceProps) {
  if (!result) {
    return (
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '0.75rem' }}>
        Enter a string and start the simulation to see the execution trace.
      </div>
    );
  }

  const trace = result.trace;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        <thead>
          <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Step</th>
            <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Symbol</th>
            {automatonType === 'DFA' ? (
              <>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>From</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>To</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Accepting?</th>
              </>
            ) : (
              <>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>From States</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>To States</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Has Accepting?</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {trace.map((step, i) => {
            const isCurrent = i === currentStep;
            const isPast = i < currentStep;

            let fromCol = '-';
            let toCol = '';
            let acceptCol = '';

            if (automatonType === 'DFA') {
              const s = step as import('../../engine/types').DFATraceStep;
              fromCol = s.fromState ?? '-';
              toCol = s.toState;
              acceptCol = s.isAccepting ? '✓' : '✗';
            } else {
              const s = step as import('../../engine/types').NFATraceStep;
              fromCol = s.fromStates.length > 0 ? `{${s.fromStates.join(', ')}}` : '{}';
              toCol = `{${s.toStates.join(', ')}}`;
              acceptCol = s.hasAccepting ? '✓' : '✗';
            }

            return (
              <tr
                key={i}
                style={{
                  background: isCurrent
                    ? 'rgba(0,212,255,0.08)'
                    : isPast
                    ? 'rgba(0,212,255,0.03)'
                    : 'transparent',
                  borderLeft: isCurrent ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                  color: isPast || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                <td style={{ padding: '0.35rem 0.6rem' }}>{step.stepIndex}</td>
                <td style={{ padding: '0.35rem 0.6rem', color: 'var(--neon-cyan)' }}>
                  {step.symbol === null ? 'START' : step.symbol === 'ε' ? 'ε' : step.symbol}
                </td>
                <td style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }}>{fromCol}</td>
                <td style={{ padding: '0.35rem 0.6rem', color: 'var(--neon-blue)' }}>{toCol}</td>
                <td style={{ padding: '0.35rem 0.6rem', color: acceptCol.startsWith('✓') ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                  {acceptCol}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Final result explanation */}
      {currentStep === trace.length - 1 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          borderRadius: '4px',
          background: result.accepted ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)',
          border: `1px solid ${result.accepted ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`,
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: result.accepted ? 'var(--neon-green)' : 'var(--neon-red)',
        }}>
          {result.accepted
            ? '✓ String ACCEPTED — reached an accepting state'
            : `✗ String REJECTED — ${result.rejectionReason ?? 'did not reach an accepting state'}`}
        </div>
      )}
    </div>
  );
}
