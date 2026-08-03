import React, { useState, useEffect } from 'react';
import { PracticeStory, UserStats, VocabularyWord } from '../types';
import { VOCABULARY_LIST } from '../data/vocabulary';
import { Headphones, Volume2, CheckCircle2, Sparkles, RefreshCw, Lightbulb, ArrowLeft } from 'lucide-react';
import { speakText } from '../utils/speech';

interface DictationPracticeProps {
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

export const DictationPractice: React.FC<DictationPracticeProps> = ({
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
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);
  const [typedInput, setTypedInput] = useState('');
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; msg: string; score: number } | null>(null);

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
    setTypedInput('');
    setFeedback(null);
  }, [sentenceIndex, activeStory]);

  const playDictationAudio = (speed: number = playbackSpeed) => {
    if (targetText) {
      speakText(targetText, { rate: speed });
    }
  };

  const handleVerifyDictation = () => {
    const userClean = typedInput.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const targetClean = targetText.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

    const isExact = userClean === targetClean;
    
    if (isExact) {
      setFeedback({
        isSuccess: true,
        msg: 'استماع واستجابة كتابية ممتازة 100%! أحسنت! ✨ (+20 XP)',
        score: 100
      });
      onRewardXp(20, `dictation_${activeStory.id}_sent_${sentenceIndex}`);

      if (sentenceIndex + 1 < activeStory.sentences.length) {
        setTimeout(() => setSentenceIndex((prev) => prev + 1), 1200);
      }
    } else {
      setFeedback({
        isSuccess: false,
        msg: `نص الإملاء المطلوب: "${targetText}". استمع مرة أخرى ودقق في الأحرف!`,
        score: 60
      });
    }
  };

  const handleUseHint = () => {
    if (onUseHint()) {
      // Auto complete next 3 letters
      const currentLen = typedInput.length;
      setTypedInput(targetText.slice(0, currentLen + 3));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm dir-rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-blue-50 text-[#214ECF] text-xs font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-[#214ECF]" />
              Dictation • الإملاء والاستماع 🎧
            </span>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>الكلمة {sentenceIndex + 1} من {activeStory.sentences.length}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">{activeStory.category}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2 flex-wrap font-['Almarai',sans-serif]">
            إملاء وكتابة كلمة{' '}
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
            المسموعة
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
            <span>المعنى بالعربية:</span>
            <span className="font-semibold text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{activeSentence?.ar}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span>استمع لنطق الكلمة واكتبها بدقة لتطوير الربط البصري والسمعي!</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseHint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[#214ECF] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-[#214ECF]" />
            <span>تلميح إملاء</span>
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

      {/* Audio Stage Box */}
      <div className="my-6 p-6 sm:p-8 bg-slate-50 rounded-2xl text-center text-slate-900 border border-slate-200">
        <Headphones className="w-10 h-10 text-[#214ECF] mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-1 font-['Almarai',sans-serif]">اضغط للاستماع إلى الجملة الصوتية 🔊</h3>
        <p className="text-xs text-slate-500 font-medium mb-5">يمكنك تغيير سرعة الصوت لتسهيل الاستماع والتركيز</p>

        {/* Play Button & Speed Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => playDictationAudio(playbackSpeed)}
            className="px-6 py-3 bg-[#214ECF] hover:bg-[#1a3fb3] text-white font-semibold text-base rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer shadow-xs"
          >
            <Volume2 className="w-5 h-5 text-white" />
            <span>تشغيل الصوت (Play Audio)</span>
          </button>

          {/* Speed Selectors */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 gap-1 text-xs font-semibold">
            <span className="text-slate-500 px-2 text-[11px]">السرعة:</span>
            {[
              { rate: 0.5, label: '0.5x بطيء' },
              { rate: 0.75, label: '0.75x متوسط' },
              { rate: 1.0, label: '1.0x عادي' }
            ].map((sp) => (
              <button
                key={sp.rate}
                onClick={() => {
                  setPlaybackSpeed(sp.rate);
                  playDictationAudio(sp.rate);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  playbackSpeed === sp.rate
                    ? 'bg-blue-50 text-[#214ECF] font-bold border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Arabic Context Hint */}
      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
        <span className="text-xs font-semibold">تلميح المعنى العربي: {activeSentence.ar}</span>
        <span className="text-xs font-medium text-slate-500">الكلمة {sentenceIndex + 1} من {activeStory.sentences.length}</span>
      </div>

      {/* User Input Text Area */}
      <div className="relative">
        <textarea
          rows={3}
          value={typedInput}
          onChange={(e) => setTypedInput(e.target.value)}
          placeholder="Type what you hear in English here (Left to Right)..."
          className="w-full p-4 bg-white border border-slate-300 rounded-xl text-lg font-bold ltr text-left focus:outline-none focus:ring-2 focus:ring-[#214ECF] focus:border-transparent transition-all font-['Outfit'] text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm shadow-xs"
          dir="ltr"
        />
        <div className="absolute left-3 bottom-3 text-slate-400 text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-50 border border-slate-200 font-['Outfit'] flex items-center gap-1">
          <span>LTR ➔</span>
          <span>Left to Right</span>
        </div>
      </div>

      {/* Feedback */}
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
          onClick={handleVerifyDictation}
          disabled={!typedInput.trim()}
          className="px-6 py-3 bg-[#214ECF] hover:bg-[#1a3fb3] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>التحقق من الإملاء المكتوب 🎯</span>
        </button>

        <p className="text-xs text-slate-500 font-medium">
          استمع بدقة للحروف الصامتة والتركيبات النطقية.
        </p>
      </div>

    </div>
  );
};
