import type { Automaton, AutomatonState, Transition } from '../engine/types';

export interface ImportResult {
  success: boolean;
  automaton?: Automaton;
  errors: string[];
}

/**
 * Parse a JFLAP .jff XML file and convert it to our Automaton type.
 * Handles basic FA definitions (DFA and NFA).
 */
export function importFromJFLAP(xmlContent: string): ImportResult {
  const errors: string[] = [];

  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xmlContent, 'application/xml');

    // Check for XML parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { success: false, errors: ['Invalid XML: ' + parseError.textContent?.slice(0, 100)] };
    }
  } catch (e) {
    return { success: false, errors: ['Failed to parse XML file.'] };
  }

  // Check type
  const typeEl = doc.querySelector('type');
  const type = typeEl?.textContent?.trim().toLowerCase();
  if (type !== 'fa') {
    return {
      success: false,
      errors: [
        `Unsupported JFLAP type: "${type}". Only finite automata (FA) are supported.`,
      ],
    };
  }

  // Parse states
  const stateElements = doc.querySelectorAll('state');
  if (stateElements.length === 0) {
    errors.push('No states found in the automaton.');
    return { success: false, errors };
  }

  const states: AutomatonState[] = [];
  let initialState: string | null = null;
  const acceptingStates: string[] = [];
  const stateIdMap = new Map<string, string>(); // JFLAP id → our state id

  stateElements.forEach((el) => {
    const jflapId = el.getAttribute('id') ?? '';
    const name = el.getAttribute('name') ?? `q${jflapId}`;
    const xAttr = parseFloat(el.getAttribute('x') ?? '100');
    const yAttr = parseFloat(el.getAttribute('y') ?? '100');
    // Map JFLAP pixel coords back to 0-100 percentage
    const x = Math.min(95, Math.max(5, xAttr / 6));
    const y = Math.min(95, Math.max(5, yAttr / 4));

    const stateId = name; // use the name as our state ID
    stateIdMap.set(jflapId, stateId);

    states.push({ id: stateId, label: name, x, y });

    if (el.querySelector('initial') !== null) {
      initialState = stateId;
    }
    if (el.querySelector('final') !== null) {
      acceptingStates.push(stateId);
    }
  });

  if (!initialState) {
    errors.push('No initial state found.');
    return { success: false, errors };
  }

  // Parse transitions
  const transitionElements = doc.querySelectorAll('transition');
  const transitions: Transition[] = [];
  const alphabetSet = new Set<string>();
  let hasEpsilon = false;

  transitionElements.forEach((el) => {
    const fromJFLAP = el.querySelector('from')?.textContent?.trim() ?? '';
    const toJFLAP = el.querySelector('to')?.textContent?.trim() ?? '';
    const readEl = el.querySelector('read');
    const symbol = readEl?.textContent?.trim() ?? '';

    const fromId = stateIdMap.get(fromJFLAP);
    const toId = stateIdMap.get(toJFLAP);

    if (!fromId || !toId) {
      errors.push(`Transition references unknown state id: from="${fromJFLAP}" to="${toJFLAP}".`);
      return;
    }

    const transitionSymbol = symbol === '' ? 'ε' : symbol;
    if (transitionSymbol === 'ε') {
      hasEpsilon = true;
    } else {
      alphabetSet.add(transitionSymbol);
    }

    transitions.push({ from: fromId, to: toId, symbol: transitionSymbol });
  });

  const alphabet = [...alphabetSet].sort();

  if (alphabet.length === 0 && !hasEpsilon) {
    errors.push('No transitions with input symbols found. The automaton may be empty.');
    return { success: false, errors };
  }

  // Determine DFA vs NFA
  const transitionCount = new Map<string, number>();
  let isNFA = hasEpsilon;
  for (const t of transitions) {
    if (t.symbol === 'ε') continue;
    const key = `${t.from}|${t.symbol}`;
    const count = (transitionCount.get(key) ?? 0) + 1;
    transitionCount.set(key, count);
    if (count > 1) isNFA = true;
  }

  const automaton: Automaton = {
    id: `imported-${Date.now()}`,
    type: isNFA ? 'NFA' : 'DFA',
    description: 'Imported from JFLAP .jff file',
    states,
    alphabet,
    initialState,
    acceptingStates,
    transitions,
  };

  return { success: true, automaton, errors };
}
