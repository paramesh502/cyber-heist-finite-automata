import { useMemo } from 'react';
import type { Automaton } from '../../engine/types';

interface AutomataVizProps {
  automaton: Automaton;
  activeStates: string[];
  visitedTransitions?: { from: string; to: string; symbol: string }[];
  width?: number;
  height?: number;
}

const STATE_RADIUS = 26;
const ACCEPT_RADIUS = 32;

export default function AutomataViz({
  automaton,
  activeStates,
  visitedTransitions = [],
  width = 560,
  height = 280,
}: AutomataVizProps) {
  const activeSet = useMemo(() => new Set(activeStates), [activeStates]);
  const acceptSet = useMemo(() => new Set(automaton.acceptingStates), [automaton.acceptingStates]);

  // Convert percentage positions to SVG coordinates
  const toSVG = (x: number, y: number) => ({
    cx: (x / 100) * (width - 80) + 40,
    cy: (y / 100) * (height - 60) + 30,
  });

  const statePositions = useMemo(() => {
    const map = new Map<string, { cx: number; cy: number }>();
    automaton.states.forEach((s) => {
      map.set(s.id, toSVG(s.x, s.y));
    });
    return map;
  }, [automaton.states, width, height]);

  // Build transition paths, grouping parallel edges
  const transitionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    automaton.transitions.forEach((t) => {
      const key = `${t.from}→${t.to}`;
      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, t.symbol]);
    });
    return groups;
  }, [automaton.transitions]);

  const isTransitionActive = (from: string, to: string) =>
    visitedTransitions.some((vt) => vt.from === from && vt.to === to);

  function getStateColor(stateId: string): string {
    if (activeSet.has(stateId)) {
      if (acceptSet.has(stateId)) return '#00ff88';
      return '#00d4ff';
    }
    if (acceptSet.has(stateId)) return '#aa44ff';
    return '#4488ff';
  }

  function getStateFill(stateId: string): string {
    if (activeSet.has(stateId)) {
      if (acceptSet.has(stateId)) return 'rgba(0,255,136,0.15)';
      return 'rgba(0,212,255,0.15)';
    }
    return 'rgba(13,21,37,0.9)';
  }

  // Draw an arrow between two states
  function renderTransition(from: string, to: string, labels: string[]) {
    const pFrom = statePositions.get(from);
    const pTo = statePositions.get(to);
    if (!pFrom || !pTo) return null;

    const key = `${from}-${to}`;
    const active = isTransitionActive(from, to);
    const label = labels.join(', ');
    const color = active ? '#00d4ff' : '#2a4a6f';

    // Self-loop
    if (from === to) {
      const { cx, cy } = pFrom;
      const loopR = 20;
      return (
        <g key={key}>
          <path
            d={`M ${cx - 10} ${cy - STATE_RADIUS} 
               C ${cx - 30} ${cy - STATE_RADIUS - loopR * 2} 
                 ${cx + 30} ${cy - STATE_RADIUS - loopR * 2} 
                 ${cx + 10} ${cy - STATE_RADIUS}`}
            fill="none"
            stroke={color}
            strokeWidth={active ? 2 : 1}
            markerEnd={`url(#arrow-${active ? 'active' : 'normal'})`}
          />
          <text
            x={cx}
            y={cy - STATE_RADIUS - loopR * 2 - 4}
            textAnchor="middle"
            fill={active ? '#00d4ff' : '#5a8aaf'}
            fontSize="11"
            fontFamily="Share Tech Mono, monospace"
          >
            {label}
          </text>
        </g>
      );
    }

    // Check if reverse edge exists (for curve offset)
    const hasReverse = transitionGroups.has(`${to}→${from}`);

    const dx = pTo.cx - pFrom.cx;
    const dy = pTo.cy - pFrom.cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;

    // Start/end points at edge of state circles
    const x1 = pFrom.cx + ux * STATE_RADIUS;
    const y1 = pFrom.cy + uy * STATE_RADIUS;
    const x2 = pTo.cx - ux * STATE_RADIUS;
    const y2 = pTo.cy - uy * STATE_RADIUS;

    let pathD: string;
    let labelX: number;
    let labelY: number;

    if (hasReverse) {
      // Curved arc
      const offset = 22;
      const nx = -uy * offset;
      const ny = ux * offset;
      const mx = (x1 + x2) / 2 + nx;
      const my = (y1 + y2) / 2 + ny;
      pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
      labelX = mx;
      labelY = my - 6;
    } else {
      pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
      labelX = (x1 + x2) / 2;
      labelY = (y1 + y2) / 2 - 8;
    }

    return (
      <g key={key}>
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={active ? 2 : 1}
          markerEnd={`url(#arrow-${active ? 'active' : 'normal'})`}
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fill={active ? '#00d4ff' : '#5a8aaf'}
          fontSize="11"
          fontFamily="Share Tech Mono, monospace"
          style={{ pointerEvents: 'none' }}
        >
          {label === 'ε' ? 'ε' : label}
        </text>
      </g>
    );
  }

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label={`State diagram for ${automaton.id}`}
      >
        <defs>
          {/* Arrow markers */}
          <marker id="arrow-normal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 z" fill="#2a4a6f" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 z" fill="#00d4ff" />
          </marker>
          {/* Glow filters */}
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid background */}
        <rect width={width} height={height} fill="rgba(9,14,26,0.6)" rx="8" />

        {/* Transitions */}
        {[...transitionGroups.entries()].map(([key, labels]) => {
          const [from, to] = key.split('→');
          return renderTransition(from, to, labels);
        })}

        {/* Initial state arrow */}
        {(() => {
          const initPos = statePositions.get(automaton.initialState);
          if (!initPos) return null;
          const arrowLen = 24;
          return (
            <g>
              <line
                x1={initPos.cx - STATE_RADIUS - arrowLen}
                y1={initPos.cy}
                x2={initPos.cx - STATE_RADIUS - 1}
                y2={initPos.cy}
                stroke="#4488ff"
                strokeWidth={1.5}
                markerEnd="url(#arrow-normal)"
              />
            </g>
          );
        })()}

        {/* States */}
        {automaton.states.map((state) => {
          const pos = statePositions.get(state.id);
          if (!pos) return null;
          const { cx, cy } = pos;
          const isActive = activeSet.has(state.id);
          const isAccepting = acceptSet.has(state.id);
          const color = getStateColor(state.id);
          const fill = getStateFill(state.id);

          return (
            <g key={state.id} filter={isActive ? 'url(#glow-cyan)' : undefined}>
              {/* Outer accepting circle */}
              {isAccepting && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={ACCEPT_RADIUS}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 2 : 1}
                  strokeOpacity={isActive ? 1 : 0.6}
                />
              )}
              {/* Main state circle */}
              <circle
                cx={cx}
                cy={cy}
                r={STATE_RADIUS}
                fill={fill}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {/* State label */}
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? color : '#7a9bbf'}
                fontSize={state.label.length > 3 ? 9 : 11}
                fontFamily="Share Tech Mono, monospace"
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {state.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem', fontSize: '0.7rem', color: '#5a8aaf', fontFamily: 'Share Tech Mono, monospace' }}>
        <span>◎ Active state</span>
        <span>⊙ Accepting state</span>
        <span>→ Initial state</span>
        {automaton.type === 'NFA' && <span>ε = epsilon</span>}
      </div>
    </div>
  );
}
