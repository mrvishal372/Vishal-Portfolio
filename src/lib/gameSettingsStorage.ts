/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameSpeed = 'slow' | 'normal' | 'fast' | 'extreme';
export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'unbeatable';

export interface BaseGameSettings {
  speed: GameSpeed;
  difficulty: GameDifficulty;
  timerDuration?: number; // In seconds
  startingLevel?: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  highContrast?: boolean;
  [key: string]: any;
}

export type AllGameSettings = Record<string, BaseGameSettings>;

export const DEFAULT_GAME_CONFIGS: Record<string, BaseGameSettings> = {
  // Fun Games (9)
  snake: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    wallWrap: false,
    initialLength: 1,
    foodValue: 1,
  },
  tetris: {
    speed: 'normal',
    difficulty: 'normal',
    startingLevel: 1,
    soundEnabled: true,
    animationsEnabled: true,
    ghostPiece: true,
    softDropSpeed: 'fast',
  },
  flappy: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    pipeGap: 160,
    gravity: 0.35,
    jumpImpulse: -7,
  },
  shooter: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    enemySpawnRate: 'normal',
    playerFireRate: 'normal',
    shieldDurability: 3,
  },
  pingpong: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    ballSpeed: 1,
    paddleSize: 'normal',
    maxScore: 7,
  },
  '2048': {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    undoAllowed: true,
    spawnFourRate: 10, // 10%
  },
  memory: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    previewTimer: 1.5,
    gridSize: '4x4',
  },
  tictactoe: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    playerStartsFirst: true,
    allowUndo: false,
  },
  battleroyale: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    botCount: 10,
    safeZoneSpeed: 'normal',
    playerHealth: 100,
  },

  // Brain Games (11)
  sudoku: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 600,
    soundEnabled: true,
    animationsEnabled: true,
    errorCheck: true,
    hintsAllowed: 3,
  },
  sequence: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    flashSpeedMs: 400,
    sequenceDelayMs: 250,
  },
  number: {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
    displayTimeMs: 1500,
    stepIncrease: 1,
  },
  difference: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 60,
    soundEnabled: true,
    animationsEnabled: true,
    differencesCount: 4,
  },
  pattern: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 30,
    soundEnabled: true,
    animationsEnabled: true,
    complexity: 1,
  },
  tentoone: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 15,
    soundEnabled: true,
    animationsEnabled: true,
    errorPenaltySeconds: 2,
  },
  colortrap: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 20,
    soundEnabled: true,
    animationsEnabled: true,
    transitionDelayMs: 1200,
  },
  word: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 10,
    soundEnabled: true,
    animationsEnabled: true,
    memorizeTimeMultiplier: 1.5,
  },
  oddone: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 15,
    soundEnabled: true,
    animationsEnabled: true,
    gridDimension: 4,
  },
  path: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 25,
    soundEnabled: true,
    animationsEnabled: true,
    pathLength: 5,
    previewDurationMs: 1500,
  },
  logic: {
    speed: 'normal',
    difficulty: 'normal',
    timerDuration: 90,
    soundEnabled: true,
    animationsEnabled: true,
    hintsAllowed: 2,
  },
};

const STORAGE_KEY = 'vyron_game_settings_v1';
const LISTENERS = new Map<string, Set<(settings: BaseGameSettings) => void>>();

/**
 * Load customized settings for a specific game, falling back to default configuration
 */
export function loadGameSettings(gameId: string): BaseGameSettings {
  const fallback = DEFAULT_GAME_CONFIGS[gameId] || {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
  };

  if (typeof window === 'undefined') return { ...fallback };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...fallback };
    const parsed: AllGameSettings = JSON.parse(raw);
    if (parsed[gameId]) {
      return { ...fallback, ...parsed[gameId] };
    }
  } catch (err) {
    console.warn(`[GameSettings] Failed to load settings for ${gameId}:`, err);
  }

  return { ...fallback };
}

/**
 * Save settings for a specific game and notify active listeners in real time
 */
export function saveGameSettings(gameId: string, updated: Partial<BaseGameSettings>): BaseGameSettings {
  const current = loadGameSettings(gameId);
  const next: BaseGameSettings = { ...current, ...updated };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all: AllGameSettings = raw ? JSON.parse(raw) : {};
      all[gameId] = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn(`[GameSettings] Failed to save settings for ${gameId}:`, err);
    }
  }

  // Notify local subscribers
  const subs = LISTENERS.get(gameId);
  if (subs) {
    subs.forEach((cb) => {
      try {
        cb(next);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Broadcast window custom event for real-time reactive sync across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vyron_game_settings_changed', {
      detail: { gameId, settings: next }
    }));
  }

  return next;
}

/**
 * Reset settings for a specific game to official defaults
 */
export function resetGameSettings(gameId: string): BaseGameSettings {
  const fallback = DEFAULT_GAME_CONFIGS[gameId] || {
    speed: 'normal',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
  };
  return saveGameSettings(gameId, { ...fallback });
}

/**
 * Subscribe to real-time game settings changes
 */
export function subscribeToGameSettings(
  gameId: string,
  callback: (settings: BaseGameSettings) => void
): () => void {
  if (!LISTENERS.has(gameId)) {
    LISTENERS.set(gameId, new Set());
  }
  LISTENERS.get(gameId)!.add(callback);

  // Return unsubscribe cleanup handler
  return () => {
    const set = LISTENERS.get(gameId);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        LISTENERS.delete(gameId);
      }
    }
  };
}

/**
 * Map abstract speed to tick/frame interval milliseconds
 */
export function getSpeedMs(speed: GameSpeed, baseMs: number): number {
  switch (speed) {
    case 'slow':
      return Math.round(baseMs * 1.45);
    case 'fast':
      return Math.round(baseMs * 0.7);
    case 'extreme':
      return Math.round(baseMs * 0.45);
    case 'normal':
    default:
      return baseMs;
  }
}
