import type { Automaton } from '../engine/types';

export interface TestCase {
  input: string;
  expected: boolean;
  explanation: string;
}

export interface LevelHint {
  order: number;
  text: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  difficulty: 'Rookie' | 'Hacker' | 'Elite' | 'Master';
  concept: string;
  objective: string;
  instructions: string;
  automaton: Automaton;
  testCases: TestCase[];
  hints: LevelHint[];
  /** The condition for unlocking: complete the previous level */
  unlockAfter: number | null;
  /** Educational explanation shown after completing the level */
  explanation: {
    conceptDescription: string;
    automatonExplanation: string;
    howToRead: string;
    acceptedExample: { input: string; why: string };
    rejectedExample: { input: string; why: string };
    takeaway: string;
  };
  bonusChallenge?: {
    description: string;
    input: string;
    expected: boolean;
  };
}
