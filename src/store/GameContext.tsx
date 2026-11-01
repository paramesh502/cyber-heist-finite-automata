import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  type GameState,
  loadGameState,
  saveGameState,
  resetGameState,
  calculateScore,
  checkAchievements,
} from './gameStore';
import { LEVELS } from '../levels';

// ============================================================
// Actions
// ============================================================

type Action =
  | { type: 'COMPLETE_LEVEL'; levelId: number; attempts: number; hintsUsed: number }
  | { type: 'RESET_PROGRESS' }
  | { type: 'SET_CURRENT_LEVEL'; levelId: number | null }
  | { type: 'SET_PLAYER_NAME'; name: string };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'COMPLETE_LEVEL': {
      const { levelId, attempts, hintsUsed } = action;
      const { score, stars } = calculateScore(attempts, hintsUsed);
      const newAchievements = checkAchievements(state, levelId, attempts, hintsUsed);

      const prevProgress = state.levelProgress[levelId];
      const newBestScore = Math.max(prevProgress?.bestScore ?? 0, score);
      const wasCompleted = prevProgress?.completed ?? false;

      // Unlock next level
      const nextLevelId = levelId + 1;
      const newUnlocked = [...state.unlockedLevels];
      if (nextLevelId <= LEVELS.length && !newUnlocked.includes(nextLevelId)) {
        newUnlocked.push(nextLevelId);
      }

      const scoreDelta = wasCompleted ? Math.max(0, score - (prevProgress?.bestScore ?? 0)) : score;

      const updatedState: GameState = {
        ...state,
        totalScore: state.totalScore + scoreDelta,
        unlockedLevels: newUnlocked,
        lastPlayed: new Date().toISOString(),
        levelProgress: {
          ...state.levelProgress,
          [levelId]: {
            levelId,
            completed: true,
            bestScore: newBestScore,
            attempts: (prevProgress?.attempts ?? 0) + attempts,
            hintsUsed: (prevProgress?.hintsUsed ?? 0) + hintsUsed,
            stars: Math.max(prevProgress?.stars ?? 0, stars),
          },
        },
      };

      // Apply newly earned achievements
      if (newAchievements.length > 0) {
        // Achievements were mutated in place by checkAchievements
        updatedState.achievements = [...state.achievements];
      }

      return updatedState;
    }

    case 'RESET_PROGRESS':
      return resetGameState();

    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.levelId };

    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.name };

    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================

interface GameContextValue {
  state: GameState;
  completeLevel: (levelId: number, attempts: number, hintsUsed: number) => void;
  resetProgress: () => void;
  setCurrentLevel: (levelId: number | null) => void;
  setPlayerName: (name: string) => void;
  isLevelUnlocked: (levelId: number) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadGameState);

  // Persist on every state change
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const completeLevel = useCallback(
    (levelId: number, attempts: number, hintsUsed: number) => {
      dispatch({ type: 'COMPLETE_LEVEL', levelId, attempts, hintsUsed });
    },
    []
  );

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  const setCurrentLevel = useCallback((levelId: number | null) => {
    dispatch({ type: 'SET_CURRENT_LEVEL', levelId });
  }, []);

  const setPlayerName = useCallback((name: string) => {
    dispatch({ type: 'SET_PLAYER_NAME', name });
  }, []);

  const isLevelUnlocked = useCallback(
    (levelId: number) => state.unlockedLevels.includes(levelId),
    [state.unlockedLevels]
  );

  return (
    <GameContext.Provider
      value={{ state, completeLevel, resetProgress, setCurrentLevel, setPlayerName, isLevelUnlocked }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
