// ============================================================
// DFA Builder Canvas — drag states, draw transitions,
// mark accepting states and the initial state.
// Self-contained SVG component; no external deps.
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { BuilderState, BuilderTransition, BuilderAutomaton } from './WireCutterEngine';
import { newId } from './WireCutterEngine';

interface DFABuilderProps {
  alphabet: string[];
  value: BuilderAutomaton;
  onChange: (next: BuilderAutomaton) => void;
}

const R = 28; // state circle radius
const ACCEPT_R = 34;
const CANVAS_W = 620;
const CANVAS_H = 320;

type Tool = 'select' | 'addState' | 'addTransition' | 'delete';

interface DragState {
  stateId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface TransitionDraw {
  fromId: string;
  mouseX: number;
  mouseY: number;
}

export default function DFABuilder({ alphabet, value, onChange }: DFABuilderProps) {
  const [tool, setTool] = useState<Tool>('select');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [transitionDraw, setTransitionDraw] = useState<TransitionDraw | null>(null);
  const [pendingTransition, setPendingTransition] = useState<{ from: string; to: string } | null>(null);
  const [symbolPick, setSymbolPick] = useState<string>(alphabet[0] ?? '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Keep symbolPick valid when alphabet changes
  useEffect(() => {
    if (!alphabet.includes(symbolPick)) setSymbolPick(alphabet[0] ?? '');
  }, [alphabet]);

  // ── SVG coordinate helper ─────────────────────────────────
  const svgPoint = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }, []);

