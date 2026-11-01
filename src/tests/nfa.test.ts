import { describe, it, expect } from 'vitest';
import { runNFA } from '../engine/nfa';
import { runDFA } from '../engine/dfa';
import { epsilonClosure, nfaMove } from '../engine/nfa';
import { LEVELS } from '../levels';

// ─────────────────────────────────────────────────────────────
// Test: Level 5 NFA — ends in "1" OR starts with "0"
// ─────────────────────────────────────────────────────────────
const nfa_5 = LEVELS.find((l) => l.id === 5)!.automaton;

describe('NFA: Level 5 (ends in 1 OR starts with 0)', () => {
  it('accepts "01"',  () => expect(runNFA(nfa_5, '01').accepted).toBe(true));
  it('accepts "0"',   () => expect(runNFA(nfa_5, '0').accepted).toBe(true));
  it('accepts "1"',   () => expect(runNFA(nfa_5, '1').accepted).toBe(true));
  it('accepts "11"',  () => expect(runNFA(nfa_5, '11').accepted).toBe(true));
  it('accepts "001"', () => expect(runNFA(nfa_5, '001').accepted).toBe(true));
  it('rejects "10"',  () => expect(runNFA(nfa_5, '10').accepted).toBe(false));
  it('rejects "100"', () => expect(runNFA(nfa_5, '100').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: Level 6 NFA with ε-transitions — a* | b* | c*
// ─────────────────────────────────────────────────────────────
const nfa_6 = LEVELS.find((l) => l.id === 6)!.automaton;

describe('NFA: Level 6 (epsilon — a* | b* | c*)', () => {
  it('accepts "a"',   () => expect(runNFA(nfa_6, 'a').accepted).toBe(true));
  it('accepts "aaa"', () => expect(runNFA(nfa_6, 'aaa').accepted).toBe(true));
  it('accepts "b"',   () => expect(runNFA(nfa_6, 'b').accepted).toBe(true));
  it('accepts "bbb"', () => expect(runNFA(nfa_6, 'bbb').accepted).toBe(true));
  it('accepts "c"',   () => expect(runNFA(nfa_6, 'c').accepted).toBe(true));
  it('accepts "cc"',  () => expect(runNFA(nfa_6, 'cc').accepted).toBe(true));
  it('rejects "ab"',  () => expect(runNFA(nfa_6, 'ab').accepted).toBe(false));
  it('rejects "abc"', () => expect(runNFA(nfa_6, 'abc').accepted).toBe(false));
  it('rejects "ba"',  () => expect(runNFA(nfa_6, 'ba').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: Level 8 NFA — (ab)* OR ends in "aa"
// ─────────────────────────────────────────────────────────────
const nfa_8 = LEVELS.find((l) => l.id === 8)!.automaton;

describe('NFA: Level 8 ((ab)* OR ends in aa)', () => {
  it('accepts ""',     () => expect(runNFA(nfa_8, '').accepted).toBe(true));
  it('accepts "ab"',   () => expect(runNFA(nfa_8, 'ab').accepted).toBe(true));
  it('accepts "abab"', () => expect(runNFA(nfa_8, 'abab').accepted).toBe(true));
  it('accepts "aa"',   () => expect(runNFA(nfa_8, 'aa').accepted).toBe(true));
  it('accepts "baa"',  () => expect(runNFA(nfa_8, 'baa').accepted).toBe(true));
  it('accepts "abaaa"',() => expect(runNFA(nfa_8, 'abaaa').accepted).toBe(true));
  it('rejects "a"',    () => expect(runNFA(nfa_8, 'a').accepted).toBe(false));
  it('rejects "ba"',   () => expect(runNFA(nfa_8, 'ba').accepted).toBe(false));
  it('rejects "abb"',  () => expect(runNFA(nfa_8, 'abb').accepted).toBe(false));
  it('rejects "b"',    () => expect(runNFA(nfa_8, 'b').accepted).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// Test: epsilon-closure utility
// ─────────────────────────────────────────────────────────────
describe('Epsilon closure', () => {
  it('computes correct epsilon-closure for level 6 from q0', () => {
    const closure = epsilonClosure(nfa_6, new Set(['q0']));
    // q0 →ε→ q1, q2, q3
    expect(closure.has('q0')).toBe(true);
    expect(closure.has('q1')).toBe(true);
    expect(closure.has('q2')).toBe(true);
    expect(closure.has('q3')).toBe(true);
  });

  it('state with no epsilon transitions returns itself', () => {
    const closure = epsilonClosure(nfa_5, new Set(['q3']));
    expect(closure.has('q3')).toBe(true);
    expect(closure.size).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: NFA move
// ─────────────────────────────────────────────────────────────
describe('NFA move', () => {
  it('move from epsilon-closure of {q0} on "a" in level 6 reaches q4', () => {
    // First compute epsilon-closure of q0: {q0, q1, q2, q3}
    const eclosure = epsilonClosure(nfa_6, new Set(['q0']));
    // Then move on 'a': q1→q4
    const move = nfaMove(nfa_6, eclosure, 'a');
    expect(move.has('q4')).toBe(true);
  });

  it('all paths fail gives empty set, meaning rejection', () => {
    const result = runNFA(nfa_6, 'ab');
    expect(result.accepted).toBe(false);
    expect(result.finalStates.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: NFA execution trace properties
// ─────────────────────────────────────────────────────────────
describe('NFA execution trace', () => {
  it('trace has correct number of steps', () => {
    const result = runNFA(nfa_5, '011');
    expect(result.trace.length).toBe(4); // steps 0,1,2,3
  });

  it('initial step has empty fromStates', () => {
    const result = runNFA(nfa_5, '01');
    expect(result.trace[0].fromStates).toHaveLength(0);
    expect(result.trace[0].symbol).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// Test: Invalid symbols in NFA
// ─────────────────────────────────────────────────────────────
describe('NFA: invalid symbols', () => {
  it('returns error for symbol not in alphabet', () => {
    const result = runNFA(nfa_5, 'x');
    expect(result.errorMessage).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Test: every level test case matches the engine
// ─────────────────────────────────────────────────────────────
describe('All levels: test cases match engine', () => {
  for (const level of LEVELS) {
    for (const tc of level.testCases) {
      it(`Level ${level.id} "${tc.input || 'ε'}" → ${tc.expected ? 'ACCEPT' : 'REJECT'}`, () => {
        const result = level.automaton.type === 'DFA'
          ? runDFA(level.automaton, tc.input)
          : runNFA(level.automaton, tc.input);
        expect(result.accepted).toBe(tc.expected);
      });
    }
  }
});
