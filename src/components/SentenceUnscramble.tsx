import React, { useState, useEffect } from 'react';
import { PracticeStory, UserStats, VocabularyWord } from '../types';
import { VOCABULARY_LIST } from '../data/vocabulary';
import { speakText } from '../utils/speechUtils';
import { Volume2, CheckCircle2, Sparkles, MoveLeft, Lightbulb, RotateCcw } from 'lucide-react';

interface SentenceUnscrambleProps {
  stories: PracticeStory[];
  activeStory: PracticeStory;
  onSelectStory: (story: PracticeStory) => void;
  activeVocabWord?: VocabularyWord;
  onSelectWord?: (word: VocabularyWord) => void;
  stats: UserStats;
  onRewardXp: (amount: number) => void;
  onUseHint: () => boolean;
  isStrictMode?: boolean;
}

export const SentenceUnscramble: React.FC<SentenceUnscrambleProps> = ({
  stories,
  activeStory,
  onSelectStory,
  activeVocabWord,
  onSelectWord,
  stats,
  onRewardXp,
  onUseHint,
  isStrictMode = false
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; char: string }[]>([]);
  const [userLetters, setUserLetters] = useState<{ id: string; char: string }[]>([]);
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; msg: string } | null>(null);

  // Sync wordIndex when activeVocabWord or activeStory changes
  useEffect(() => {
    if (activeVocabWord && activeStory && activeStory.sentences) {
      const idx = activeStory.sentences.findIndex(
        (s) => s.en.trim().toLowerCase() === activeVocabWord.word.trim().toLowerCase()
      );
      if (idx !== -1) {
        setWordIndex(idx);
      }
    }
  }, [activeStory, activeVocabWord]);

  const activeWordItem = activeStory.sentences[wordIndex] || activeStory.sentences[0];
  const targetWord = activeWordItem ? activeWordItem.en : '';

  useEffect(() => {
    if (targetWord) {
      // Split target word into individual letters with unique IDs for handling duplicates
      const chars = targetWord.split('').map((c, i) => ({ id: `${c}_${i}`, char: c }));
      // Shuffle letters
      const shuffled = [...chars].sort(() => Math.random() - 0.5);
      setScrambledLetters(shuffled);
      setUserLetters([]);
      setFeedback(null);
    }
  }, [wordIndex, activeStory, targetWord]);

  const handleSelectLetter = (item: { id: string; char: string }) => {
    setUserLetters((prev) => [...prev, item]);
    setScrambledLetters((prev) => prev.filter((l) => l.id !== item.id));
    setFeedback(null);
  };

  const handleRemoveLetter = (item: { id: string; char: string }) => {
    setUserLetters((prev) => prev.filter((l) => l.id !== item.id));
    setScrambledLetters((prev) => [...prev, item]);
    setFeedback(null);
  };

  const handleResetLetters = () => {
    if (targetWord) {
      const chars = targetWord.split('').map((c, i) => ({ id: `${c}_${i}`, char: c }));
      const shuffled = [...chars].sort(() => Math.random() - 0.5);
      setScrambledLetters(shuffled);
      setUserLetters([]);
      setFeedback(null);
    }
  };

  const handleCheckSpelling = () => {
    const userBuiltWord = userLetters.map((l) => l.char).join('');
    const isCorrect = userBuiltWord.toLowerCase() === targetWord.toLowerCase();

    if (isCorrect) {
      setFeedback({
        isSuccess: true,
        msg: `تهجئة ممتازة لجميع حروف كلمة "${targetWord}"! ✨ (+15 XP)`
      });
      speakText(targetWord);
      onRewardXp(15);

      if (wordIndex + 1 < activeStory.sentences.length) {
        setTimeout(() => {
          setWordIndex((prev) => prev + 1);
        }, 1200);
      }
    } else {
      setFeedback({
        isSuccess: false,
        msg: 'الترتيب غير صحيح بعد. اضغط على الحروف لإعادة المحاولة! 💡'
      });
    }
  };

  const handleUseHint = () => {
    if (onUseHint()) {
      // Place next correct letter automatically
      const targetLetters = targetWord.split('');
      const nextNeededChar = targetLetters[userLetters.length];
      if (nextNeededChar) {
        const foundItem = scrambledLetters.find(
          (l) => l.char.toLowerCase() === nextNeededChar.toLowerCase()
        );
        if (foundItem) {
          handleSelectLetter(foundItem);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm dir-rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-blue-50 text-[#214ECF] text-xs font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
              <MoveLeft className="w-3.5 h-3.5 text-[#214ECF]" />
              Letter Unscramble • ترتيب الحروف 🔤
            </span>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>الكلمة {wordIndex + 1} من {activeStory.sentences.length}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">{activeStory.category}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2 flex-wrap font-['Almarai',sans-serif]">
            ترتيب حروف كلمة{' '}
            <span
              className={`text-[#214ECF] font-['Outfit'] font-extrabold uppercase underline decoration-blue-400 dir-ltr inline-block transition-all cursor-pointer ${
                isStrictMode
                  ? 'blur-md select-none bg-slate-200 text-slate-400 rounded px-2 hover:blur-none hover:text-[#214ECF] hover:bg-transparent'
                  : ''
              }`}
              title={isStrictMode ? 'مرر الماوس لكشف الكلمة مؤقتاً' : ''}
            >
              {isStrictMode ? '🔒 •••••••' : (activeWordItem?.en || targetWord)}
            </span>{' '}
            المبعثرة
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
            <span>المعنى بالعربية:</span>
            <span className="font-semibold text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{activeWordItem?.ar}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span>اضغط على الحروف المبعثرة بالترتيب الصحيح لتكوين الكلمة!</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseHint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[#214ECF] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-[#214ECF]" />
            <span>تلميح بالحرف</span>
          </button>

          <select
            value={activeStory.id}
            onChange={(e) => {
              const selected = stories.find((s) => s.id === e.target.value);
              if (selected) {
                onSelectStory(selected);
                setWordIndex(0);
                if (selected.sentences[0] && onSelectWord) {
                  const match = VOCABULARY_LIST.find((v) => v.word.toLowerCase() === selected.sentences[0].en.toLowerCase());
                  if (match) onSelectWord(match);
                }
              }
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
          >
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                المجموعة: {s.titleAr}
              </option>
            ))}
          </select>

          <select
            value={wordIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setWordIndex(idx);
              const selectedSent = activeStory.sentences[idx];
              if (selectedSent && onSelectWord) {
                const match = VOCABULARY_LIST.find((v) => v.word.toLowerCase() === selectedSent.en.toLowerCase());
                if (match) onSelectWord(match);
              }
            }}
            className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-[#214ECF] focus:outline-none cursor-pointer hover:bg-blue-100 transition-colors"
          >
            {activeStory.sentences.map((sent, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. {isStrictMode ? '🔒 •••••••' : sent.en} ({sent.ar})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meaning Banner */}
      <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block mb-1">معنى الكلمة المطلوبة:</span>
          <p className="text-2xl font-bold text-slate-900">{activeWordItem?.ar}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetLetters}
            className="p-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="إعادة خلط الحروف"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>إعادة خلط</span>
          </button>
          <button
            onClick={() => speakText(targetWord)}
            className="p-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            title="استمع لنطق الكلمة"
          >
            <Volume2 className="w-5 h-5 text-[#214ECF]" />
          </button>
        </div>
      </div>

      {/* Letter Drop Zone / User Tiles */}
      <div className="my-6 p-6 min-h-[110px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2.5 justify-center" dir="ltr">
        {userLetters.length === 0 ? (
          <span className="text-slate-400 text-sm font-medium italic" dir="rtl">
            Tap the letter tiles below to build the word for ({activeWordItem?.ar})...
          </span>
        ) : (
          userLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRemoveLetter(item)}
              className="w-11 h-12 bg-[#214ECF] text-white font-bold text-xl rounded-xl shadow-xs transition-transform font-['Outfit'] hover:bg-blue-700 flex items-center justify-center cursor-pointer"
            >
              {item.char}
            </button>
          ))
        )}
      </div>

      {/* Available Scrambled Letter Tiles */}
      <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-600 block mb-3">حروف الكلمة المبعثرة:</span>
        <div className="flex flex-wrap gap-2.5 justify-center ltr" dir="ltr">
          {scrambledLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectLetter(item)}
              className="w-11 h-12 bg-white hover:bg-blue-50 text-slate-800 font-bold text-xl rounded-xl border border-slate-200 transition-all font-['Outfit'] hover:border-blue-300 flex items-center justify-center cursor-pointer"
            >
              {item.char}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
            feedback.isSuccess
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EA9835]" />
            <span className="text-sm font-semibold">{feedback.msg}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={handleCheckSpelling}
          disabled={userLetters.length === 0}
          className="px-6 py-3 bg-[#214ECF] hover:bg-[#1a3fb3] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>التحقق من الكلمة 🎯</span>
        </button>

        <p className="text-xs text-slate-500 font-semibold">
          الكلمة {wordIndex + 1} من {activeStory.sentences.length}
        </p>
      </div>

    </div>
  );
};
