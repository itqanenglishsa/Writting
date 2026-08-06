import React, { useState, useEffect } from 'react';
import { WritingStrategy, UserStats, PracticeStory, VocabularyWord, ShopItem } from './types';
import { VOCABULARY_LIST, PRACTICE_STORIES } from './data/vocabulary';
import { BADGES_LIST } from './data/badges';
import { getUserLevel } from './data/levels';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { Header } from './components/Header';
import { XpShopModal } from './components/XpShopModal';
import { PenWritingCanvas } from './components/PenWritingCanvas';
import { TypeAlongPractice } from './components/TypeAlongPractice';
import { MemoryModePractice } from './components/MemoryModePractice';
import { SentenceUnscramble } from './components/SentenceUnscramble';
import { DictationPractice } from './components/DictationPractice';
import { ShadowWritingPractice } from './components/ShadowWritingPractice';
import { AiStoryGeneratorModal } from './components/AiStoryGeneratorModal';
import { ProgressStatsModal } from './components/ProgressStatsModal';
import { VocabLibraryModal } from './components/VocabLibraryModal';
import { speakText } from './utils/speechUtils';
import { PenTool, Keyboard, EyeOff, MoveLeft, Headphones, Eye, Sparkles, Volume2, Award, ArrowLeft, CheckCircle2, BookOpen, Maximize2, Minimize2, Lock, ShieldAlert, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Grid, RotateCcw } from 'lucide-react';

