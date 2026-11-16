// ============================================================
// Wire Cutter — DFA Builder Mini-Game Engine
// Pure logic: puzzle definitions, scoring, answer checking.
// No UI imports.
// ============================================================

import { runDFA } from '../../engine/dfa';
import { validateAutomaton } from '../../engine/validate';
import type { Automaton, AutomatonState, Transition } from '../../engine/types';

// ── Puzzle definition ────────────────────────────────────────

export interface WirePuzzle {
  id: number;
  title: string;
  description: string;
  alphabet: string[];
  /** Plain-English description of the target language */
  targetLanguage: string;
  /** Minimum states the solution needs (hint to player) */
  minStates: number;
  /** Test cases the solution must pass */
  testCases: { input: string; expected: boolean; label: string }[];
  /** Optional hint */
  hint: string;
  /** Points awarded for a correct solution */
  points: number;
}

export const WIRE_PUZZLES: WirePuzzle[] = [
  {
    id: 1,
    title: 'First Signal',
    description: 'Build a DFA that accepts any string over {a, b} that contains at least one "a".',
    alphabet: ['a', 'b'],
    targetLanguage: '(a+b)*a(a+b)*',
    minStates: 2,
    testCases: [
      { input: 'a',   expected: true,  label: '"a" — just one a' },
      { input: 'ba',  expected: true,  label: '"ba" — a at the end' },
      { input: 'aba', expected: true,  label: '"aba" — multiple as' },
      { input: 'b',   expected: false, label: '"b" — no a' },
      { input: 'bbb', expected: false, label: '"bbb" — no a' },
      { input: '',    expected: false, label: 'ε — empty string' },
    ],
    hint: 'You need 2 states: "no a seen yet" and "at least one a seen". The second state is accepting.',
    points: 100,
  },
  {
    id: 2,
    title: 'Binary Tail',
    description: 'Build a DFA that accepts binary strings ending in "0".',
    alphabet: ['0', '1'],
    targetLanguage: '(0+1)*0',
    minStates: 2,
    testCases: [
      { input: '0',    expected: true,  label: '"0"' },
      { input: '10',   expected: true,  label: '"10"' },
      { input: '110',  expected: true,  label: '"110"' },
      { input: '1',    expected: false, label: '"1"' },
      { input: '01',   expected: false, label: '"01"' },
      { input: '',     expected: false, label: 'ε' },
    ],
    hint: 'You need 2 states: "last symbol was 0" (accepting) and "last symbol was 1 or nothing" (not accepting).',
    points: 100,
  },
  {
    id: 3,
    title: 'Triple Threat',
    description: 'Build a DFA that accepts strings over {a} whose length is a multiple of 3 (including empty).',
    alphabet: ['a'],
    targetLanguage: '(aaa)*',
    minStates: 3,
    testCases: [
      { input: '',      expected: true,  label: 'ε — length 0' },
      { input: 'aaa',   expected: true,  label: '"aaa" — length 3' },
      { input: 'aaaaaa',expected: true,  label: '"aaaaaa" — length 6' },
      { input: 'a',     expected: false, label: '"a" — length 1' },
      { input: 'aa',    expected: false, label: '"aa" — length 2' },
      { input: 'aaaa',  expected: false, label: '"aaaa" — length 4' },
    ],
    hint: 'You need exactly 3 states representing length mod 3: 0 (accepting), 1, and 2.',
    points: 150,
  },
  {
    id: 4,
    title: 'No Double Zero',
    description: 'Build a DFA that accepts binary strings that do NOT contain "00" as a substring.',
    alphabet: ['0', '1'],
    targetLanguage: 'strings over {0,1} without "00"',
    minStates: 3,
    testCases: [
      { input: '',     expected: true,  label: 'ε' },
      { input: '1',    expected: true,  label: '"1"' },
      { input: '10',   expected: true,  label: '"10"' },
      { input: '101',  expected: true,  label: '"101"' },
      { input: '10101',expected: true,  label: '"10101"' },
      { input: '00',   expected: false, label: '"00" — contains 00' },
      { input: '100',  expected: false, label: '"100" — contains 00' },
      { input: '1001', expected: false, label: '"1001" — contains 00' },
    ],
    hint: 'You need 3 states: "safe" (start, accepting), "just saw a 0" (accepting), "dead — saw 00" (not accepting, trap).',
    points: 150,
  },
  {
    id: 5,
    title: 'Exact Length',
    description: 'Build a DFA that accepts strings over {a, b} of exactly length 2.',
    alphabet: ['a', 'b'],
    targetLanguage: '(a+b)(a+b)',
    minStates: 4,
    testCases: [
      { input: 'aa',  expected: true,  label: '"aa"' },
      { input: 'ab',  expected: true,  label: '"ab"' },
      { input: 'ba',  expected: true,  label: '"ba"' },
      { input: 'bb',  expected: true,  label: '"bb"' },
      { input: '',    expected: false, label: 'ε — length 0' },
      { input: 'a',   expected: false, label: '"a" — length 1' },
      { input: 'aaa', expected: false, label: '"aaa" — length 3' },
    ],
    hint: 'You need 4 states: length 0 (start), length 1, length 2 (accepting), length 3+ (dead trap).',
    points: 200,
  },
];

