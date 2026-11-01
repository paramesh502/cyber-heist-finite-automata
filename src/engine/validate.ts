import type { Automaton, ValidationResult } from './types';

/**
 * Validates an automaton definition for structural correctness.
 */
export function validateAutomaton(automaton: Automaton): ValidationResult {
  const errors: string[] = [];
  const stateIds = new Set(automaton.states.map((s) => s.id));

  // 1. State IDs must be unique
  if (stateIds.size !== automaton.states.length) {
    errors.push('State IDs must be unique.');
  }

  // 2. Initial state must exist
  if (!stateIds.has(automaton.initialState)) {
    errors.push(`Initial state "${automaton.initialState}" does not exist in states.`);
  }

  // 3. All accepting states must exist
  for (const as of automaton.acceptingStates) {
    if (!stateIds.has(as)) {
      errors.push(`Accepting state "${as}" does not exist in states.`);
    }
  }

  // 4. Alphabet must not be empty
  if (automaton.alphabet.length === 0) {
    errors.push('Alphabet must not be empty.');
  }

  // 5. All transitions must reference valid states and symbols
  const alphabetSet = new Set(automaton.alphabet);
  for (const t of automaton.transitions) {
    if (!stateIds.has(t.from)) {
      errors.push(`Transition from unknown state "${t.from}".`);
    }
    if (!stateIds.has(t.to)) {
      errors.push(`Transition to unknown state "${t.to}".`);
    }
    // Allow epsilon (ε) as a special symbol for NFAs
    if (t.symbol !== 'ε' && !alphabetSet.has(t.symbol)) {
      errors.push(
        `Transition uses symbol "${t.symbol}" not in alphabet [${automaton.alphabet.join(', ')}].`
      );
    }
  }

  // 6. For DFA: check for determinism (exactly one transition per state+symbol)
  if (automaton.type === 'DFA') {
    const seen = new Map<string, number>();
    for (const t of automaton.transitions) {
      const key = `${t.from}|${t.symbol}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    for (const [key, count] of seen) {
      if (count > 1) {
        const [state, sym] = key.split('|');
        errors.push(
          `DFA has ${count} transitions from state "${state}" on symbol "${sym}". DFA requires exactly one.`
        );
      }
    }
    // Epsilon transitions not allowed in DFA
    for (const t of automaton.transitions) {
      if (t.symbol === 'ε') {
        errors.push(`DFA cannot have epsilon transitions (found on state "${t.from}").`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
