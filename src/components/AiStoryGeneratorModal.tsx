import React, { useState } from 'react';
import { VocabularyWord, PracticeStory } from '../types';
import { Sparkles, X, Check, Loader2, BookOpen } from 'lucide-react';

interface AiStoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocabulary: VocabularyWord[];
  onAddStory: (newStory: PracticeStory) => void;
}

export const AiStoryGeneratorModal: React.FC<AiStoryGeneratorModalProps> = ({
  isOpen,
  onClose,
  vocabulary,
  onAddStory
}) => {
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [topic, setTopic] = useState('daily life');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleWordSelection = (id: string) => {
    setSelectedWordIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const targetWords = selectedWordIds.map(
      (id) => vocabulary.find((v) => v.id === id)?.word || ''
    ).filter(Boolean);

    try {
      const res = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: targetWords,
          topic,
          level: 'beginner'
        })
      });

      const data = await res.json();

      if (data && data.story) {
        // Construct new PracticeStory object
        const newStory: PracticeStory = {
          id: `ai-${Date.now()}`,
          titleEn: data.title || 'AI Generated Story',
          titleAr: data.titleAr || 'قصة مخصصة بالذكاء الاصطناعي',
          category: 'قصص ذكية مخصصة',
          difficulty: 'easy',
          sentences: [
            {
              en: data.story,
              ar: data.storyAr || 'ترجمة القصة المخصصة',
              keyWords: targetWords
            }
          ]
        };

        onAddStory(newStory);
        setIsGenerating(false);
        onClose();
      } else {
        throw new Error('لم يتم توليد قصة بشكل صحيح');
      }
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء توليد القصة. يرجى المحاولة مرة أخرى.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative dir-rtl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">مُولّد القصص بالذكاء الاصطناعي</h3>
              <p className="text-xs text-slate-500">اختر الكلمات التي تريد ممارستها لبناء قصة خصيصاً لك!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Pickers */}
        <div className="my-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              اختر الكلمات المستهدفة لتتضمنها القصة:
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {vocabulary.slice(0, 15).map((v) => {
                const isSelected = selectedWordIds.includes(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => toggleWordSelection(v.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#214ECF] text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {v.word} ({v.arabic})
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              موضوع القصة المطلوب:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: A day at the park / Shopping / Family dinner"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#214ECF]"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            إلغاء
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-[#214ECF] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري كتابة القصة بالذكاء الاصطناعي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد القصة المخصصة</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
