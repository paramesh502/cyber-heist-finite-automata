import { describe, it, expect } from 'vitest';
import { exportToJFLAP, importFromJFLAP } from '../jflap';
import { LEVELS } from '../levels';
import { runDFA } from '../engine/dfa';
import { runNFA } from '../engine/nfa';

describe('JFLAP export', () => {
  it('generates valid XML for all level automata', () => {
    for (const level of LEVELS) {
      const xml = exportToJFLAP(level.automaton);
      expect(xml).toContain('<?xml');
      expect(xml).toContain('<structure>');
      expect(xml).toContain('<type>fa</type>');
      expect(xml).toContain('<automaton>');
      expect(xml).toContain('<state');
      expect(xml).toContain('<initial/>');
      expect(xml).toContain('<transition>');
    }
  });

  it('marks initial state correctly', () => {
    const level1 = LEVELS[0];
    const xml = exportToJFLAP(level1.automaton);
    expect(xml).toContain('<initial/>');
  });

  it('marks accepting states correctly', () => {
    const level2 = LEVELS[1];
    const xml = exportToJFLAP(level2.automaton);
    expect(xml).toContain('<final/>');
  });

  it('uses empty <read/> for epsilon transitions', () => {
    const level6 = LEVELS[5]; // epsilon level
    const xml = exportToJFLAP(level6.automaton);
    expect(xml).toContain('<read/>');
  });
});

describe('JFLAP round-trip (export then import)', () => {
  it('imported DFA produces same acceptance as original', () => {
    const originalAutomaton = LEVELS[1].automaton; // Level 2: ends in "01"
    const xml = exportToJFLAP(originalAutomaton);

    const importResult = importFromJFLAP(xml);
    expect(importResult.success).toBe(true);
    expect(importResult.automaton).toBeDefined();

    const imported = importResult.automaton!;
    const testCases = [
      { input: '01', expected: true },
      { input: '101', expected: true },
      { input: '10', expected: false },
      { input: '111', expected: false },
    ];

    for (const tc of testCases) {
      const origResult = runDFA(originalAutomaton, tc.input);
      const impResult =
        imported.type === 'DFA'
          ? runDFA(imported, tc.input)
          : runNFA(imported, tc.input);
      expect(impResult.accepted).toBe(origResult.accepted);
    }
  });

  it('returns error for invalid XML', () => {
    const result = importFromJFLAP('not xml at all');
    expect(result.success).toBe(false);
  });

  it('returns error for non-FA JFLAP type', () => {
    const xml = `<?xml version="1.0"?><structure><type>cfg</type><automaton></automaton></structure>`;
    const result = importFromJFLAP(xml);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('cfg');
  });
});
