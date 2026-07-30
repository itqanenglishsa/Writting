import { UserStats } from '../types';

export interface BadgeInfo {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  icon: string;
  checkUnlocked: (stats: UserStats) => boolean;
}

export const BADGES_LIST: BadgeInfo[] = [
  {
    id: 'first_word',
    titleAr: 'وسام الخطوات الأولى',
    titleEn: 'First Steps',
    descriptionAr: 'كتابة كلمة واحدة بنجاح',
    icon: '🎯',
    checkUnlocked: (stats) => stats.wordsWrittenCount >= 1
  },
  {
    id: 'writer_master',
    titleAr: 'وسام الكاتب المتقدم',
    titleEn: 'Master Writer',
    descriptionAr: 'كتابة 10 كلمات بنجاح',
    icon: '✍️',
    checkUnlocked: (stats) => stats.wordsWrittenCount >= 10
  },
  {
    id: 'writer_pro',
    titleAr: 'وسام الكاتب المحترف',
    titleEn: 'Pro Writer',
    descriptionAr: 'كتابة 25 كلمة بنجاح',
    icon: '🏆',
    checkUnlocked: (stats) => stats.wordsWrittenCount >= 25
  },
  {
    id: 'streak_3',
    titleAr: 'وسام شعلة الحماسة',
    titleEn: '3-Day Streak',
    descriptionAr: 'استمرار في التدريب لـ 3 أيام متتالية',
    icon: '🔥',
    checkUnlocked: (stats) => stats.streakDays >= 3
  },
  {
    id: 'story_reader',
    titleAr: 'وسام القارئ المتقن',
    titleEn: 'Story Reader',
    descriptionAr: 'إكمال كتابة قصتين تعليميتين',
    icon: '📚',
    checkUnlocked: (stats) => stats.storiesCompletedCount >= 2
  },
  {
    id: 'xp_500',
    titleAr: 'وسام جامع XP',
    titleEn: 'XP Collector',
    descriptionAr: 'الوصول إلى 500 نقطة خبرة',
    icon: '⚡',
    checkUnlocked: (stats) => stats.xp >= 500
  }
];
