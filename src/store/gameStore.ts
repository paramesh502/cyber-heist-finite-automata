import { LEVELS } from '../levels';

// ============================================================
// Game State — persisted to localStorage
// ============================================================

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  bestScore: number;
  attempts: number;
  hintsUsed: number;
  stars: number; // 1-3
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface GameState {
  playerName: string;
  totalScore: number;
  levelProgress: Record<number, LevelProgress>;
  achievements: Achievement[];
  unlockedLevels: number[];
  currentLevel: number | null;
  lastPlayed: string | null;
}

const STORAGE_KEY = 'cyber-heist-progress-v2';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_vault', title: 'First Breach', description: 'Complete your first level', icon: '🔓', earned: false },
  { id: 'no_hints', title: 'Pure Logic', description: 'Complete a level without using hints', icon: '🧠', earned: false },
  { id: 'first_try', title: 'One Shot', description: 'Complete a level on the first attempt', icon: '🎯', earned: false },
  { id: 'nfa_master', title: 'NFA Master', description: 'Complete the Nondeterministic Vault', icon: '⚡', earned: false },
  { id: 'epsilon_lord', title: 'Epsilon Lord', description: 'Complete the Epsilon Chamber', icon: '∈', earned: false },
  { id: 'reverse_eng', title: 'Reverse Engineer', description: 'Solve the unknown automaton', icon: '🔍', earned: false },
  { id: 'vault_cracked', title: 'Vault Cracked', description: 'Complete all 8 levels', icon: '🏆', earned: false },
  { id: 'speed_runner', title: 'Speed Runner', description: 'Complete 3 levels with 100 points each', icon: '⚡', earned: false },
];

function defaultProgress(): GameState {
  const levelProgress: Record<number, LevelProgress> = {};
  LEVELS.forEach((l) => {
    levelProgress[l.id] = {
      levelId: l.id,
      completed: false,
      bestScore: 0,
      attempts: 0,
      hintsUsed: 0,
      stars: 0,
    };
  });

  return {
    playerName: 'Agent',
    totalScore: 0,
    levelProgress,
    achievements: JSON.parse(JSON.stringify(DEFAULT_ACHIEVEMENTS)),
    unlockedLevels: [1], // Level 1 always unlocked
    currentLevel: null,
    lastPlayed: null,
  };
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as GameState;
    // Merge in any new achievements not yet in save
    const savedAchIds = new Set(parsed.achievements.map((a) => a.id));
    for (const def of DEFAULT_ACHIEVEMENTS) {
      if (!savedAchIds.has(def.id)) {
        parsed.achievements.push({ ...def });
      }
    }
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Could not save game state to localStorage.');
  }
}

export function resetGameState(): GameState {
  const fresh = defaultProgress();
  saveGameState(fresh);
  return fresh;
}

// ============================================================
// Scoring Logic
// ============================================================

export function calculateScore(
  attempts: number,
  hintsUsed: number
): { score: number; stars: number } {
  let score: number;
  if (attempts === 1 && hintsUsed === 0) {
    score = 100;
  } else if (attempts === 1) {
    score = 80 - hintsUsed * 10;
  } else if (attempts <= 3) {
    score = 75 - hintsUsed * 8;
  } else {
    score = 60 - hintsUsed * 5;
  }
  score = Math.max(10, score);

  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
  return { score, stars };
}

// ============================================================
// Achievement Logic
// ============================================================

export function checkAchievements(
  state: GameState,
  levelId: number,
  attempts: number,
  hintsUsed: number
): string[] {
  const earned: string[] = [];
  const completedLevels = Object.values(state.levelProgress).filter((lp) => lp.completed).length;

  const maybeEarn = (id: string) => {
    const ach = state.achievements.find((a) => a.id === id);
    if (ach && !ach.earned) {
      ach.earned = true;
      ach.earnedAt = new Date().toISOString();
      earned.push(id);
    }
  };

  if (completedLevels >= 1) maybeEarn('first_vault');
  if (hintsUsed === 0) maybeEarn('no_hints');
  if (attempts === 1) maybeEarn('first_try');
  if (levelId === 5) maybeEarn('nfa_master');
  if (levelId === 6) maybeEarn('epsilon_lord');
  if (levelId === 7) maybeEarn('reverse_eng');
  if (completedLevels >= LEVELS.length) maybeEarn('vault_cracked');

  // Speed runner: check if 3+ levels have 100 score
  const perfectLevels = Object.values(state.levelProgress).filter((lp) => lp.bestScore >= 100).length;
  if (perfectLevels >= 3) maybeEarn('speed_runner');

  return earned;
}
