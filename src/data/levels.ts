export interface LevelInfo {
  level: number;
  titleAr: string;
  titleEn: string;
  icon: string;
  minXp: number;
  nextLevelXp: number | null; // null if top level
}

export const MASTERY_LEVELS: LevelInfo[] = [
  {
    level: 1,
    titleAr: 'كاتب مبتدئ',
    titleEn: 'Novice Writer',
    icon: '🌱',
    minXp: 0,
    nextLevelXp: 200
  },
  {
    level: 2,
    titleAr: 'كاتب صاعد',
    titleEn: 'Rising Writer',
    icon: '✍️',
    minXp: 200,
    nextLevelXp: 600 // High gap: requires 400 XP
  },
  {
    level: 3,
    titleAr: 'كاتب طليق',
    titleEn: 'Fluent Writer',
    icon: '🔥',
    minXp: 600,
    nextLevelXp: 1500 // High gap: requires 900 XP
  },
  {
    level: 4,
    titleAr: 'خبير الإتقان',
    titleEn: 'Mastery Expert',
    icon: '🏆',
    minXp: 1500,
    nextLevelXp: 3000 // High gap: requires 1500 XP
  },
  {
    level: 5,
    titleAr: 'أستاذ اللغة',
    titleEn: 'Language Professor',
    icon: '👑',
    minXp: 3000,
    nextLevelXp: null
  }
];

export function getUserLevel(xp: number) {
  let currentLevel = MASTERY_LEVELS[0];

  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= MASTERY_LEVELS[i].minXp) {
      currentLevel = MASTERY_LEVELS[i];
      break;
    }
  }

  const nextLevel = MASTERY_LEVELS.find((l) => l.level === currentLevel.level + 1) || null;

  let progressPercent = 100;
  let xpNeededForNext = 0;

  if (nextLevel && currentLevel.nextLevelXp) {
    const totalXpSpan = currentLevel.nextLevelXp - currentLevel.minXp;
    const currentXpInLevel = xp - currentLevel.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentXpInLevel / totalXpSpan) * 100)));
    xpNeededForNext = currentLevel.nextLevelXp - xp;
  }

  return {
    currentLevel,
    nextLevel,
    progressPercent,
    xpNeededForNext
  };
}
