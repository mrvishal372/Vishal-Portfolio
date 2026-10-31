export type TypingMode = 'timed' | 'words' | 'sentences' | 'bca_code' | 'custom';
export type TypingDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type TextLength = 'short' | 'medium' | 'long';

export type TextCategory = 
  | 'common'
  | 'sentences'
  | 'college'
  | 'computer_it'
  | 'programming'
  | 'business'
  | 'knowledge'
  | 'custom';

export interface TestSettings {
  duration: number; // in seconds (15, 30, 60, 120, 0 for infinite)
  difficulty: TypingDifficulty;
  category: TextCategory;
  textLength: TextLength;
  customText?: string;
  blindMode?: boolean;
}

export interface SpeedDataPoint {
  time: number; // second offset (e.g. 1, 2, 3...)
  wpm: number;
  accuracy: number;
}

export interface MistakeDetail {
  index: number;
  expected: string;
  typed: string;
  wordIndex: number;
}

export interface TypingSession {
  id: string;
  date: string; // ISO date
  timestamp: number;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  cpm: number;
  errors: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  duration: number; // in seconds
  mode: TypingMode;
  category: string;
  difficulty: TypingDifficulty;
  speedHistory?: SpeedDataPoint[];
  mistakes?: MistakeDetail[];
}

export interface PracticeModule {
  id: string;
  title: string;
  description: string;
  category: 'foundation' | 'vocabulary' | 'sentences' | 'technical';
  difficulty: TypingDifficulty;
  estimatedDuration: string;
  content: string[];
  icon: string;
  tags: string[];
}

export interface LessonStep {
  id: string;
  title: string;
  instruction: string;
  targetText: string;
  keyPlacementTips?: string;
}

export interface TypingLesson {
  id: string;
  level: number;
  levelTitle: string;
  title: string;
  description: string;
  steps: LessonStep[];
}

export interface DailyChallenge {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: string;
  duration: number;
  targetText: string;
  targetAccuracy: number;
  targetWpm: number;
  rules: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface PandaPetSettings {
  visible: boolean;
  speed: 'slow' | 'normal' | 'playful';
  size: 'small' | 'medium' | 'large';
  location: 'roaming' | 'bottom-right' | 'bottom-left' | 'top-right';
  isPaused: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'sans' | 'mono' | 'code';
  cursorStyle: 'line' | 'block' | 'underline';
  errorStyle: 'classic' | 'subtle' | 'outline';
  defaultDuration: number;
  defaultDifficulty: TypingDifficulty;
  defaultCategory: TextCategory;
  reducedMotion: boolean;
  panda: PandaPetSettings;
}
