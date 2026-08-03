import React, { useState, useEffect } from 'react';
import { PracticeStory, UserStats, VocabularyWord } from '../types';
import { VOCABULARY_LIST } from '../data/vocabulary';
import { Timer, Eye, EyeOff, CheckCircle2, Sparkles, Volume2, Lightbulb, Play, ArrowLeft } from 'lucide-react';
import { speakText as playSpeech } from '../utils/speech';

interface ShadowWritingPracticeProps {
  stories: PracticeStory[];
  activeStory: PracticeStory;
  onSelectStory: (story: PracticeStory) => void;
  activeVocabWord?: VocabularyWord;
  onSelectWord?: (word: VocabularyWord) => void;
  stats: UserStats;
  onRewardXp: (amount: number, taskId?: string) => void;
  onUseHint: () => boolean;
  isStrictMode?: boolean;
}

export const ShadowWritingPractice: React.FC<ShadowWritingPracticeProps> = ({
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
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(5);
  const [isSentenceVisible, setIsSentenceVisible] = useState(true);
  const [typedRecall, setTypedRecall] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; msg: string } | null>(null);

  // Sync sentenceIndex when activeVocabWord or activeStory changes
  useEffect(() => {
    if (activeVocabWord && activeStory && activeStory.sentences) {
      const idx = activeStory.sentences.findIndex(
        (s) => s.en.trim().toLowerCase() === activeVocabWord.word.trim().toLowerCase()
      );
      if (idx !== -1) {
        setSentenceIndex(idx);
      }
    }
  }, [activeStory, activeVocabWord]);

  const activeSentence = activeStory.sentences[sentenceIndex] || activeStory.sentences[0];
  const targetText = activeSentence ? activeSentence.en : '';

  useEffect(() => {
    setIsSentenceVisible(true);
    setCountdown(5);
    setTypedRecall('');
    setHasStarted(false);
    setFeedback(null);
  }, [sentenceIndex, activeStory]);

  // Handle 5-second Shadow countdown timer
  useEffect(() => {
    let timer: any = null;
    if (hasStarted && isSentenceVisible && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (hasStarted && countdown === 0) {
      setIsSentenceVisible(false);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isSentenceVisible, countdown]);

  const speakText = (text: string) => {
    playSpeech(text);
  };

  const handleStartShadow = () => {
    setHasStarted(true);
    setIsSentenceVisible(true);
    setCountdown(5);
    setTypedRecall('');
    setFeedback(null);
  };

  const handleVerifyShadow = () => {
    const userClean = typedRecall.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const targetClean = targetText.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

    const isMatch = userClean === targetClean;

    if (isMatch) {
      setFeedback({
        isSuccess: true,
        msg: 'استحضار ظلي ممتاز 100%! ذاكرتك قوية جداً! ✨ (+25 XP)'
      });
      speakText(targetText);
      onRewardXp(25, `shadow_${activeStory.id}_sent_${sentenceIndex}`);

      if (sentenceIndex + 1 < activeStory.sentences.length) {
        setTimeout(() => setSentenceIndex((prev) => prev + 1), 1200);
      }
    } else {
      setFeedback({
        isSuccess: false,
        msg: `الجملة الأصلية: "${targetText}". اضغط زر البدء لإعادة إلقاء نظرة خاطفة!`
      });
    }
  };

  const handleUseHint = () => {
    if (onUseHint()) {
      // Temporarily reveal sentence for 2 seconds
      setIsSentenceVisible(true);
      setTimeout(() => setIsSentenceVisible(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm dir-rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-blue-50 text-[#214ECF] text-xs font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#214ECF]" />
              Shadow Writing • كتابة الظل 👁️
            </span>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>الكلمة {sentenceIndex + 1} من {activeStory.sentences.length}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">{activeStory.category}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2 flex-wrap font-['Almarai',sans-serif]">
            كتابة كلمة{' '}
            <span
              className={`text-[#214ECF] font-['Outfit'] font-extrabold uppercase underline decoration-blue-400 dir-ltr inline-block transition-all cursor-pointer ${
                isStrictMode
                  ? 'blur-md select-none bg-slate-200 text-slate-400 rounded px-2 hover:blur-none hover:text-[#214ECF] hover:bg-transparent'
                  : ''
              }`}
              title={isStrictMode ? 'مرر الماوس لكشف الكلمة مؤقتاً' : ''}
            >
              {isStrictMode ? '🔒 •••••••' : (activeSentence?.en || targetText)}
            </span>{' '}
            في الظل
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
            <span>المعنى بالعربية:</span>
            <span className="font-semibold text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{activeSentence?.ar}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span>انظر للكلمة بتركيز، ثم اكتبها بعد اختفائها لتنمية التصوير الذهني!</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseHint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[#214ECF] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-[#214ECF]" />
            <span>كشف الكلمة</span>
          </button>

          <select
            value={activeStory.id}
            onChange={(e) => {
              const selected = stories.find((s) => s.id === e.target.value);
              if (selected) {
                onSelectStory(selected);
                setSentenceIndex(0);
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
            value={sentenceIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSentenceIndex(idx);
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
      <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
        <span className="text-xs font-semibold">معنى الكلمة بالعربية: {activeSentence.ar}</span>
        <span className="text-xs font-medium text-slate-500">الكلمة {sentenceIndex + 1} من {activeStory.sentences.length}</span>
      </div>

      {/* Shadow Display Window */}
      <div className="my-5 p-8 bg-slate-50 rounded-2xl text-center border border-slate-200 min-h-[150px] flex flex-col items-center justify-center">
        {!hasStarted ? (
          <button
            onClick={handleStartShadow}
            className="px-6 py-3 bg-[#214ECF] hover:bg-[#1a3fb3] text-white font-semibold text-base rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer shadow-xs"
          >
            <Play className="w-5 h-5 fill-white text-white" />
            <span>ابدأ عد الخمس ثوانٍ لظهور الكلمة! ⏱️</span>
          </button>
        ) : isSentenceVisible ? (
          <div className="animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-2 mb-3 text-slate-600 font-semibold text-sm">
              <Timer className="w-5 h-5 animate-spin text-[#214ECF]" />
              <span>ستختفي الكلمة بعد: <strong className="text-2xl text-slate-900 font-['Outfit']">{countdown}</strong> ثوانٍ</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 font-['Outfit'] ltr tracking-wide" dir="ltr">
              {targetText}
            </p>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-200">
            <EyeOff className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-800 font-['Almarai',sans-serif]">اختفت الكلمة الآن في الظل! 🫣</p>
            <p className="text-xs text-slate-500 font-medium mt-1">اكتب ما تتذكره منها بدقة في الصندوق أدناه</p>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="relative">
        <textarea
          rows={3}
          value={typedRecall}
          onChange={(e) => setTypedRecall(e.target.value)}
          disabled={!hasStarted || isSentenceVisible}
          placeholder={
            !hasStarted
              ? 'اضغط زر "ابدأ عد الخمس ثوانٍ" أعلاه لبدء الاختبار الظلي...'
              : isSentenceVisible
              ? 'احفظ الكلمة الآن... ستستطيع الكتابة هنا فور اختفائها!'
              : 'اكتب الكلمة بالإنجليزية من ذاكرتك هنا (من اليسار إلى اليمين)...'
          }
          className="w-full p-4 bg-white border border-slate-300 disabled:bg-slate-100/70 rounded-xl text-lg font-bold ltr text-left focus:outline-none focus:ring-2 focus:ring-[#214ECF] focus:border-transparent transition-all font-['Outfit'] text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm shadow-xs"
          dir="ltr"
        />
        <div className="absolute left-3 bottom-3 text-slate-400 text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-50 border border-slate-200 font-['Outfit'] flex items-center gap-1">
          <span>LTR ➔</span>
          <span>Left to Right</span>
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

          {feedback.isSuccess && sentenceIndex + 1 < activeStory.sentences.length && (
            <button
              onClick={() => {
                setSentenceIndex((prev) => prev + 1);
                setFeedback(null);
                setHasStarted(false);
                setIsSentenceVisible(true);
                setTypedRecall('');
              }}
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
          onClick={handleVerifyShadow}
          disabled={!typedRecall.trim()}
          className="px-6 py-3 bg-[#214ECF] hover:bg-[#1a3fb3] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>التحقق من الكتابة الظلية 🎯</span>
        </button>

        <p className="text-xs text-slate-500 font-medium">
          تساعد الكتابة الظلية على بناء الذاكرة الإيمائية طويلة المدى.
        </p>
      </div>

    </div>
  );
};
