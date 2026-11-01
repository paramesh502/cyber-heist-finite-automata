import { describe, it, expect } from 'vitest';
import { runDFA } from '../engine/dfa';
import { LEVELS } from '../levels';
import type { Automaton } from '../engine/types';

// ─────────────────────────────────────────────────────────────
// Test: Level 2 DFA — binary strings ending in "01"
// ─────────────────────────────────────────────────────────────
const dfa_ends01 = LEVELS.find((l) => l.id === 2)!.automaton;

describe('DFA: binary strings ending in "01"', () => {
  it('accepts "01"',   () => expect(runDFA(dfa_ends01, '01').accepted).toBe(true));
  it('accepts "101"',  () => expect(runDFA(dfa_ends01, '101').accepted).toBe(true));
  it('accepts "1101"', () => expect(runDFA(dfa_ends01, '1101').accepted).toBe(true));
  it('accepts "001"',  () => expect(runDFA(dfa_ends01, '001').accepted).toBe(true));
  it('rejects "10"',   () => expect(runDFA(dfa_ends01, '10').accepted).toBe(false));
  it('rejects "111"',  () => expect(runDFA(dfa_ends01, '111').accepted).toBe(false));
  it('rejects "0"',    () => expect(runDFA(dfa_ends01, '0').accepted).toBe(false));
  it('rejects "010"',  () => expect(runDFA(dfa_ends01, '010').accepted).toBe(false));
  it('rejects ""',     () => expect(runDFA(dfa_ends01, '').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: Level 3 DFA — even number of 1s
// ─────────────────────────────────────────────────────────────
const dfa_parity = LEVELS.find((l) => l.id === 3)!.automaton;

describe('DFA: even number of 1s', () => {
  it('accepts empty string ""', () => expect(runDFA(dfa_parity, '').accepted).toBe(true));
  it('accepts "0"',     () => expect(runDFA(dfa_parity, '0').accepted).toBe(true));
  it('accepts "11"',    () => expect(runDFA(dfa_parity, '11').accepted).toBe(true));
  it('accepts "1010"',  () => expect(runDFA(dfa_parity, '1010').accepted).toBe(true));
  it('accepts "1100"',  () => expect(runDFA(dfa_parity, '1100').accepted).toBe(true));
  it('rejects "1"',     () => expect(runDFA(dfa_parity, '1').accepted).toBe(false));
  it('rejects "10"',    () => expect(runDFA(dfa_parity, '10').accepted).toBe(false));
  it('rejects "111"',   () => expect(runDFA(dfa_parity, '111').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: Level 4 DFA — contains substring "101"
// ─────────────────────────────────────────────────────────────
const dfa_101 = LEVELS.find((l) => l.id === 4)!.automaton;

describe('DFA: contains substring "101"', () => {
  it('accepts "101"',   () => expect(runDFA(dfa_101, '101').accepted).toBe(true));
  it('accepts "1101"',  () => expect(runDFA(dfa_101, '1101').accepted).toBe(true));
  it('accepts "0101"',  () => expect(runDFA(dfa_101, '0101').accepted).toBe(true));
  it('accepts "10101"', () => expect(runDFA(dfa_101, '10101').accepted).toBe(true));
  it('rejects "1001"',  () => expect(runDFA(dfa_101, '1001').accepted).toBe(false));
  it('rejects "000"',   () => expect(runDFA(dfa_101, '000').accepted).toBe(false));
  it('rejects "11"',    () => expect(runDFA(dfa_101, '11').accepted).toBe(false));
  it('rejects ""',      () => expect(runDFA(dfa_101, '').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: invalid input symbols
// ─────────────────────────────────────────────────────────────
describe('DFA: invalid input symbols', () => {
  it('returns error for symbol not in alphabet', () => {
    const result = runDFA(dfa_ends01, '2'); // "2" not in {0,1}
    expect(result.errorMessage).toBeTruthy();
    expect(result.accepted).toBe(false);
  });

  it('returns error for "abc" in binary DFA', () => {
    const result = runDFA(dfa_parity, 'abc');
    expect(result.errorMessage).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Test: execution trace correctness
// ─────────────────────────────────────────────────────────────
describe('DFA: execution trace', () => {
  it('trace length equals input length + 1 (initial step)', () => {
    const result = runDFA(dfa_ends01, '101');
    expect(result.trace.length).toBe(4); // steps 0,1,2,3
  });

  it('trace step 0 has null symbol (initial step)', () => {
    const result = runDFA(dfa_ends01, '01');
    expect(result.trace[0].symbol).toBeNull();
    expect(result.trace[0].fromState).toBeNull();
  });

  it('final trace step has correct state for "01"', () => {
    const result = runDFA(dfa_ends01, '01');
    const lastStep = result.trace[result.trace.length - 1];
    expect(lastStep.isAccepting).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: Level 7 DFA — binary numbers divisible by 3
// ─────────────────────────────────────────────────────────────
const dfa_div3 = LEVELS.find((l) => l.id === 7)!.automaton;

describe('DFA: binary divisible by 3', () => {
  it('accepts "0" (=0)', ()   => expect(runDFA(dfa_div3, '0').accepted).toBe(true));
  it('accepts "11" (=3)', ()  => expect(runDFA(dfa_div3, '11').accepted).toBe(true));
  it('accepts "110" (=6)', () => expect(runDFA(dfa_div3, '110').accepted).toBe(true));
  it('accepts "1001" (=9)',() => expect(runDFA(dfa_div3, '1001').accepted).toBe(true));
  it('rejects "1" (=1)', ()  => expect(runDFA(dfa_div3, '1').accepted).toBe(false));
  it('rejects "10" (=2)', () => expect(runDFA(dfa_div3, '10').accepted).toBe(false));
  it('rejects "100" (=4)',() => expect(runDFA(dfa_div3, '100').accepted).toBe(false));
  it('rejects "101" (=5)',() => expect(runDFA(dfa_div3, '101').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: automaton validation
// ─────────────────────────────────────────────────────────────
import { validateAutomaton } from '../engine/validate';

describe('Automaton validation', () => {
  it('all game-level automata are valid', () => {
    for (const level of LEVELS) {
      const result = validateAutomaton(level.automaton);
      expect(result.valid, `Level ${level.id} automaton invalid: ${result.errors.join('; ')}`).toBe(true);
    }
  });

  it('detects missing initial state', () => {
    const bad: Automaton = {
      id: 'bad', type: 'DFA', description: '',
      states: [{ id: 'q0', label: 'q0', x: 50, y: 50 }],
      alphabet: ['a'],
      initialState: 'q_missing',
      acceptingStates: ['q0'],
      transitions: [],
    };
    expect(validateAutomaton(bad).valid).toBe(false);
  });

  it('detects duplicate state IDs', () => {
    const bad: Automaton = {
      id: 'bad2', type: 'DFA', description: '',
      states: [
        { id: 'q0', label: 'q0', x: 30, y: 50 },
        { id: 'q0', label: 'q0dup', x: 70, y: 50 },
      ],
      alphabet: ['a'],
      initialState: 'q0',
      acceptingStates: ['q0'],
      transitions: [],
    };
    expect(validateAutomaton(bad).valid).toBe(false);
  });

  it('detects DFA with non-determinism', () => {
    const bad: Automaton = {
      id: 'bad3', type: 'DFA', description: '',
      states: [
        { id: 'q0', label: 'q0', x: 30, y: 50 },
        { id: 'q1', label: 'q1', x: 70, y: 50 },
      ],
      alphabet: ['a'],
      initialState: 'q0',
      acceptingStates: ['q1'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: 'a' },
        { from: 'q0', to: 'q0', symbol: 'a' }, // duplicate!
      ],
    };
    expect(validateAutomaton(bad).valid).toBe(false);
  });
});
