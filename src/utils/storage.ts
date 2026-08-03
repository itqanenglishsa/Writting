import { WritingStrategy, UserStats, PracticeStory } from '../types';
import { PRACTICE_STORIES, VOCABULARY_LIST } from '../data/vocabulary';

export const LOCAL_STORAGE_KEY = 'itqan_english_user_progress_v1';

export interface SavedUserProgress {
  stats: UserStats;
  lastVisitDate?: string;
  rewardedTaskIds?: string[];
  unlockedBadgeIds: string[];
  activeStrategy: WritingStrategy;
  activeStoryId: string;
  activeVocabWordId: string;
  isStrictMode: boolean;
  isFocusMode: boolean;
  dockCategory: string;
  customStories: PracticeStory[];
  lastUpdated: string;
}

/**
 * Helper to return local calendar date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates daily streak count based on real calendar days elapsed since lastVisitDate.
 * - Same calendar day (diff 0): Keep current streak count.
 * - Next consecutive calendar day (diff 1): Increase streak count by +1.
 * - Missed 1+ days (diff > 1) or initial start: Reset streak count to 1.
 */
export function calculateStreak(storedVisitDate?: string, storedStreakDays?: number): { streakDays: number; lastVisitDate: string } {
  const todayStr = getTodayDateString();

  if (!storedVisitDate) {
    return { streakDays: 1, lastVisitDate: todayStr };
  }

  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
  const [vYear, vMonth, vDay] = storedVisitDate.split('-').map(Number);

  const todayMidnight = new Date(tYear, tMonth - 1, tDay);
  const lastVisitMidnight = new Date(vYear, vMonth - 1, vDay);

  if (isNaN(todayMidnight.getTime()) || isNaN(lastVisitMidnight.getTime())) {
    return { streakDays: 1, lastVisitDate: todayStr };
  }

  const diffMs = todayMidnight.getTime() - lastVisitMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const currentStreak = typeof storedStreakDays === 'number' && storedStreakDays > 0 ? storedStreakDays : 1;

  if (diffDays === 0) {
    // Same day visit: maintain current streak
    return { streakDays: currentStreak, lastVisitDate: todayStr };
  } else if (diffDays === 1) {
    // Consecutive day visit: increment streak by 1
    return { streakDays: currentStreak + 1, lastVisitDate: todayStr };
  } else {
    // Missed 1+ days or clock discrepancy: reset streak to 1
    return { streakDays: 1, lastVisitDate: todayStr };
  }
}

const initialStreakData = calculateStreak();

export const DEFAULT_USER_PROGRESS: SavedUserProgress = {
  stats: {
    xp: 200,
    hintsCount: 3,
    streakDays: initialStreakData.streakDays,
    wordsWrittenCount: 42,
    storiesCompletedCount: 4,
    unlockedItems: ['pen_blue'],
    activePenColor: '#214ECF',
  },
  lastVisitDate: initialStreakData.lastVisitDate,
  rewardedTaskIds: [],
  unlockedBadgeIds: [],
  activeStrategy: 'pen_writing',
  activeStoryId: PRACTICE_STORIES[0]?.id || '',
  activeVocabWordId: VOCABULARY_LIST[0]?.id || '',
  isStrictMode: false,
  isFocusMode: false,
  dockCategory: 'الكل',
  customStories: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * Loads user progress from localStorage. Evaluates streak status on load.
 */
export function loadUserProgress(): SavedUserProgress {
  if (typeof window === 'undefined') return DEFAULT_USER_PROGRESS;
  try {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawData) {
      const { streakDays, lastVisitDate } = calculateStreak();
      const defaultWithStreak: SavedUserProgress = {
        ...DEFAULT_USER_PROGRESS,
        stats: { ...DEFAULT_USER_PROGRESS.stats, streakDays },
        lastVisitDate,
      };
      saveUserProgress(defaultWithStreak);
      return defaultWithStreak;
    }
    
    const parsed = JSON.parse(rawData);
    const storedVisitDate = parsed.lastVisitDate;
    const storedStreakDays = parsed.stats?.streakDays;

    const { streakDays, lastVisitDate } = calculateStreak(storedVisitDate, storedStreakDays);
    
    const loadedProgress: SavedUserProgress = {
      stats: {
        ...DEFAULT_USER_PROGRESS.stats,
        ...(parsed.stats || {}),
        streakDays,
      },
      lastVisitDate,
      rewardedTaskIds: Array.isArray(parsed.rewardedTaskIds) ? parsed.rewardedTaskIds : DEFAULT_USER_PROGRESS.rewardedTaskIds,
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds) ? parsed.unlockedBadgeIds : DEFAULT_USER_PROGRESS.unlockedBadgeIds,
      activeStrategy: parsed.activeStrategy || DEFAULT_USER_PROGRESS.activeStrategy,
      activeStoryId: parsed.activeStoryId || DEFAULT_USER_PROGRESS.activeStoryId,
      activeVocabWordId: parsed.activeVocabWordId || DEFAULT_USER_PROGRESS.activeVocabWordId,
      isStrictMode: typeof parsed.isStrictMode === 'boolean' ? parsed.isStrictMode : DEFAULT_USER_PROGRESS.isStrictMode,
      isFocusMode: typeof parsed.isFocusMode === 'boolean' ? parsed.isFocusMode : DEFAULT_USER_PROGRESS.isFocusMode,
      dockCategory: parsed.dockCategory || DEFAULT_USER_PROGRESS.dockCategory,
      customStories: Array.isArray(parsed.customStories) ? parsed.customStories : DEFAULT_USER_PROGRESS.customStories,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };

    if (storedVisitDate !== lastVisitDate || storedStreakDays !== streakDays) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedProgress));
    }

    return loadedProgress;
  } catch (error) {
    console.error('Error loading user progress from localStorage:', error);
    const { streakDays, lastVisitDate } = calculateStreak();
    return {
      ...DEFAULT_USER_PROGRESS,
      stats: { ...DEFAULT_USER_PROGRESS.stats, streakDays },
      lastVisitDate,
    };
  }
}

/**
 * Saves user progress to localStorage.
 */
export function saveUserProgress(data: Partial<SavedUserProgress>): void {
  if (typeof window === 'undefined') return;
  try {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const currentData: SavedUserProgress = rawData ? JSON.parse(rawData) : DEFAULT_USER_PROGRESS;

    const updatedData: SavedUserProgress = {
      ...currentData,
      ...data,
      stats: {
        ...currentData.stats,
        ...(data.stats || {}),
        streakDays: data.stats?.streakDays ?? currentData.stats.streakDays,
      },
      lastVisitDate: data.lastVisitDate || currentData.lastVisitDate,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving user progress to localStorage:', error);
  }
}
