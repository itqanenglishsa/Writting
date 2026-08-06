import React, { useState, useEffect, useRef } from 'react';
import { PracticeStory, UserStats, VocabularyWord } from '../types';
import { VOCABULARY_LIST } from '../data/vocabulary';
import { speakText } from '../utils/speechUtils';
import { Volume2, RefreshCw, CheckCircle2, Sparkles, Keyboard, Lightbulb, Zap, AlertCircle, ArrowLeft, Play } from 'lucide-react';

interface TypeAlongPracticeProps {
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

export const TypeAlongPractice: React.FC<TypeAlongPracticeProps> = ({
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
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [errorsCount, setErrorsCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [completedCharsInStory, setCompletedCharsInStory] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [localBlurToggle, setLocalBlurToggle] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isWordBlurred = isStrictMode || localBlurToggle;

  // Sync index when activeVocabWord or activeStory changes
  useEffect(() => {
    if (activeVocabWord && activeStory && activeStory.sentences) {
      const idx = activeStory.sentences.findIndex(
        (s) => s.en.trim().toLowerCase() === activeVocabWord.word.trim().toLowerCase()
      );
      if (idx !== -1) {
        setCurrentSentenceIndex(idx);
        const sumPrior = activeStory.sentences.slice(0, idx).reduce((acc, s) => acc + s.en.length, 0);
        setCompletedCharsInStory(sumPrior);
      }
    }
  }, [activeStory, activeVocabWord]);

  // Reset full story session stats when activeStory changes
  useEffect(() => {
    setUserInput('');
    setErrorsCount(0);
    setTotalKeystrokes(0);
    setCompletedCharsInStory(0);
    setIsCompleted(false);
    setStartTime(null);
    setWpm(0);
    if (inputRef.current) inputRef.current.focus();
  }, [activeStory.id]);

  const activeSentence = activeStory.sentences[currentSentenceIndex] || activeStory.sentences[0];
  const targetText = activeSentence ? activeSentence.en : '';

  const storyIndex = stories.findIndex((s) => s.id === activeStory.id);
  const nextStory =
    storyIndex !== -1 && storyIndex + 1 < stories.length
      ? stories[storyIndex + 1]
      : stories[0];

  // Real-time WPM calculation timer
  useEffect(() => {
    if (!startTime || isCompleted) return;
    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0.005) {
        const currentChars = completedCharsInStory + userInput.length;
        const currentWpm = Math.round((currentChars / 5) / elapsedMinutes);
        setWpm(currentWpm);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [startTime, isCompleted, completedCharsInStory, userInput.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const now = Date.now();
    if (!startTime) setStartTime(now);

    const prevLength = userInput.length;
    const newLength = value.length;

    if (newLength > prevLength) {
      const addedChars = newLength - prevLength;
      setTotalKeystrokes((prev) => prev + addedChars);

      let newErrors = 0;
      for (let i = prevLength; i < newLength; i++) {
        if (i < targetText.length && value[i] !== targetText[i]) {
          newErrors++;
        }
      }
      if (newErrors > 0) {
        setErrorsCount((prev) => prev + newErrors);
      }
    }

    setUserInput(value);

    // Check sentence completion
    if (value === targetText) {
      speakText(targetText);
      onRewardXp(20);

      const nextCompletedChars = completedCharsInStory + targetText.length;
      setCompletedCharsInStory(nextCompletedChars);

      if (currentSentenceIndex + 1 < activeStory.sentences.length) {
        setTimeout(() => {
          setCurrentSentenceIndex((prev) => prev + 1);
          setUserInput('');
          if (inputRef.current) inputRef.current.focus();
        }, 800);
      } else {
        setIsCompleted(true);
      }
    }
  };

  const handleUseHint = () => {
    if (onUseHint()) {
      const nextChar = targetText[userInput.length];
      if (nextChar) {
        const newInput = userInput + nextChar;
        setTotalKeystrokes((prev) => prev + 1);
        setUserInput(newInput);
        if (newInput === targetText) {
          speakText(targetText);
          onRewardXp(20);
          const nextCompletedChars = completedCharsInStory + targetText.length;
          setCompletedCharsInStory(nextCompletedChars);
          if (currentSentenceIndex + 1 < activeStory.sentences.length) {
            setTimeout(() => {
              setCurrentSentenceIndex((prev) => prev + 1);
              setUserInput('');
              if (inputRef.current) inputRef.current.focus();
            }, 800);
          } else {
            setIsCompleted(true);
          }
        }
      }
    }
  };

  const handleReset = () => {
    setCurrentSentenceIndex(0);
    setUserInput('');
    setErrorsCount(0);
    setTotalKeystrokes(0);
    setCompletedCharsInStory(0);
    setIsCompleted(false);
    setStartTime(null);
    setWpm(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleJumpToSentence = (idx: number) => {
    setCurrentSentenceIndex(idx);
    setUserInput('');
    const sumPrior = activeStory.sentences.slice(0, idx).reduce((acc, s) => acc + s.en.length, 0);
    setCompletedCharsInStory(sumPrior);
    if (inputRef.current) inputRef.current.focus();
    const selectedSent = activeStory.sentences[idx];
    if (selectedSent && onSelectWord) {
      const match = VOCABULARY_LIST.find((v) => v.word.toLowerCase() === selectedSent.en.toLowerCase());
      if (match) onSelectWord(match);
    }
  };

  // Render characters with clean typography
  const renderTypeAlongCharacters = () => {
    return targetText.split('').map((char, index) => {
      let charStyle = 'text-slate-700 bg-white border border-slate-200'; // Untyped
      let isBlurredChar = false;

      if (index < userInput.length) {
        if (userInput[index] === char) {
          charStyle = 'text-emerald-800 bg-emerald-100 border border-emerald-300 font-bold'; // Correct
        } else {
          charStyle = 'text-rose-800 bg-rose-100 border border-rose-300 font-bold underline animate-pulse'; // Incorrect
        }
      } else if (index === userInput.length) {
        charStyle = 'text-blue-900 bg-blue-100 border border-blue-400 font-bold scale-105 ring-2 ring-blue-300/50'; // Active Cursor
        if (isWordBlurred) isBlurredChar = true;
      } else {
        if (isWordBlurred) isBlurredChar = true;
      }

      return (
        <span
          key={index}
          className={`inline-block font-['Outfit'] text-2xl sm:text-3xl px-2.5 py-1 rounded-lg transition-all duration-150 mx-0.5 my-1 ${charStyle} ${
            isBlurredChar ? 'blur-sm hover:blur-none select-none cursor-pointer bg-slate-200/80 text-slate-400' : ''
          }`}
          title={isBlurredChar ? 'مرر الماوس لكشف الحرف مؤقتاً' : ''}
        >
          {char === ' ' ? '␣' : char}
        </span>
      );
    });
  };

  // High precision telemetry calculations
  const totalSentences = activeStory.sentences.length;
  const currentItemRatio = targetText.length > 0 ? Math.min(1, userInput.length / targetText.length) : 0;
  const progressPercentage = Math.min(100, Math.round(((currentSentenceIndex + currentItemRatio) / totalSentences) * 100));

  const accuracy = totalKeystrokes > 0
    ? Math.max(0, Math.min(100, Math.round(((totalKeystrokes - errorsCount) / totalKeystrokes) * 100)))
    : 100;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm dir-rtl">
      
      {/* Strategy Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-blue-50 text-[#214ECF] text-xs font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-[#214ECF]" />
              <span>Type Along • الكتابة المباشرة ⌨️</span>
            </span>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>الكلمة {currentSentenceIndex + 1} من {activeStory.sentences.length}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">{activeStory.category}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2 flex-wrap font-['Almarai',sans-serif]">
            اكتب كلمة{' '}
            <span
              className={`text-[#214ECF] font-['Outfit'] font-extrabold uppercase underline decoration-blue-400 dir-ltr inline-block transition-all cursor-pointer ${
                isWordBlurred
                  ? 'blur-md select-none bg-slate-200 text-slate-400 rounded px-2 hover:blur-none hover:text-[#214ECF] hover:bg-transparent'
                  : ''
              }`}
              title={isWordBlurred ? 'مرر الماوس لكشف الكلمة مؤقتاً' : ''}
            >
              {isWordBlurred ? '🔒 •••••••' : (activeSentence?.en || targetText)}
            </span>{' '}
            بالحروف
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
            <span>المعنى بالعربية:</span>
            <span className="font-semibold text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{activeSentence?.ar}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span>اكتب حروف الكلمة بالتسلسل لمطابقة الكلمة الإنجليزية وتطوير سرعة ودقة الكتابة!</span>
          </p>
        </div>

        {/* Story Selector & Hint */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseHint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[#214ECF] text-xs font-semibold transition-colors cursor-pointer"
            title="استخدم تلميح لكتابة الحرف التالي"
          >
            <Lightbulb className="w-4 h-4 text-[#214ECF]" />
            <span>تلميح للحرف</span>
          </button>

          <select
            value={activeStory.id}
            onChange={(e) => {
              const selected = stories.find((s) => s.id === e.target.value);
              if (selected) {
                onSelectStory(selected);
                setCurrentSentenceIndex(0);
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
            value={currentSentenceIndex}
            onChange={(e) => handleJumpToSentence(Number(e.target.value))}
            className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-[#214ECF] focus:outline-none cursor-pointer hover:bg-blue-100 transition-colors"
          >
            {activeStory.sentences.map((sent, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. {isWordBlurred ? '🔒 •••••••' : sent.en} ({sent.ar})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar & Live Telemetry Metrics */}
      <div className="my-5">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>تقدم القصة (الكلمة {currentSentenceIndex + 1} من {activeStory.sentences.length})</span>
          <span className="text-[#214ECF] font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
          <div
            className="h-full bg-[#214ECF] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">سرعة الكتابة</span>
              <span className="text-lg font-bold text-slate-800 font-['Outfit']">{wpm} WPM</span>
            </div>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">نسبة الدقة</span>
              <span className="text-lg font-bold text-emerald-600 font-['Outfit']">{accuracy}%</span>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">عدد الأخطاء</span>
              <span className="text-lg font-bold text-rose-600 font-['Outfit']">{errorsCount}</span>
            </div>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
        </div>

      </div>

      {!isCompleted ? (
        <div className="space-y-5 my-6">
          
          {/* Target Arabic Meaning */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                المعنى العربي المطلوب كتابته بالإنجليزية:
              </span>
              <p className="text-xl font-bold text-slate-900">{activeSentence.ar}</p>
            </div>
            <button
              onClick={() => speakText(targetText)}
              className="p-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-xs"
              title="استمع للجملة كاملة"
            >
              <Volume2 className="w-4 h-4 text-[#214ECF]" />
              <span className="hidden sm:inline">نطق الجملة</span>
            </button>
          </div>

          {/* Type Along Display Terminal Canvas */}
          <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl text-center ltr relative overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/80 text-xs text-slate-500 font-semibold tracking-wider uppercase">
              <span>Typewriter • Interactive Stream</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-center py-6 min-h-[90px]" dir="ltr">
              {renderTypeAlongCharacters()}
            </div>

            <p className="text-xs text-slate-400 font-medium">
              اضغط على الحروف المقابلة في لوحة المفاتيح
            </p>
          </div>

          {/* Interactive Typed Input Bar */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the English characters here (Left to Right)..."
              className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-300 rounded-xl text-lg font-bold ltr text-left focus:outline-none focus:ring-2 focus:ring-[#214ECF] focus:border-transparent transition-all font-['Outfit'] text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm shadow-xs"
              dir="ltr"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1.5 rounded-lg flex items-center gap-1 font-['Outfit']">
              <span className="text-[10px] font-semibold">LTR ➔</span>
              <Keyboard className="w-4 h-4" />
            </div>
          </div>

        </div>
      ) : (
        /* Completed Story Screen */
        <div className="p-8 text-center bg-blue-50/80 rounded-2xl border border-blue-100 my-6">
          <Sparkles className="w-10 h-10 text-[#EA9835] mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-slate-900 font-['Almarai',sans-serif]">أبدعت! أكملت كتابة القصة بنجاح! 🎉</h3>
          <p className="text-sm text-slate-600 font-medium mt-1">
            حصلت على <span className="font-bold text-[#214ECF] bg-white px-2 py-0.5 rounded border border-blue-200">+50 XP</span> وطوّرت سرعة ودقة الكتابة المباشرة!
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة الممارسة</span>
            </button>

            {nextStory && (
              <button
                onClick={() => {
                  onSelectStory(nextStory);
                  handleReset();
                }}
                className="px-5 py-2.5 bg-[#214ECF] hover:bg-[#1a3fb3] text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>الانتقال للمجموعة التالية ({nextStory.titleAr})</span>
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

