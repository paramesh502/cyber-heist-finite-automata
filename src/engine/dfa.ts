import type { Automaton, DFAResult, DFATraceStep, StateId, Symbol } from './types';
import { validateAutomaton } from './validate';

/**
 * Build a fast lookup map: state -> symbol -> nextState
 */
function buildTransitionMap(automaton: Automaton): Map<string, StateId> {
  const map = new Map<string, StateId>();
  for (const t of automaton.transitions) {
    map.set(`${t.from}|${t.symbol}`, t.to);
  }
  return map;
}

/**
 * DFA delta function: returns next state or null if no transition exists.
 */
export function dfaDelta(
  _automaton: Automaton,
  transitionMap: Map<string, StateId>,
  state: StateId,
  symbol: Symbol
): StateId | null {
  return transitionMap.get(`${state}|${symbol}`) ?? null;
}

/**
 * Run a DFA on an input string.
 * Returns a full execution trace and acceptance result.
 */
export function runDFA(automaton: Automaton, input: string): DFAResult {
  // Validate the automaton first
  const validation = validateAutomaton(automaton);
  if (!validation.valid) {
    return {
      accepted: false,
      trace: [],
      finalState: null,
      errorMessage: `Invalid automaton: ${validation.errors.join('; ')}`,
    };
  }

  const alphabetSet = new Set(automaton.alphabet);
  const acceptingSet = new Set(automaton.acceptingStates);
  const transitionMap = buildTransitionMap(automaton);

  // Split input into symbols.  We treat each character as one symbol.
  const symbols: Symbol[] = input === '' ? [] : input.split('');

  // Check for invalid symbols before running
  for (const sym of symbols) {
    if (!alphabetSet.has(sym)) {
      return {
        accepted: false,
        trace: [],
        finalState: null,
        errorMessage: `Invalid symbol "${sym}" — not in alphabet {${automaton.alphabet.join(', ')}}.`,
      };
    }
  }

  const trace: DFATraceStep[] = [];
  let currentState: StateId = automaton.initialState;

  // Initial step (before consuming any symbol)
  trace.push({
    stepIndex: 0,
    symbol: null,
    fromState: null,
    toState: currentState,
    isAccepting: acceptingSet.has(currentState),
  });

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const nextState = dfaDelta(automaton, transitionMap, currentState, sym);

    if (nextState === null) {
      // Missing transition — string is rejected (implicit dead/trap state)
      return {
        accepted: false,
        trace,
        finalState: currentState,
        rejectionReason: `No transition from state "${currentState}" on symbol "${sym}". String rejected (dead state).`,
      };
    }

    trace.push({
      stepIndex: i + 1,
      symbol: sym,
      fromState: currentState,
      toState: nextState,
      isAccepting: acceptingSet.has(nextState),
    });

    currentState = nextState;
  }

  const accepted = acceptingSet.has(currentState);
  return {
    accepted,
    trace,
    finalState: currentState,
    rejectionReason: accepted
      ? undefined
      : `Ended in state "${currentState}" which is not an accepting state.`,
  };
}
