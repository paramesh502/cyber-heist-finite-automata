import type { Automaton, NFAResult, NFATraceStep, StateId, Symbol } from './types';
import { validateAutomaton } from './validate';

/**
 * Compute the epsilon-closure of a set of states.
 * The epsilon-closure of a set S is S plus all states reachable from S
 * via zero or more epsilon transitions.
 */
export function epsilonClosure(
  automaton: Automaton,
  states: Set<StateId>
): Set<StateId> {
  const closure = new Set<StateId>(states);
  const stack = [...states];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const t of automaton.transitions) {
      if (t.from === current && t.symbol === 'ε' && !closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return closure;
}

/**
 * Compute the set of states reachable from a set of states on a given symbol,
 * including the epsilon-closure of the result.
 */
export function nfaMove(
  automaton: Automaton,
  states: Set<StateId>,
  symbol: Symbol
): Set<StateId> {
  const reachable = new Set<StateId>();

  for (const state of states) {
    for (const t of automaton.transitions) {
      if (t.from === state && t.symbol === symbol) {
        reachable.add(t.to);
      }
    }
  }

  // Apply epsilon-closure to all reached states
  return epsilonClosure(automaton, reachable);
}

/**
 * Run an NFA on an input string.
 * Correctly tracks ALL reachable states simultaneously (subset construction simulation).
 */
export function runNFA(automaton: Automaton, input: string): NFAResult {
  const validation = validateAutomaton(automaton);
  if (!validation.valid) {
    return {
      accepted: false,
      trace: [],
      finalStates: [],
      errorMessage: `Invalid automaton: ${validation.errors.join('; ')}`,
    };
  }

  const alphabetSet = new Set(automaton.alphabet);
  const acceptingSet = new Set(automaton.acceptingStates);
  const symbols: Symbol[] = input === '' ? [] : input.split('');

  // Check for invalid symbols
  for (const sym of symbols) {
    if (!alphabetSet.has(sym)) {
      return {
        accepted: false,
        trace: [],
        finalStates: [],
        errorMessage: `Invalid symbol "${sym}" — not in alphabet {${automaton.alphabet.join(', ')}}.`,
      };
    }
  }

  const trace: NFATraceStep[] = [];

  // Start: epsilon-closure of the initial state
  let currentStates = epsilonClosure(automaton, new Set([automaton.initialState]));

  trace.push({
    stepIndex: 0,
    symbol: null,
    fromStates: [],
    toStates: [...currentStates],
    hasAccepting: [...currentStates].some((s) => acceptingSet.has(s)),
  });

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const prevStates = currentStates;
    const nextStates = nfaMove(automaton, currentStates, sym);

    trace.push({
      stepIndex: i + 1,
      symbol: sym,
      fromStates: [...prevStates],
      toStates: [...nextStates],
      hasAccepting: [...nextStates].some((s) => acceptingSet.has(s)),
    });

    currentStates = nextStates;
  }

  const finalStates = [...currentStates];
  const accepted = finalStates.some((s) => acceptingSet.has(s));

  return {
    accepted,
    trace,
    finalStates,
    rejectionReason: accepted
      ? undefined
      : finalStates.length === 0
      ? 'No reachable states after processing the entire input.'
      : `Final states {${finalStates.join(', ')}} — none are accepting states.`,
  };
}