  const hitState = useCallback(
    (x: number, y: number): BuilderState | null => {
      for (const s of value.states) {
        const dx = s.x - x;
        const dy = s.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= R + 4) return s;
      }
      return null;
    },
    [value.states]
  );

  // ── Mouse handlers ────────────────────────────────────────

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.target !== svgRef.current && (e.target as SVGElement).tagName === 'circle') return;
    if (tool !== 'addState') return;
    const { x, y } = svgPoint(e);
    const hit = hitState(x, y);
    if (hit) return;
    // Clamp away from edges
    const cx = Math.max(R + 10, Math.min(CANVAS_W - R - 10, x));
    const cy = Math.max(R + 10, Math.min(CANVAS_H - R - 10, y));
    const id = newId('s');
    const label = `q${value.states.length}`;
    const newState: BuilderState = { id, label, x: cx, y: cy, isAccepting: false };
    onChange({
      ...value,
      states: [...value.states, newState],
      initialStateId: value.initialStateId ?? id,
    });
  };

  const handleStateMouseDown = (e: React.MouseEvent, state: BuilderState) => {
    e.stopPropagation();
    if (tool === 'delete') {
      // Remove state and its transitions
      const newStates = value.states.filter((s) => s.id !== state.id);
      const newTrans = value.transitions.filter(
        (t) => t.from !== state.id && t.to !== state.id
      );
      onChange({
        states: newStates,
        initialStateId: value.initialStateId === state.id
          ? (newStates[0]?.id ?? null)
          : value.initialStateId,
        transitions: newTrans,
      });
      return;
    }
    if (tool === 'addTransition') {
      const { x, y } = svgPoint(e);
      setTransitionDraw({ fromId: state.id, mouseX: x, mouseY: y });
      return;
    }
    if (tool === 'select') {
      const { x, y } = svgPoint(e);
      setDrag({ stateId: state.id, startX: x, startY: y, origX: state.x, origY: state.y });
    }
  };

  const handleStateClick = (e: React.MouseEvent, state: BuilderState) => {
    e.stopPropagation();
    if (tool === 'select') {
      // Double-click = toggle accepting
      if (e.detail === 2) {
        onChange({
          ...value,
          states: value.states.map((s) =>
            s.id === state.id ? { ...s, isAccepting: !s.isAccepting } : s
          ),
        });
      }
    }
  };

  const handleStateRightClick = (e: React.MouseEvent, state: BuilderState) => {
    e.preventDefault();
    e.stopPropagation();
    // Right-click = set as initial state
    onChange({ ...value, initialStateId: state.id });
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    const { x, y } = svgPoint(e);
    if (drag) {
      const nx = Math.max(R + 10, Math.min(CANVAS_W - R - 10, drag.origX + x - drag.startX));
      const ny = Math.max(R + 10, Math.min(CANVAS_H - R - 10, drag.origY + y - drag.startY));
      onChange({
        ...value,
        states: value.states.map((s) =>
          s.id === drag.stateId ? { ...s, x: nx, y: ny } : s
        ),
      });
    }
    if (transitionDraw) {
      setTransitionDraw({ ...transitionDraw, mouseX: x, mouseY: y });
    }
  };

  const handleSvgMouseUp = (e: React.MouseEvent) => {
    setDrag(null);
    if (transitionDraw) {
      const { x, y } = svgPoint(e);
      const target = hitState(x, y);
      if (target) {
        setPendingTransition({ from: transitionDraw.fromId, to: target.id });
      }
      setTransitionDraw(null);
    }
  };

  const confirmTransition = () => {
    if (!pendingTransition || !symbolPick) return;
    setErrorMsg(null);
    // Check for duplicate
    const dup = value.transitions.find(
      (t) => t.from === pendingTransition.from && t.symbol === symbolPick
    );
    if (dup) {
      setErrorMsg(`State already has a transition on "${symbolPick}". Delete it first or choose a different symbol.`);
      setPendingTransition(null);
      return;
    }
    const t: BuilderTransition = {
      id: newId('t'),
      from: pendingTransition.from,
      to: pendingTransition.to,
      symbol: symbolPick,
    };
    onChange({ ...value, transitions: [...value.transitions, t] });
    setPendingTransition(null);
  };

  const deleteTransition = (id: string) => {
    onChange({ ...value, transitions: value.transitions.filter((t) => t.id !== id) });
  };

  const renameState = (stateId: string, newLabel: string) => {
    onChange({
      ...value,
      states: value.states.map((s) => (s.id === stateId ? { ...s, label: newLabel } : s)),
    });
  };

  // ── Render helpers ────────────────────────────────────────

  function getStateById(id: string) {
    return value.states.find((s) => s.id === id);
  }

  function renderTransition(t: BuilderTransition) {
    const from = getStateById(t.from);
    const to = getStateById(t.to);
    if (!from || !to) return null;

    const isSelfLoop = t.from === t.to;
    const isActive = tool === 'delete';

    // Check if reverse also exists (for curve offset)
    const hasReverse = value.transitions.some(
      (other) => other.from === t.to && other.to === t.from
    );

    let pathD = '';
    let labelX = 0;
    let labelY = 0;

    if (isSelfLoop) {
      const { x: cx, y: cy } = from;
      pathD = `M ${cx - 10} ${cy - R} C ${cx - 36} ${cy - R - 48} ${cx + 36} ${cy - R - 48} ${cx + 10} ${cy - R}`;
      labelX = cx;
      labelY = cy - R - 36;
    } else {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const x1 = from.x + ux * R;
      const y1 = from.y + uy * R;
      const x2 = to.x - ux * R;
      const y2 = to.y - uy * R;

      if (hasReverse) {
        const offset = 20;
        const nx = -uy * offset;
        const ny = ux * offset;
        const mx = (x1 + x2) / 2 + nx;
        const my = (y1 + y2) / 2 + ny;
        pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
        labelX = mx;
        labelY = my - 8;
      } else {
        pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
        labelX = (x1 + x2) / 2;
        labelY = (y1 + y2) / 2 - 10;
      }
    }

    return (
      <g key={t.id} style={{ cursor: isActive ? 'pointer' : 'default' }}
        onClick={() => { if (tool === 'delete') deleteTransition(t.id); }}>
        <path
          d={pathD}
          fill="none"
          stroke={isActive ? 'rgba(255,68,68,0.6)' : '#2a4a6f'}
          strokeWidth={isActive ? 2 : 1.5}
          markerEnd="url(#wc-arrow)"
        />
        <text x={labelX} y={labelY} textAnchor="middle" fill="#00d4ff"
          fontSize="12" fontFamily="Share Tech Mono, monospace"
          style={{ pointerEvents: 'none' }}>
          {t.symbol}
        </text>
        {/* invisible wider hit zone for delete */}
        {isActive && (
          <path d={pathD} fill="none" stroke="transparent" strokeWidth={12} style={{ cursor: 'pointer' }} />
        )}
      </g>
    );
  }

  const toolBtnStyle = (t: Tool): React.CSSProperties => ({
    padding: '0.4rem 0.8rem',
    border: `1px solid ${tool === t ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
    borderRadius: '4px',
    background: tool === t ? 'rgba(0,212,255,0.12)' : 'transparent',
    color: tool === t ? 'var(--neon-cyan)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={toolBtnStyle('select')}    onClick={() => setTool('select')}>↖ SELECT / DRAG</button>
        <button style={toolBtnStyle('addState')}  onClick={() => setTool('addState')}>⊕ ADD STATE</button>
        <button style={toolBtnStyle('addTransition')} onClick={() => setTool('addTransition')}>→ ADD TRANSITION</button>
        <button style={toolBtnStyle('delete')}    onClick={() => setTool('delete')}>✕ DELETE</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Symbol:</span>
          {alphabet.map((sym) => (
            <button key={sym}
              onClick={() => setSymbolPick(sym)}
              style={{
                padding: '0.3rem 0.7rem',
                border: `1px solid ${symbolPick === sym ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                background: symbolPick === sym ? 'rgba(0,212,255,0.12)' : 'transparent',
                color: symbolPick === sym ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}>
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Quick-reference */}
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Controls: </strong>
        ADD STATE then click canvas to place &nbsp;|&nbsp;
        ADD TRANSITION then drag state→state &nbsp;|&nbsp;
        Double-click state = toggle accepting &nbsp;|&nbsp;
        Right-click state = set initial &nbsp;|&nbsp;
        DELETE then click state/transition to remove
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: 'rgba(9,14,26,0.8)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          cursor:
            tool === 'addState'      ? 'crosshair' :
            tool === 'addTransition' ? 'cell' :
            tool === 'delete'        ? 'not-allowed' : 'default',
        }}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={() => { setDrag(null); setTransitionDraw(null); }}
      >
        <defs>
          <marker id="wc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0 0 L8 3 L0 6 z" fill="#2a4a6f" />
          </marker>
          <marker id="wc-arrow-draw" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0 0 L8 3 L0 6 z" fill="rgba(0,212,255,0.6)" />
          </marker>
          <filter id="wc-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Empty canvas hint */}
        {value.states.length === 0 && (
          <text x={CANVAS_W / 2} y={CANVAS_H / 2} textAnchor="middle"
            fill="rgba(74,106,143,0.5)" fontSize="14"
            fontFamily="Share Tech Mono, monospace">
            Select "ADD STATE" and click here to place states
          </text>
        )}

        {/* Transitions */}
        {value.transitions.map(renderTransition)}

        {/* Live transition being drawn */}
        {transitionDraw && (() => {
          const from = getStateById(transitionDraw.fromId);
          if (!from) return null;
          return (
            <line
              x1={from.x} y1={from.y}
              x2={transitionDraw.mouseX} y2={transitionDraw.mouseY}
              stroke="rgba(0,212,255,0.5)" strokeWidth={1.5}
              strokeDasharray="6 4"
              markerEnd="url(#wc-arrow-draw)"
              style={{ pointerEvents: 'none' }}
            />
          );
        })()}

        {/* Initial state arrow */}
        {value.initialStateId && (() => {
          const s = getStateById(value.initialStateId);
          if (!s) return null;
          return (
            <g>
              <line x1={s.x - R - 28} y1={s.y} x2={s.x - R - 1} y2={s.y}
                stroke="#4488ff" strokeWidth={1.5} markerEnd="url(#wc-arrow)" />
            </g>
          );
        })()}

        {/* States */}
        {value.states.map((state) => {
          const isInitial = state.id === value.initialStateId;
          const color = state.isAccepting ? '#00ff88' : isInitial ? '#00d4ff' : '#4488ff';
          return (
            <g key={state.id}
              style={{ cursor: tool === 'delete' ? 'pointer' : tool === 'addTransition' ? 'cell' : 'grab' }}
              onMouseDown={(e) => handleStateMouseDown(e, state)}
              onClick={(e) => handleStateClick(e, state)}
              onContextMenu={(e) => handleStateRightClick(e, state)}
            >
              {state.isAccepting && (
                <circle cx={state.x} cy={state.y} r={ACCEPT_R}
                  fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.7} />
              )}
              <circle cx={state.x} cy={state.y} r={R}
                fill="rgba(13,21,37,0.95)"
                stroke={color} strokeWidth={2}
                filter={tool === 'delete' ? undefined : undefined}
              />
              <text x={state.x} y={state.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize={state.label.length > 3 ? 9 : 11}
                fontFamily="Share Tech Mono, monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {state.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* State list (rename + accepting toggle) */}
      {value.states.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {value.states.map((s) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '4px', padding: '0.3rem 0.6rem',
            }}>
              <input
                value={s.label}
                onChange={(e) => renameState(s.id, e.target.value)}
                style={{
                  width: '44px', background: 'transparent', border: 'none',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem', outline: 'none',
                }}
              />
              <button
                onClick={() => onChange({
                  ...value,
                  states: value.states.map((st) =>
                    st.id === s.id ? { ...st, isAccepting: !st.isAccepting } : st
                  ),
                })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: s.isAccepting ? 'var(--neon-green)' : 'var(--text-muted)',
                  fontSize: '0.9rem', lineHeight: 1, padding: 0,
                }}
              >
                ⊙
              </button>
              <button
                onClick={() => onChange({ ...value, initialStateId: s.id })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: value.initialStateId === s.id ? 'var(--neon-blue)' : 'var(--text-muted)',
                  fontSize: '0.85rem', lineHeight: 1, padding: 0,
                }}
              >
                →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div style={{
          padding: '0.5rem 0.75rem', borderRadius: '4px',
          background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)',
          fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-red)',
        }}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* Transition symbol picker modal */}
      {pendingTransition && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '8px', padding: '1.5rem', minWidth: '260px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ADD TRANSITION — PICK SYMBOL
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {alphabet.map((sym) => (
                <button key={sym}
                  onClick={() => setSymbolPick(sym)}
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: `2px solid ${symbolPick === sym ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    background: symbolPick === sym ? 'rgba(0,212,255,0.12)' : 'transparent',
                    color: symbolPick === sym ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)', fontSize: '1.1rem', cursor: 'pointer',
                  }}>
                  {sym}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={confirmTransition}>Add</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPendingTransition(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
