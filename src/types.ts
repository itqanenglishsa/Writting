export type WritingStrategy = 
  | 'type_along'
  | 'pen_writing'
  | 'memory_mode'
  | 'sentence_unscramble'
  | 'dictation'
  | 'shadow_writing';

export interface VocabularyWord {
  id: string;
  word: string;
  arabic: string;
  phonetic?: string;
  category: string;
  exampleEn: string;
  exampleAr: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PracticeStory {
  id: string;
  titleEn: string;
  titleAr: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sentences: {
    en: string;
    ar: string;
    keyWords: string[];
  }[];
}

export interface UserStats {
  xp: number;
  hintsCount: number;
  errorShieldsCount?: number;
  streakDays: number;
  wordsWrittenCount: number;
  storiesCompletedCount: number;
  unlockedItems: string[]; // shop item IDs
  activePenColor: string;
}

export interface ShopItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  type: 'pen_color' | 'booster' | 'streak_freeze';
  priceXp: number;
  icon: string;
  value?: number | string;
}