// ── Builder state types ──────────────────────────────────────

export interface BuilderState {
  id: string;
  label: string;
  x: number;
  y: number;
  isAccepting: boolean;
}

export interface BuilderTransition {
  id: string;
  from: string;
  to: string;
  symbol: string;
}

export interface BuilderAutomaton {
  states: BuilderState[];
  initialStateId: string | null;
  transitions: BuilderTransition[];
}

// Convert builder state to engine Automaton
export function toAutomaton(
  builder: BuilderAutomaton,
  alphabet: string[]
): Automaton | null {
  if (!builder.initialStateId || builder.states.length === 0) return null;

  const states: AutomatonState[] = builder.states.map((s) => ({
    id: s.id,
    label: s.label,
    x: s.x,
    y: s.y,
  }));

  const transitions: Transition[] = builder.transitions.map((t) => ({
    from: t.from,
    to: t.to,
    symbol: t.symbol,
  }));

  return {
    id: 'wire-cutter-build',
    type: 'DFA',
    description: 'Player-built automaton',
    states,
    alphabet,
    initialState: builder.initialStateId,
    acceptingStates: builder.states.filter((s) => s.isAccepting).map((s) => s.id),
    transitions,
  };
}

// ── Scoring ──────────────────────────────────────────────────

export interface CheckResult {
  valid: boolean;
  validationErrors: string[];
  passed: number;
  total: number;
  results: { input: string; expected: boolean; got: boolean; pass: boolean; label: string }[];
  score: number;
  perfect: boolean;
}

export function checkSolution(
  builder: BuilderAutomaton,
  puzzle: WirePuzzle
): CheckResult {
  const automaton = toAutomaton(builder, puzzle.alphabet);

  if (!automaton) {
    return {
      valid: false,
      validationErrors: ['Set an initial state before checking.'],
      passed: 0,
      total: puzzle.testCases.length,
      results: [],
      score: 0,
      perfect: false,
    };
  }

  const validation = validateAutomaton(automaton);
  if (!validation.valid) {
    return {
      valid: false,
      validationErrors: validation.errors,
      passed: 0,
      total: puzzle.testCases.length,
      results: [],
      score: 0,
      perfect: false,
    };
  }

  const results = puzzle.testCases.map((tc) => {
    const r = runDFA(automaton, tc.input);
    // If there's an error (e.g. missing transition), treat as reject
    const got = r.errorMessage ? false : r.accepted;
    return {
      input: tc.input,
      expected: tc.expected,
      got,
      pass: got === tc.expected,
      label: tc.label,
    };
  });

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const perfect = passed === total;
  const score = perfect ? puzzle.points : Math.floor((passed / total) * puzzle.points * 0.5);

  return { valid: true, validationErrors: [], passed, total, results, score, perfect };
}

// ── ID generator ─────────────────────────────────────────────
let _idCounter = 0;
export function newId(prefix = 'n'): string {
  return `${prefix}${++_idCounter}`;
}
