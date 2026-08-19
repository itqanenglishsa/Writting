import React, { useEffect } from 'react';
import { UserStats } from '../types';
import { X, Award, Flame, CheckCircle2, PenTool, Sparkles, ChevronDown } from 'lucide-react';
import { BADGES_LIST } from '../data/badges';
import { getUserLevel, MASTERY_LEVELS } from '../data/levels';

interface ProgressStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const ProgressStatsModal: React.FC<ProgressStatsModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const levelData = getUserLevel(stats.xp);
  const { currentLevel, nextLevel, progressPercent, xpNeededForNext } = levelData;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#fffdf5] rounded-3xl max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#000] border-[3px] border-black relative dir-rtl my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rubber Hose Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#214ECF] via-[#EA9835] to-[#E06045] rounded-t-3xl border-b-2 border-black" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-[3px] border-black pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EA9835] border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Award className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black font-['Almarai',sans-serif]">تقرير إتقاني للكتابة 🏆</h3>
              <p className="text-xs text-slate-700 font-black">مستوى تقدمك اليومي وإحصائيات التعلم</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EA9835] hover:bg-[#E06045] border-2 border-black text-black hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Level Banner */}
        <div className="my-4 p-5 rounded-2xl bg-[#EA9835] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-black font-black uppercase tracking-wider flex items-center gap-1">
              <span>{currentLevel.icon}</span>
              <span>مستوى الكاتب المتقن</span>
            </span>
            <span className="text-xs font-black bg-white text-black px-2.5 py-0.5 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] font-['Outfit']">
              المستوى {currentLevel.level}
            </span>
          </div>
          
          <h4 className="text-xl font-black text-black font-['Almarai',sans-serif]">
            {currentLevel.titleAr} ({currentLevel.titleEn})
          </h4>

          <p className="text-xs text-black font-black mt-1">
            مجموع نقاطك الحالية: <strong className="text-[#214ECF] bg-white px-2 py-0.5 rounded-lg border border-black font-black font-['Outfit'] shadow-[1px_1px_0px_0px_#000] inline-block">{stats.xp} XP</strong>
          </p>

          {/* Level XP Progress Bar */}
          <div className="mt-4 pt-3 border-t-2 border-black/20">
            <div className="flex items-center justify-between text-xs font-black text-black mb-1.5">
              <span>تقدمك للمستوى التالي:</span>
              <span className="font-['Outfit']">{progressPercent}%</span>
            </div>

            <div className="w-full h-3.5 bg-white border-2 border-black rounded-full overflow-hidden p-0.5 relative shadow-[1px_1px_0px_0px_#000]">
              <div 
                className="h-full bg-[#214ECF] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {nextLevel ? (
              <p className="text-[11px] font-black text-slate-900 mt-2 flex items-center justify-between">
                <span>المستوى القادم: {nextLevel.titleAr} ({nextLevel.minXp} XP)</span>
                <span className="text-[#214ECF] bg-white px-1.5 py-0.5 rounded border border-black text-[10px]">
                  متبقي {xpNeededForNext} XP ⚡
                </span>
              </p>
            ) : (
              <p className="text-[11px] font-black text-emerald-800 mt-2">
                👑 وصلت للحد الأقصى من المستويات! أنت أستاذ اللغة!
              </p>
            )}
          </div>
        </div>

        {/* Level Map / Hierarchy Breakdown */}
        <div className="my-4 p-4 bg-amber-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <h4 className="text-xs font-black text-black mb-2.5 flex items-center justify-between">
            <span>شجرة مستويات الإتقان 🎯</span>
            <span className="text-[10px] text-slate-600 font-bold">5 مستويات متدرجة</span>
          </h4>

          <div className="space-y-2">
            {MASTERY_LEVELS.map((lvl) => {
              const isCurrent = lvl.level === currentLevel.level;
              const isUnlocked = stats.xp >= lvl.minXp;

              return (
                <div
                  key={lvl.level}
                  className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000] transition-all ${
                    isCurrent
                      ? 'bg-[#EA9835] text-black font-black ring-2 ring-black'
                      : isUnlocked
                      ? 'bg-white text-black'
                      : 'bg-slate-100 text-slate-500 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{lvl.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black">
                          المستوى {lvl.level}: {lvl.titleAr}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-black">
                            مستواك الحالي
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-700 block font-bold">
                        {lvl.titleEn}
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-black font-['Outfit'] bg-slate-50 px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000] inline-block">
                      {lvl.minXp} XP
                    </span>
                    {lvl.nextLevelXp && (
                      <span className="text-[9px] text-slate-600 block mt-0.5 text-right font-bold">
                        الفجوة: +{lvl.nextLevelXp - lvl.minXp} XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-black text-center shadow-[3px_3px_0px_0px_#000]">
            <Flame className="w-6 h-6 text-[#E06045] fill-[#EA9835] mx-auto mb-1 animate-bounce" />
            <span className="text-xs text-slate-700 font-black block">حماسة يومية</span>
            <span className="text-2xl font-black text-[#214ECF] font-['Outfit']">{stats.streakDays} أيام</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-black text-center shadow-[3px_3px_0px_0px_#000]">
            <PenTool className="w-6 h-6 text-[#214ECF] mx-auto mb-1" />
            <span className="text-xs text-slate-700 font-black block">الكلمات المكتوبة</span>
            <span className="text-2xl font-black text-[#214ECF] font-['Outfit']">{stats.wordsWrittenCount} كلمة</span>
          </div>
        </div>

        {/* Badges Section */}
        <div className="my-4">
          <h4 className="text-xs font-black text-black mb-2 flex items-center justify-between">
            <span>الأوسمة والإنجازات 🎖️</span>
            <span className="text-[10px] text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {BADGES_LIST.filter(b => b.checkUnlocked(stats)).length} / {BADGES_LIST.length} مكتمل
            </span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {BADGES_LIST.map((badge) => {
              const unlocked = badge.checkUnlocked(stats);
              return (
                <div
                  key={badge.id}
                  className={`p-2.5 rounded-xl border-2 border-black flex items-center gap-2.5 shadow-[2px_2px_0px_0px_#000] transition-all ${
                    unlocked
                      ? 'bg-amber-50 border-black'
                      : 'bg-slate-100/70 border-slate-300 opacity-60 grayscale'
                  }`}
                >
                  <div className="text-2xl shrink-0">{badge.icon}</div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-black truncate leading-tight">
                      {badge.titleAr}
                    </h5>
                    <p className="text-[10px] text-slate-600 font-bold leading-tight mt-0.5">
                      {unlocked ? badge.descriptionAr : '🔒 ' + badge.descriptionAr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategies Mastery Check list */}
        <div className="space-y-2 my-4 p-4 bg-amber-100/70 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <span className="text-xs font-black text-black block mb-2">الاستراتيجيات المفعّلة في تطبيقك:</span>
          
          {[
            '✍️ كتابة الكلمات بالقلم (Pen Writing)',
            '⌨️ الكتابة المباشرة (Type Along)',
            '🫣 وضع الإختفاء المتدرج (Memory Mode)',
            '🧩 إعادة ترتيب الجمل (Sentence Unscramble)',
            '🎧 الإملاء التفاعلي (Dictation)',
            '👁️⚡ الكتابة الظلية (Shadow Writing)'
          ].map((strat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-black text-black">
              <CheckCircle2 className="w-4 h-4 text-black fill-[#EA9835] shrink-0" />
              <span>{strat}</span>
            </div>
          ))}
        </div>

        {/* Close */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#214ECF] hover:bg-[#1a3fb3] text-white border-2 border-black font-black rounded-xl text-xs transition-transform cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            إغلاق النافذة ✖️
          </button>
        </div>

      </div>
    </div>
  );
};
