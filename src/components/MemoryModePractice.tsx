import React, { useState, useEffect } from 'react';
import { PracticeStory, UserStats, VocabularyWord } from '../types';
import { VOCABULARY_LIST } from '../data/vocabulary';
import { EyeOff, CheckCircle2, Sparkles, Volume2, Lightbulb, RefreshCw, ArrowLeft } from 'lucide-react';
import { speakText as playSpeech } from '../utils/speech';

interface MemoryModePracticeProps {
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

export const MemoryModePractice: React.FC<MemoryModePracticeProps> = ({
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
  // Memory Stages: 1 = Missing Letters, 2 = Hidden Word Recall
  const [stage, setStage] = useState<1 | 2>(1);
  const [wordIndex, setWordIndex] = useState(0);
  const [letterInputs, setLetterInputs] = useState<Record<number, string>>({});
  const [fullWordInput, setFullWordInput] = useState('');
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; msg: string; score?: number } | null>(null);

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
    setLetterInputs({});
    setFullWordInput('');
    setFeedback(null);
  }, [wordIndex, stage, activeStory]);

  const speakText = (text: string) => {
    playSpeech(text);
  };

  // Helper to render target word with missing letters for Stage 1 in Rubber Hose style
  const renderWordWithBlanks = () => {
    if (!targetWord) return null;
    const chars = targetWord.split('');

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 ltr my-4" dir="ltr">
        {chars.map((char, idx) => {
          // Hide odd index characters or vowels for A1 memory challenge
          const isBlank = idx % 2 === 1 || 'aeiouAEIOU'.includes(char);

          if (!isBlank) {
      return (
        <span
          key={idx}
          className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-xl font-bold text-slate-700 font-['Outfit']"
        >
          {char}
        </span>
      );
    }

    const userVal = letterInputs[idx] || '';
    const isCorrect = userVal.toLowerCase() === char.toLowerCase();

    return (
      <input
        key={idx}
        type="text"
        maxLength={1}
        value={userVal}
        onChange={(e) =>
          setLetterInputs((prev) => ({ ...prev, [idx]: e.target.value }))
        }
        placeholder="?"
        className={`w-12 h-12 border rounded-xl text-center text-xl font-bold font-['Outfit'] ltr focus:outline-none transition-all ${
          feedback
            ? isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        }`}
        dir="ltr"
      />
    );
  })}
</div>
);
};

  const handleVerify = () => {
    if (stage === 1) {
      // Validate letters
      const chars = targetWord.split('');
      let totalBlanks = 0;
      let correctBlanks = 0;

      chars.forEach((char, idx) => {
        const isBlank = idx % 2 === 1 || 'aeiouAEIOU'.includes(char);
        if (isBlank) {
          totalBlanks++;
          if ((letterInputs[idx] || '').toLowerCase() === char.toLowerCase()) {
            correctBlanks++;
          }
        }
      });

      const isSuccess = totalBlanks > 0 && correctBlanks === totalBlanks;
      const score = totalBlanks > 0 ? Math.round((correctBlanks / totalBlanks) * 100) : 100;

      setFeedback({
        isSuccess,
        score,
        msg: isSuccess
          ? `ممتاز! تذكرت جميع حروف كلمة "${targetWord}" بنجاح! ✨ (+20 XP)`
          : `دقة التذكر الحالية: ${score}%. يرجى مراجعة الحروف الناقصة!`
      });

      if (isSuccess) {
        onRewardXp(20);
        speakText(targetWord);
      }
    } else {
      // Stage 2 Full Word Memory Validation
      const isSuccess = fullWordInput.trim().toLowerCase() === targetWord.toLowerCase();
      setFeedback({
        isSuccess,
        score: isSuccess ? 100 : 0,
        msg: isSuccess
          ? `رائع جداً! استذكرت الكلمة كاملة من الذاكرة: "${targetWord}" 🎉 (+30 XP)`
          : `الإجابة ليست متطابقة. الكلمة المطلوبة هي "${targetWord}". حاول مرة أخرى!`
      });

      if (isSuccess) {
        onRewardXp(30);
        speakText(targetWord);
      }
    }
  };

  const handleUseHint = () => {
    if (onUseHint()) {
      if (stage === 1) {
        // Auto fill first blank
        const chars = targetWord.split('');
        for (let i = 0; i < chars.length; i++) {
          const isBlank = i % 2 === 1 || 'aeiouAEIOU'.includes(chars[i]);
          if (isBlank && !letterInputs[i]) {
            setLetterInputs((prev) => ({ ...prev, [i]: chars[i] }));
            break;
          }
        }
      } else {
        setFullWordInput(targetWord.slice(0, fullWordInput.length + 2));
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
              <EyeOff className="w-3.5 h-3.5 text-[#214ECF]" />
              Memory Mode • الاختفاء التدريجي 🧠
            </span>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>الكلمة {wordIndex + 1} من {activeStory.sentences.length}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">{activeStory.category}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2 flex-wrap font-['Almarai',sans-serif]">
            تذكر هجاء كلمة{' '}
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
            بعد اختفائها
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
            <span>المعنى بالعربية:</span>
            <span className="font-semibold text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{activeWordItem?.ar}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span>تتلاشى حروف الكلمة بالتدريج لترسيخ الهجاء في الذاكرة الدائمة!</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseHint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[#214ECF] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-[#214ECF]" />
            <span>تلميح إختفاء</span>
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

      {/* Stage Stepper Buttons */}
      <div className="grid grid-cols-2 gap-3 my-5">
        <button
          onClick={() => setStage(1)}
          className={`p-3.5 rounded-xl border text-center transition-colors cursor-pointer ${
            stage === 1
              ? 'bg-[#214ECF] text-white border-[#214ECF] font-semibold'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="text-xs opacity-90">المرحلة الأولى</div>
          <div className="text-sm font-bold mt-0.5">إكمال الحروف الناقصة 🔍</div>
        </button>

        <button
          onClick={() => setStage(2)}
          className={`p-3.5 rounded-xl border text-center transition-colors cursor-pointer ${
            stage === 2
              ? 'bg-[#214ECF] text-white border-[#214ECF] font-semibold'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="text-xs opacity-90">المرحلة الثانية</div>
          <div className="text-sm font-bold mt-0.5">كتابة الكلمة كاملة من الذاكرة 🧠</div>
        </button>
      </div>

      {/* Meaning Banner */}
      <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block mb-1">المعنى العربي المطلوب تذكره:</span>
          <p className="text-2xl font-bold text-slate-900">{activeWordItem?.ar}</p>
        </div>
        <button
          onClick={() => speakText(targetWord)}
          className="p-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          title="استمع لنطق الكلمة"
        >
          <Volume2 className="w-5 h-5 text-[#214ECF]" />
        </button>
      </div>

      {/* Stage Canvas Display */}
      <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-200">
        {stage === 1 ? (
          <div>
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block mb-3">
              Fill in the missing letters for: ({activeWordItem?.ar})
            </span>
            {renderWordWithBlanks()}
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block mb-3">
              Type the full English word from memory
            </span>
            <input
              type="text"
              value={fullWordInput}
              onChange={(e) => setFullWordInput(e.target.value)}
              placeholder="Write the English word here..."
              className="w-full max-w-md mx-auto p-3.5 bg-white border border-slate-300 text-slate-900 font-bold text-xl rounded-xl text-center ltr focus:outline-none focus:ring-2 focus:ring-[#214ECF] font-['Outfit'] shadow-xs"
              dir="ltr"
              autoFocus
            />
          </div>
        )}
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

          {feedback.isSuccess && wordIndex + 1 < activeStory.sentences.length && (
            <button
              onClick={() => setWordIndex((prev) => prev + 1)}
              className="px-4 py-2 bg-[#214ECF] text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>الكلمة التالية</span>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={handleVerify}
          className="px-6 py-3 bg-[#214ECF] hover:bg-[#1a3fb3] text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>التحقق من صحة التذكر 🎯</span>
        </button>

        <p className="text-xs text-slate-500 font-semibold">
          الكلمة {wordIndex + 1} من {activeStory.sentences.length}
        </p>
      </div>

    </div>
  );
};