export default function App() {
  // Strategy Navigation State
  const [activeStrategy, setActiveStrategy] = useState<WritingStrategy>('pen_writing');

  // Anti-Cheating & Focus View Mode State
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Stories & Vocab Data State
  const [storiesList, setStoriesList] = useState<PracticeStory[]>(PRACTICE_STORIES);
  const [activeStory, setActiveStory] = useState<PracticeStory>(PRACTICE_STORIES[0]);
  const [activeVocabWord, setActiveVocabWord] = useState<VocabularyWord>(VOCABULARY_LIST[0]);
  const [dockCategory, setDockCategory] = useState<string>('الكل');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState<boolean>(false);
  const categoriesContainerRef = React.useRef<HTMLDivElement>(null);
  const wordsContainerRef = React.useRef<HTMLDivElement>(null);

  const categoriesList = ['الكل', ...Array.from(new Set(VOCABULARY_LIST.map((v) => v.category)))];

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoriesContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollWords = (direction: 'left' | 'right') => {
    if (wordsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      wordsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // User Gamification Stats State
  const [stats, setStats] = useState<UserStats>({
    xp: 200,
    hintsCount: 3,
    streakDays: 3,
    wordsWrittenCount: 42,
    storiesCompletedCount: 4,
    unlockedItems: ['pen_blue'],
    activePenColor: '#214ECF'
  });

  // Toasts Notifications State & Tracked Badges and Levels
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(() => {
    const initialStats: UserStats = {
      xp: 200,
      hintsCount: 3,
      streakDays: 3,
      wordsWrittenCount: 42,
      storiesCompletedCount: 4,
      unlockedItems: ['pen_blue'],
      activePenColor: '#214ECF'
    };
    return BADGES_LIST.filter(b => b.checkUnlocked(initialStats)).map(b => b.id);
  });

  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(() => {
    return getUserLevel(200).currentLevel.level;
  });

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check for newly unlocked badges or level up on stats change
  useEffect(() => {
    BADGES_LIST.forEach((badge) => {
      if (!unlockedBadgeIds.includes(badge.id) && badge.checkUnlocked(stats)) {
        setUnlockedBadgeIds((prev) => [...prev, badge.id]);
        addToast({
          title: `وسام جديد! 🏆`,
          description: `مبارك! حصلت على ${badge.titleAr} (${badge.descriptionAr})`,
          icon: badge.icon,
          type: 'badge'
        });
      }
    });

    const levelData = getUserLevel(stats.xp);
    if (levelData.currentLevel.level > currentLevelNumber) {
      setCurrentLevelNumber(levelData.currentLevel.level);
      addToast({
        title: `ارتقاء إلى مستوى جديد! 👑`,
        description: `تهانينا! بلغت المستوى ${levelData.currentLevel.level}: ${levelData.currentLevel.titleAr}`,
        icon: levelData.currentLevel.icon,
        type: 'badge'
      });
    }
  }, [stats, unlockedBadgeIds, currentLevelNumber]);

  // Modals State
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isVocabLibraryOpen, setIsVocabLibraryOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmResetCourse = () => {
    const initialStats: UserStats = {
      xp: 0,
      hintsCount: 3,
      streakDays: 1,
      wordsWrittenCount: 0,
      storiesCompletedCount: 0,
      unlockedItems: ['pen_blue'],
      activePenColor: '#214ECF'
    };
    setStats(initialStats);
    setStoriesList(PRACTICE_STORIES);
    setActiveStory(PRACTICE_STORIES[0]);
    setActiveVocabWord(VOCABULARY_LIST[0]);
    setUnlockedBadgeIds([]);
    setCurrentLevelNumber(1);
    setActiveStrategy('pen_writing');
    setIsResetModalOpen(false);

    addToast({
      title: 'تم إعادة بدء الدورة بنجاح! 🔄',
      description: 'تمت إعادة تعيين جميع نقاطك وتقدمك في الكلمات والقصص. يمكنك البدء من جديد الآن!',
      icon: '🔄',
      type: 'xp'
    });
  };

  // Sound Pronunciation Helper for quick widget
  const speakQuickAudio = (text: string) => {
    speakText(text);
  };

  // Rewards & Hints Handlers
  const handleRewardXp = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      wordsWrittenCount: prev.wordsWrittenCount + 1
    }));
    addToast({
      title: 'إتمام تدريب بنجاح! 🎉',
      description: `ممتاز! أتممت جلسة الكتابة بنجاح وحصلت على +${amount} XP!`,
      icon: '⚡',
      type: 'xp'
    });
  };

  const handleUseHint = (): boolean => {
    if (stats.hintsCount > 0) {
      setStats((prev) => ({
        ...prev,
        hintsCount: prev.hintsCount - 1
      }));
      return true;
    } else {
      setIsShopOpen(true);
      return false;
    }
  };

  const handleBuyShopItem = (item: ShopItem): boolean => {
    if (stats.xp >= item.priceXp) {
      setStats((prev) => ({
        ...prev,
        xp: prev.xp - item.priceXp,
        unlockedItems: prev.unlockedItems.includes(item.id)
          ? prev.unlockedItems
          : [...prev.unlockedItems, item.id],
        activePenColor:
          item.type === 'pen_color' && typeof item.value === 'string'
            ? item.value
            : prev.activePenColor
      }));
      return true;
    }
    return false;
  };

  const handleSelectPenColor = (colorHex: string) => {
    setStats((prev) => ({
      ...prev,
      activePenColor: colorHex
    }));
  };

  const handleAddAiStory = (newStory: PracticeStory) => {
    setStoriesList((prev) => [newStory, ...prev]);
    setActiveStory(newStory);
  };

  const handleSelectVocabWord = (word: VocabularyWord) => {
    setActiveVocabWord(word);
    const matchingStory = storiesList.find((s) =>
      s.sentences.some((sent) => sent.en.toLowerCase() === word.word.toLowerCase())
    );
    if (matchingStory) {
      setActiveStory(matchingStory);
    }
  };

  const handleSelectStory = (story: PracticeStory) => {
    setActiveStory(story);
    if (story.sentences.length > 0) {
      const firstWordEn = story.sentences[0].en;
      const matchingVocab = VOCABULARY_LIST.find(
        (v) => v.word.toLowerCase() === firstWordEn.toLowerCase()
      );
      if (matchingVocab) {
        setActiveVocabWord(matchingVocab);
      }
    }
  };

  // Strategy Tabs configuration
  const strategyTabs = [
    {
      id: 'pen_writing' as const,
      labelAr: 'الكتابة بالقلم',
      labelEn: 'Pen Writing',
      icon: PenTool,
      desc: 'للكلمات الأساسية A1'
    },
    {
      id: 'type_along' as const,
      labelAr: 'الكتابة المباشرة',
      labelEn: 'Type Along',
      icon: Keyboard,
      desc: 'كتابة المفردات A1'
    },
    {
      id: 'memory_mode' as const,
      labelAr: 'وضع الإختفاء',
      labelEn: 'Memory Mode',
      icon: EyeOff,
      desc: 'تذكر هجاء الكلمة'
    },
    {
      id: 'dictation' as const,
      labelAr: 'الإملاء والسمع',
      labelEn: 'Dictation',
      icon: Headphones,
      desc: 'إملاء الكلمة A1'
    },
    {
      id: 'shadow_writing' as const,
      labelAr: 'الكتابة الظلية',
      labelEn: 'Shadow Writing',
      icon: Eye,
      desc: 'تذكر الكلمة بالظل'
    }
  ];

  const activeTabConfig = strategyTabs.find((t) => t.id === activeStrategy);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Almarai',sans-serif] dir-rtl flex flex-col p-3 sm:p-6">
      
      {/* Top App Header */}
      <Header
        stats={stats}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenVocabLibrary={() => setIsVocabLibraryOpen(true)}
        onResetCourse={() => setIsResetModalOpen(true)}
      />

      {/* Main Studio Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-12 gap-6 flex-1 my-3">
        
        {/* Right Side Navigation Rail (Strategy Hub & Daily Progress) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col space-y-5 order-1 lg:order-2">
          
          {/* Strategy Rail Panel - Clean Modern Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900">
                    أنماط الكتابة التفاعلية
                  </h2>
                </div>
                <span className="text-xs bg-blue-50 text-[#214ECF] border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold">
                  5 أنماط A1
                </span>
              </div>

              {/* Strategy Cards List */}
              <div className="space-y-2">
                {strategyTabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isActive = activeStrategy === tab.id;
                  const numStr = `0${idx + 1}`;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStrategy(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-right ${
                        isActive
                          ? 'bg-[#214ECF] text-white font-semibold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold font-['Outfit'] px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {numStr}
                        </span>

                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#214ECF]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="text-xs font-bold leading-tight">{tab.labelAr}</div>
                          <div
                            className={`text-[10px] font-['Outfit'] ltr ${
                              isActive ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {tab.labelEn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-50 text-[#214ECF] border border-blue-100'
                          }`}
                        >
                          +15 XP
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Strategy Audio Test Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">الكلمة الحالية:</span>
              <button
                onClick={() => speakQuickAudio(activeVocabWord.word)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#214ECF] border border-blue-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#214ECF]" />
                <span className="font-['Outfit'] font-bold">{activeVocabWord.word}</span>
              </button>
            </div>
          </div>

          {/* Daily Practice Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Almarai',sans-serif]">
                تقدم الإتقان اليومي
              </h3>
              <Award className="w-5 h-5 text-[#214ECF]" />
            </div>

            {/* Progress Bar & Indicators */}
            <div className="space-y-3.5 my-1">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>الكلمات المكتوبة بنجاح</span>
                  <span className="font-['Outfit'] text-[#214ECF]">
                    {stats.wordsWrittenCount} من {VOCABULARY_LIST.length} كلمة
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-[#214ECF] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.wordsWrittenCount / VOCABULARY_LIST.length) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Remaining Words Display Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">المتبقي لإتقان A1:</span>
                <span className="font-bold text-[#214ECF] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-['Outfit']">
                  {Math.max(0, VOCABULARY_LIST.length - stats.wordsWrittenCount)} كلمة
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>أيام الحماسة المتتالية</span>
                  <span className="font-['Outfit'] text-amber-700">{stats.streakDays} أيام</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-[#EA9835] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.streakDays * 25, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsStatsOpen(true)}
              className="mt-4 text-xs font-semibold text-[#214ECF] hover:text-[#1a3fb3] transition-colors text-left cursor-pointer flex items-center justify-between"
            >
              <span>تقرير الإتقان التفصيلي والميداليات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </aside>

        {/* Left/Center Primary Workspace Canvas */}
        <section className="col-span-12 lg:col-span-8 flex flex-col space-y-5 order-2 lg:order-1">
          
          {/* Main Workspace Frame */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between flex-1 relative overflow-hidden">
            
            {/* Top Studio Bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-[#214ECF] text-xs font-bold rounded-xl border border-blue-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#EA9835]" />
                  <span>الوضع الحالي: {activeTabConfig?.labelAr}</span>
                </span>

                {/* Strict Anti-Cheat Mode Toggle */}
                <button
                  onClick={() => setIsStrictMode((prev) => !prev)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isStrictMode
                      ? 'bg-[#214ECF] text-white shadow-sm ring-2 ring-blue-300'
                      : 'bg-blue-50 text-[#214ECF] border border-blue-200 hover:bg-blue-100'
                  }`}
                  title="إخفاء الكلمة المستهدفة لمنع الطالب من الغش أو مجرد نقل الكلمة"
                >
                  {isStrictMode ? <Lock className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-[#214ECF]" />}
                  <span>{isStrictMode ? '🔒 وضع الاختبار الصارم (مفعل)' : '🔒 إخفاء الكلمات (منع النقل)'}</span>
                </button>

                {/* Focus Enlarge Mode Button */}
                <button
                  onClick={() => setIsFocusMode(true)}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تكبير شاشة التدريب وفتح وضع التركيز الخالي من المشتتات"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>وضع التكبير والتركيز</span>
                </button>
              </div>

              {/* Step indicator dots */}
              <div className="flex items-center gap-1.5">
                {strategyTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStrategy(tab.id)}
                    title={tab.labelAr}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      activeStrategy === tab.id ? 'w-6 bg-[#214ECF]' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Strategy Component View */}
            <div className="animate-in fade-in duration-300 flex-1">
              {activeStrategy === 'pen_writing' && (
                <PenWritingCanvas
                  vocabulary={VOCABULARY_LIST}
                  activeWord={activeVocabWord}
                  onSelectWord={handleSelectVocabWord}
                  stories={storiesList}
                  activeStory={activeStory}
                  onSelectStory={handleSelectStory}
                  stats={stats}
                  onRewardXp={handleRewardXp}
                  onUseHint={handleUseHint}
                  isStrictMode={isStrictMode}
                  onOpenShop={() => setIsShopOpen(true)}
                  onSelectPenColor={handleSelectPenColor}
                />
              )}

              {activeStrategy === 'type_along' && (
                <TypeAlongPractice
                  stories={storiesList}
                  activeStory={activeStory}
                  onSelectStory={handleSelectStory}
                  activeVocabWord={activeVocabWord}
                  onSelectWord={handleSelectVocabWord}
                  stats={stats}
                  onRewardXp={handleRewardXp}
                  onUseHint={handleUseHint}
                  isStrictMode={isStrictMode}
                />
              )}

              {activeStrategy === 'memory_mode' && (
                <MemoryModePractice
                  stories={storiesList}
                  activeStory={activeStory}
                  onSelectStory={handleSelectStory}
                  activeVocabWord={activeVocabWord}
                  onSelectWord={handleSelectVocabWord}
                  stats={stats}
                  onRewardXp={handleRewardXp}
                  onUseHint={handleUseHint}
                  isStrictMode={isStrictMode}
                />
              )}

              {activeStrategy === 'sentence_unscramble' && (
                <SentenceUnscramble
                  stories={storiesList}
                  activeStory={activeStory}
                  onSelectStory={handleSelectStory}
                  activeVocabWord={activeVocabWord}
                  onSelectWord={handleSelectVocabWord}
                  stats={stats}
                  onRewardXp={handleRewardXp}
                  onUseHint={handleUseHint}
                  isStrictMode={isStrictMode}
                />
              )}

              {activeStrategy === 'dictation' && (
                <DictationPractice
                  stories={storiesList}
                  activeStory={activeStory}
                  onSelectStory={handleSelectStory}
                  activeVocabWord={activeVocabWord}
                  onSelectWord={handleSelectVocabWord}
                  stats={stats}
                  onRewardXp={handleRewardXp}
                  onUseHint={handleUseHint}
                  isStrictMode={isStrictMode}
                />
              )}

              {activeStrategy === 'shadow_writing' && (
                <ShadowWritingPractice
                  stories={storiesList}
                  activeStory={activeStory}
                  onSelectStory={handleSelectStory}
                  activeVocabWord={activeVocabWord}
                  onSelectWord={handleSelectVocabWord}
                  stats={stats}
                  onRewardXp={handleRewardXp}
                  onUseHint={handleUseHint}
                  isStrictMode={isStrictMode}
                />
              )}
            </div>

            {/* Bottom Studio Dock */}
            <div className="mt-8 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">منهجية إتقان المباشرة لتعلم مفردات A1</span>
              </div>
              <div className="flex items-center gap-2 font-['Outfit'] ltr text-slate-500">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">Itqan English Standard</span>
                <span>Writing Studio</span>
              </div>
            </div>

          </div>

          {/* Quick A1 Vocabulary Dock Carousel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#214ECF]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Almarai',sans-serif]">
                  شريط مفردات A1 السريع (الكلمة {VOCABULARY_LIST.findIndex(v => v.id === activeVocabWord.id) + 1} من {VOCABULARY_LIST.length} • متبقي {Math.max(0, VOCABULARY_LIST.length - (VOCABULARY_LIST.findIndex(v => v.id === activeVocabWord.id) + 1))} كلمة)
                </span>
              </div>
              <button
                onClick={() => setIsVocabLibraryOpen(true)}
                className="text-xs font-semibold text-[#214ECF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>عرض كافة الكلمات في المكتبة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dock Categories Filter Bar Header & Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 font-['Almarai',sans-serif]">
                  تصنيفات المجموعات:
                </span>
                <span className="text-[10px] bg-blue-100 text-[#214ECF] px-2 py-0.5 rounded-full font-bold">
                  {categoriesList.length - 1} مجموعة
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Scroll Left / Right Buttons */}
                {!isCategoriesExpanded && (
                  <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                    <button
                      onClick={() => scrollCategories('right')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
                      title="تمرير لليمين"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => scrollCategories('left')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
                      title="تمرير لليسار"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Expand / Grid Toggle Button */}
                <button
                  onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                    isCategoriesExpanded
                      ? 'bg-[#214ECF] text-white border-[#214ECF]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>{isCategoriesExpanded ? 'إخفاء الشبكة' : 'عرض كافة المجموعات (شبكة)'}</span>
                  {isCategoriesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Dock Categories Filter Bar */}
            <div
              ref={categoriesContainerRef}
              className={`transition-all duration-300 ${
                isCategoriesExpanded
                  ? 'flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-60 overflow-y-auto'
                  : 'flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-blue-300 hover:scrollbar-thumb-blue-400'
              }`}
            >
              {categoriesList.map((cat) => {
                const isCatActive = dockCategory === cat;
                const count = cat === 'الكل'
                  ? VOCABULARY_LIST.length
                  : VOCABULARY_LIST.filter((v) => v.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setDockCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                      isCatActive
                        ? 'bg-[#214ECF] text-white border-[#214ECF] shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isCatActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Words Carousel Header */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600">
                كلمات المجموعة ({VOCABULARY_LIST.filter((v) => dockCategory === 'الكل' || v.category === dockCategory).length} كلمة):
              </span>
              <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => scrollWords('left')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
                  title="السابق"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollWords('right')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
                  title="التالي"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Words Carousel */}
            <div
              ref={wordsContainerRef}
              className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 ltr"
              dir="ltr"
            >
              {VOCABULARY_LIST.filter((v) => dockCategory === 'الكل' || v.category === dockCategory).map((vocab) => {
                const isSelected = activeVocabWord.id === vocab.id;
                return (
                  <button
                    key={vocab.id}
                    onClick={() => {
                      handleSelectVocabWord(vocab);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-50 text-[#214ECF] border-blue-300 ring-1 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-['Outfit'] font-bold text-sm">{vocab.word}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-600 font-semibold' : 'text-slate-400'}`} dir="rtl">
                      ({vocab.arabic})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </section>

      </main>

      {/* Studio Footer */}
      <footer className="mt-8 py-5 bg-white rounded-2xl border border-slate-200 max-w-7xl w-full mx-auto text-center text-xs text-slate-500 shadow-sm">
        <p className="font-['Almarai',sans-serif] text-sm font-bold text-[#214ECF]">إتقان ENGLISH — منصة تعلم الإنجليزية 🎓</p>
        <p className="mt-1 text-xs text-slate-400 font-medium">منصة تدريب مهارات الكتابة والمفردات التفاعلية.</p>
      </footer>

      {/* Modals */}
      <XpShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        stats={stats}
        onBuyItem={handleBuyShopItem}
        onSelectPenColor={handleSelectPenColor}
      />

      <ProgressStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <VocabLibraryModal
        isOpen={isVocabLibraryOpen}
        onClose={() => setIsVocabLibraryOpen(false)}
        vocabulary={VOCABULARY_LIST}
        activeWord={activeVocabWord}
        onSelectWord={(word) => {
          handleSelectVocabWord(word);
        }}
      />

      {/* Reset Course Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-5 relative dir-rtl">
            <div className="w-14 h-14 bg-rose-100 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">إعادة بدء الدورة 🔄</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                هل أنت تأكد من رغبتك في إعادة بدء الدورة؟
                <br />
                سيتم إعادة تعيين جميع نقاط الخبرة (XP)، الإحصائيات، والأوسمة والبدء من جديد.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleConfirmResetCourse}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                نعم، أعد البدء
              </button>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Enlarge Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-between overflow-y-auto animate-in fade-in duration-200">
          {/* Top Control Bar in Focus Mode */}
          <div className="max-w-6xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-white mb-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#214ECF] text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                <span>وضع التكبير والتركيز الكامل 🔍</span>
              </span>

              {/* Strict Mode Toggle in Focus Modal */}
              <button
                onClick={() => setIsStrictMode((prev) => !prev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isStrictMode
                    ? 'bg-[#214ECF] text-white shadow-md ring-2 ring-blue-300'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isStrictMode ? <Lock className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-blue-400" />}
                <span>{isStrictMode ? '🔒 وضع الاختبار الصارم: مفعل (إخفاء النقل)' : '🔒 تفعيل إخفاء الكلمات (منع النقل)'}</span>
              </button>
            </div>

            {/* Quick Strategy Tabs in Focus Mode */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {strategyTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStrategy(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeStrategy === tab.id
                      ? 'bg-[#214ECF] text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {tab.labelAr}
                </button>
              ))}
            </div>

            {/* Close Focus Mode */}
            <button
              onClick={() => setIsFocusMode(false)}
              className="p-2 bg-slate-800 hover:bg-red-500/80 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>إنهاء وضع التكبير</span>
            </button>
          </div>

          {/* Enlarged Practice Canvas Container */}
          <div className="max-w-6xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 flex-1 flex flex-col justify-between my-auto">
            {activeStrategy === 'pen_writing' && (
              <PenWritingCanvas
                vocabulary={VOCABULARY_LIST}
                activeWord={activeVocabWord}
                onSelectWord={handleSelectVocabWord}
                stories={storiesList}
                activeStory={activeStory}
                onSelectStory={handleSelectStory}
                stats={stats}
                onRewardXp={handleRewardXp}
                onUseHint={handleUseHint}
                isStrictMode={isStrictMode}
                onOpenShop={() => setIsShopOpen(true)}
                onSelectPenColor={handleSelectPenColor}
              />
            )}

            {activeStrategy === 'type_along' && (
              <TypeAlongPractice
                stories={storiesList}
                activeStory={activeStory}
                onSelectStory={handleSelectStory}
                activeVocabWord={activeVocabWord}
                onSelectWord={handleSelectVocabWord}
                stats={stats}
                onRewardXp={handleRewardXp}
                onUseHint={handleUseHint}
                isStrictMode={isStrictMode}
              />
            )}

            {activeStrategy === 'memory_mode' && (
              <MemoryModePractice
                stories={storiesList}
                activeStory={activeStory}
                onSelectStory={handleSelectStory}
                activeVocabWord={activeVocabWord}
                onSelectWord={handleSelectVocabWord}
                stats={stats}
                onRewardXp={handleRewardXp}
                onUseHint={handleUseHint}
                isStrictMode={isStrictMode}
              />
            )}

            {activeStrategy === 'sentence_unscramble' && (
              <SentenceUnscramble
                stories={storiesList}
                activeStory={activeStory}
                onSelectStory={handleSelectStory}
                activeVocabWord={activeVocabWord}
                onSelectWord={handleSelectVocabWord}
                stats={stats}
                onRewardXp={handleRewardXp}
                onUseHint={handleUseHint}
                isStrictMode={isStrictMode}
              />
            )}

            {activeStrategy === 'dictation' && (
              <DictationPractice
                stories={storiesList}
                activeStory={activeStory}
                onSelectStory={handleSelectStory}
                activeVocabWord={activeVocabWord}
                onSelectWord={handleSelectVocabWord}
                stats={stats}
                onRewardXp={handleRewardXp}
                onUseHint={handleUseHint}
                isStrictMode={isStrictMode}
              />
            )}

            {activeStrategy === 'shadow_writing' && (
              <ShadowWritingPractice
                stories={storiesList}
                activeStory={activeStory}
                onSelectStory={handleSelectStory}
                activeVocabWord={activeVocabWord}
                onSelectWord={handleSelectVocabWord}
                stats={stats}
                onRewardXp={handleRewardXp}
                onUseHint={handleUseHint}
                isStrictMode={isStrictMode}
              />
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

