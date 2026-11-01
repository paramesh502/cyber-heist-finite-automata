// ============================================================
// Finite Automata Type Definitions
// ============================================================

export type StateId = string;
export type Symbol = string;

/** A single state in an automaton */
export interface AutomatonState {
  id: StateId;
  label: string;
  /** X position for visualization (0-100 percentage of container) */
  x: number;
  /** Y position for visualization (0-100 percentage of container) */
  y: number;
}

/** A single transition */
export interface Transition {
  from: StateId;
  to: StateId;
  /** 'ε' for epsilon transitions */
  symbol: Symbol;
}

/** Automaton type */
export type AutomatonType = 'DFA' | 'NFA';

/** Full automaton definition */
export interface Automaton {
  id: string;
  type: AutomatonType;
  states: AutomatonState[];
  alphabet: Symbol[];
  initialState: StateId;
  acceptingStates: StateId[];
  transitions: Transition[];
  description: string;
}

/** Step in a DFA execution trace */
export interface DFATraceStep {
  stepIndex: number;
  symbol: Symbol | null; // null = initial step
  fromState: StateId | null;
  toState: StateId;
  isAccepting: boolean;
}

/** Step in an NFA execution trace */
export interface NFATraceStep {
  stepIndex: number;
  symbol: Symbol | null;
  fromStates: StateId[];
  toStates: StateId[];
  hasAccepting: boolean;
}

/** Result of running a string through a DFA */
export interface DFAResult {
  accepted: boolean;
  trace: DFATraceStep[];
  finalState: StateId | null;
  rejectionReason?: string;
  errorMessage?: string;
}

/** Result of running a string through an NFA */
export interface NFAResult {
  accepted: boolean;
  trace: NFATraceStep[];
  finalStates: StateId[];
  rejectionReason?: string;
  errorMessage?: string;
}

/** Validation result for an automaton definition */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
