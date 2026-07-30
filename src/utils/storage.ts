import { WritingStrategy, UserStats, PracticeStory } from '../types';
import { PRACTICE_STORIES, VOCABULARY_LIST } from '../data/vocabulary';

export const LOCAL_STORAGE_KEY = 'itqan_english_user_progress_v1';

export interface SavedUserProgress {
  stats: UserStats;
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

export const DEFAULT_USER_PROGRESS: SavedUserProgress = {
  stats: {
    xp: 200,
    hintsCount: 3,
    streakDays: 3,
    wordsWrittenCount: 42,
    storiesCompletedCount: 4,
    unlockedItems: ['pen_blue'],
    activePenColor: '#214ECF',
  },
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
 * Loads user progress from localStorage. Falls back to DEFAULT_USER_PROGRESS if not found.
 */
export function loadUserProgress(): SavedUserProgress {
  if (typeof window === 'undefined') return DEFAULT_USER_PROGRESS;
  try {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawData) return DEFAULT_USER_PROGRESS;
    
    const parsed = JSON.parse(rawData);
    
    return {
      stats: { ...DEFAULT_USER_PROGRESS.stats, ...(parsed.stats || {}) },
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
  } catch (error) {
    console.error('Error loading user progress from localStorage:', error);
    return DEFAULT_USER_PROGRESS;
  }
}

/**
 * Saves user progress to localStorage.
 */
export function saveUserProgress(data: Partial<SavedUserProgress>): void {
  if (typeof window === 'undefined') return;
  try {
    const currentData = loadUserProgress();
    const updatedData: SavedUserProgress = {
      ...currentData,
      ...data,
      stats: {
        ...currentData.stats,
        ...(data.stats || {}),
      },
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving user progress to localStorage:', error);
  }
}
