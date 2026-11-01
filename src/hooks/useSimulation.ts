import { useState, useCallback, useRef, useEffect } from 'react';
import type { Automaton, DFAResult, NFAResult, DFATraceStep, NFATraceStep } from '../engine/types';
import { runDFA } from '../engine/dfa';
import { runNFA } from '../engine/nfa';

type SimulationStatus = 'idle' | 'running' | 'paused' | 'done' | 'error';

interface UseSimulationReturn {
  status: SimulationStatus;
  input: string;
  setInput: (v: string) => void;
  currentStep: number;
  totalSteps: number;
  activeStates: string[];
  visitedTransitions: { from: string; to: string; symbol: string }[];
  result: DFAResult | NFAResult | null;
  errorMessage: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stepForward: () => void;
  runFull: () => void;
  speed: number;
  setSpeed: (v: number) => void;
}

export function useSimulation(automaton: Automaton): UseSimulationReturn {
  const [input, setInputRaw] = useState('');
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<DFAResult | NFAResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speed, setSpeed] = useState(600); // ms per step

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const currentStepRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Derived: active states and visited transitions at current step
  const getActiveStates = (step: number): string[] => {
    if (!result) return [];
    if (automaton.type === 'DFA') {
      const dResult = result as DFAResult;
      const trace = dResult.trace;
      if (trace.length === 0) return [];
      const s = trace[Math.min(step, trace.length - 1)];
      return [s.toState];
    } else {
      const nResult = result as NFAResult;
      const trace = nResult.trace;
      if (trace.length === 0) return [];
      const s = trace[Math.min(step, trace.length - 1)] as NFATraceStep;
      return s.toStates;
    }
  };

  const getVisitedTransitions = (step: number): { from: string; to: string; symbol: string }[] => {
    if (!result || step === 0) return [];
    if (automaton.type === 'DFA') {
      const dResult = result as DFAResult;
      const trace = dResult.trace;
      const s = trace[Math.min(step, trace.length - 1)] as DFATraceStep;
      if (!s.fromState || !s.symbol) return [];
      return [{ from: s.fromState, to: s.toState, symbol: s.symbol }];
    } else {
      const nResult = result as NFAResult;
      const trace = nResult.trace;
      const s = trace[Math.min(step, trace.length - 1)] as NFATraceStep;
      if (!s.symbol) return [];
      return s.fromStates.map((from) => ({
        from,
        to: s.toStates[0] ?? from,
        symbol: s.symbol!,
      }));
    }
  };

  const activeStates = result ? getActiveStates(currentStep) : [automaton.initialState];
  const visitedTransitions = result ? getVisitedTransitions(currentStep) : [];
  const totalSteps = result
    ? automaton.type === 'DFA'
      ? (result as DFAResult).trace.length - 1
      : (result as NFAResult).trace.length - 1
    : 0;

  const setInput = useCallback((v: string) => {
    setInputRaw(v);
    setStatus('idle');
    setCurrentStep(0);
    setResult(null);
    setErrorMessage(null);
    clearTimer();
  }, []);

  const computeResult = useCallback(
    (inp: string): DFAResult | NFAResult | null => {
      if (automaton.type === 'DFA') {
        return runDFA(automaton, inp);
      } else {
        return runNFA(automaton, inp);
      }
    },
    [automaton]
  );

  const scheduleNextStep = useCallback(
    (step: number, maxStep: number) => {
      if (isPausedRef.current) return;
      if (step >= maxStep) {
        setStatus('done');
        return;
      }
      timerRef.current = setTimeout(() => {
        const next = step + 1;
        currentStepRef.current = next;
        setCurrentStep(next);
        scheduleNextStep(next, maxStep);
      }, speed);
    },
    [speed]
  );

  const start = useCallback(() => {
    clearTimer();
    const res = computeResult(input);
    if (!res) return;

    if (res.errorMessage) {
      setErrorMessage(res.errorMessage);
      setStatus('error');
      return;
    }

    setResult(res);
    setCurrentStep(0);
    currentStepRef.current = 0;
    setStatus('running');
    isPausedRef.current = false;

    const max = automaton.type === 'DFA'
      ? (res as DFAResult).trace.length - 1
      : (res as NFAResult).trace.length - 1;

    scheduleNextStep(0, max);
  }, [input, computeResult, scheduleNextStep, automaton.type]);

  const pause = useCallback(() => {
    clearTimer();
    isPausedRef.current = true;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (!result) return;
    isPausedRef.current = false;
    setStatus('running');
    const max = automaton.type === 'DFA'
      ? (result as DFAResult).trace.length - 1
      : (result as NFAResult).trace.length - 1;
    scheduleNextStep(currentStepRef.current, max);
  }, [result, scheduleNextStep, automaton.type]);

  const reset = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setCurrentStep(0);
    currentStepRef.current = 0;
    setResult(null);
    setErrorMessage(null);
    isPausedRef.current = false;
  }, []);

  const stepForward = useCallback(() => {
    if (!result) {
      // Compute if needed
      const res = computeResult(input);
      if (!res) return;
      if (res.errorMessage) {
        setErrorMessage(res.errorMessage);
        setStatus('error');
        return;
      }
      setResult(res);
      setCurrentStep(1);
      currentStepRef.current = 1;
      setStatus('paused');
      return;
    }

    const max = automaton.type === 'DFA'
      ? (result as DFAResult).trace.length - 1
      : (result as NFAResult).trace.length - 1;

    const next = Math.min(currentStep + 1, max);
    currentStepRef.current = next;
    setCurrentStep(next);
    if (next >= max) setStatus('done');
    else setStatus('paused');
  }, [result, currentStep, input, computeResult, automaton.type]);

  const runFull = useCallback(() => {
    clearTimer();
    const res = computeResult(input);
    if (!res) return;
    if (res.errorMessage) {
      setErrorMessage(res.errorMessage);
      setStatus('error');
      return;
    }
    setResult(res);
    const max = automaton.type === 'DFA'
      ? (res as DFAResult).trace.length - 1
      : (res as NFAResult).trace.length - 1;
    setCurrentStep(max);
    currentStepRef.current = max;
    setStatus('done');
    isPausedRef.current = false;
  }, [input, computeResult, automaton.type]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  return {
    status,
    input,
    setInput,
    currentStep,
    totalSteps,
    activeStates,
    visitedTransitions,
    result,
    errorMessage,
    start,
    pause,
    resume,
    reset,
    stepForward,
    runFull,
    speed,
    setSpeed,
  };
}
