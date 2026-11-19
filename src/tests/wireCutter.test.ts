import { describe, it, expect, beforeEach } from 'vitest';
import {
  WIRE_PUZZLES,
  checkSolution,
  toAutomaton,
  newId,
  type BuilderAutomaton,
  type BuilderState,
  type BuilderTransition,
} from '../components/game/WireCutterEngine';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function makeState(id: string, label: string, isAccepting: boolean): BuilderState {
  return { id, label, x: 0, y: 0, isAccepting };
}

function makeTransition(from: string, to: string, symbol: string): BuilderTransition {
  return { id: newId('t'), from, to, symbol };
}

// ─────────────────────────────────────────────────────────────
// Test: toAutomaton()
// ─────────────────────────────────────────────────────────────

describe('toAutomaton()', () => {
  it('returns null when no initialStateId is set', () => {
    const builder: BuilderAutomaton = {
      states: [makeState('q0', 'q0', false)],
      initialStateId: null,
      transitions: [],
    };
    expect(toAutomaton(builder, ['a'])).toBeNull();
  });

  it('returns null when states array is empty', () => {
    const builder: BuilderAutomaton = {
      states: [],
      initialStateId: 'q0',
      transitions: [],
    };
    expect(toAutomaton(builder, ['a'])).toBeNull();
  });

  it('converts a valid builder automaton correctly', () => {
    const builder: BuilderAutomaton = {
      states: [makeState('q0', 'q0', false), makeState('q1', 'q1', true)],
      initialStateId: 'q0',
      transitions: [makeTransition('q0', 'q1', 'a'), makeTransition('q1', 'q1', 'a')],
    };
    const automaton = toAutomaton(builder, ['a']);
    expect(automaton).not.toBeNull();
    expect(automaton!.initialState).toBe('q0');
    expect(automaton!.acceptingStates).toEqual(['q1']);
    expect(automaton!.transitions).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: checkSolution() — error paths
// ─────────────────────────────────────────────────────────────

describe('checkSolution() — error paths', () => {
  const puzzle = WIRE_PUZZLES[0]; // Puzzle 1: contains at least one 'a'

  it('returns invalid when no initial state is set', () => {
    const builder: BuilderAutomaton = {
      states: [makeState('q0', 'q0', true)],
      initialStateId: null,
      transitions: [],
    };
    const result = checkSolution(builder, puzzle);
    expect(result.valid).toBe(false);
    expect(result.validationErrors.length).toBeGreaterThan(0);
    expect(result.score).toBe(0);
  });

  it('returns invalid when automaton fails structural validation', () => {
    // DFA with duplicate state IDs
    const builder: BuilderAutomaton = {
      states: [makeState('q0', 'q0', false), makeState('q0', 'q0dup', true)],
      initialStateId: 'q0',
      transitions: [],
    };
    const result = checkSolution(builder, puzzle);
    expect(result.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: checkSolution() — Puzzle 1 (contains at least one 'a')
// ─────────────────────────────────────────────────────────────

describe('checkSolution() — Puzzle 1: contains "a"', () => {
  const puzzle = WIRE_PUZZLES[0];

  // Correct 2-state DFA: q0 (start, not accepting) → q1 (accepting, loops)
  function correctBuilder(): BuilderAutomaton {
    return {
      states: [makeState('q0', 'q0', false), makeState('q1', 'q1', true)],
      initialStateId: 'q0',
      transitions: [
        makeTransition('q0', 'q1', 'a'),
        makeTransition('q0', 'q0', 'b'),
        makeTransition('q1', 'q1', 'a'),
        makeTransition('q1', 'q1', 'b'),
      ],
    };
  }

  it('passes all test cases for the correct DFA', () => {
    const result = checkSolution(correctBuilder(), puzzle);
    expect(result.valid).toBe(true);
    expect(result.perfect).toBe(true);
    expect(result.passed).toBe(result.total);
    expect(result.score).toBe(puzzle.points);
  });

  it('fails test cases for a DFA that always rejects', () => {
    const builder: BuilderAutomaton = {
      states: [makeState('q0', 'q0', false)],
      initialStateId: 'q0',
      transitions: [makeTransition('q0', 'q0', 'a'), makeTransition('q0', 'q0', 'b')],
    };
    const result = checkSolution(builder, puzzle);
    expect(result.valid).toBe(true);
    expect(result.perfect).toBe(false);
    // All "expected:true" cases will fail; partial score is 0 when no test passes
    expect(result.passed).toBeLessThan(result.total);
  });

  it('partial score is less than full points when not all tests pass', () => {
    // Always-accept DFA: q0 is accepting, loops on both symbols
    const builder: BuilderAutomaton = {
      states: [makeState('q0', 'q0', true)],
      initialStateId: 'q0',
      transitions: [makeTransition('q0', 'q0', 'a'), makeTransition('q0', 'q0', 'b')],
    };
    const result = checkSolution(builder, puzzle);
    expect(result.valid).toBe(true);
    expect(result.perfect).toBe(false);
    expect(result.score).toBeLessThan(puzzle.points);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: checkSolution() — Puzzle 2 (binary strings ending in '0')
// ─────────────────────────────────────────────────────────────

describe('checkSolution() — Puzzle 2: ends in "0"', () => {
  const puzzle = WIRE_PUZZLES[1]; // alphabet ['0','1']

  function correctBuilder(): BuilderAutomaton {
    return {
      states: [makeState('q0', 'q0', false), makeState('q1', 'q1', true)],
      initialStateId: 'q0',
      transitions: [
        makeTransition('q0', 'q1', '0'),
        makeTransition('q0', 'q0', '1'),
        makeTransition('q1', 'q1', '0'),
        makeTransition('q1', 'q0', '1'),
      ],
    };
  }

  it('passes all test cases for the correct DFA', () => {
    const result = checkSolution(correctBuilder(), puzzle);
    expect(result.valid).toBe(true);
    expect(result.perfect).toBe(true);
    expect(result.score).toBe(puzzle.points);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: checkSolution() — Puzzle 3 (length divisible by 3)
// ─────────────────────────────────────────────────────────────

describe('checkSolution() — Puzzle 3: length multiple of 3', () => {
  const puzzle = WIRE_PUZZLES[2]; // alphabet ['a']

  function correctBuilder(): BuilderAutomaton {
    return {
      states: [
        makeState('q0', 'q0', true),  // length mod 3 = 0 (accepting)
        makeState('q1', 'q1', false), // length mod 3 = 1
        makeState('q2', 'q2', false), // length mod 3 = 2
      ],
      initialStateId: 'q0',
      transitions: [
        makeTransition('q0', 'q1', 'a'),
        makeTransition('q1', 'q2', 'a'),
        makeTransition('q2', 'q0', 'a'),
      ],
    };
  }

  it('passes all test cases for the correct 3-state DFA', () => {
    const result = checkSolution(correctBuilder(), puzzle);
    expect(result.valid).toBe(true);
    expect(result.perfect).toBe(true);
    expect(result.score).toBe(puzzle.points);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: WIRE_PUZZLES definitions
// ─────────────────────────────────────────────────────────────

describe('WIRE_PUZZLES definitions', () => {
  it('has exactly 5 puzzles', () => {
    expect(WIRE_PUZZLES).toHaveLength(5);
  });

  it('each puzzle has a non-empty alphabet', () => {
    for (const p of WIRE_PUZZLES) {
      expect(p.alphabet.length).toBeGreaterThan(0);
    }
  });

  it('each puzzle has at least one test case', () => {
    for (const p of WIRE_PUZZLES) {
      expect(p.testCases.length).toBeGreaterThan(0);
    }
  });

  it('each puzzle has at least one accepted and one rejected test case', () => {
    for (const p of WIRE_PUZZLES) {
      const hasAccept = p.testCases.some((tc) => tc.expected);
      const hasReject = p.testCases.some((tc) => !tc.expected);
      expect(hasAccept, `Puzzle ${p.id} has no accepted test case`).toBe(true);
      expect(hasReject, `Puzzle ${p.id} has no rejected test case`).toBe(true);
    }
  });

  it('puzzle points are positive', () => {
    for (const p of WIRE_PUZZLES) {
      expect(p.points).toBeGreaterThan(0);
    }
  });
});
