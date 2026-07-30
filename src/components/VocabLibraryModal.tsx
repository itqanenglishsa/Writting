import React, { useState, useEffect } from 'react';
import { VocabularyWord } from '../types';
import { BookOpen, Search, Volume2, X, Sparkles, ArrowLeft, Check, Grid } from 'lucide-react';
import { speakText } from '../utils/speech';

interface VocabLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocabulary: VocabularyWord[];
  activeWord: VocabularyWord;
  onSelectWord: (word: VocabularyWord) => void;
}

export const VocabLibraryModal: React.FC<VocabLibraryModalProps> = ({
  isOpen,
  onClose,
  vocabulary,
  activeWord,
  onSelectWord
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

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

  // Extract unique categories
  const categories = ['الكل', ...Array.from(new Set(vocabulary.map((v) => v.category)))];

  // Filter vocabulary
  const filteredVocab = vocabulary.filter((v) => {
    const matchesCategory = selectedCategory === 'الكل' || v.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.arabic.includes(searchQuery);

    return matchesCategory && matchesQuery;
  });

  const speakWord = (text: string) => {
    speakText(text);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#fffdf5] w-full max-w-4xl rounded-3xl shadow-[8px_8px_0px_0px_#000] border-[3px] border-black flex flex-col max-h-[90vh] overflow-hidden dir-rtl my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rubber Hose Top Line */}
        <div className="h-2 bg-gradient-to-r from-[#214ECF] via-[#EA9835] to-[#E06045] w-full shrink-0 border-b-2 border-black" />
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b-[3px] border-black flex items-center justify-between bg-[#214ECF] text-white">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#EA9835] border-2 border-black text-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Almarai',sans-serif]">
                  مكتبة المفردات الشاملة (A1 Vocabulary Bank) 📚
                </h2>
                <span className="text-xs bg-[#EA9835] text-black border-2 border-black font-black px-2.5 py-0.5 rounded-full font-['Outfit'] shadow-[1px_1px_0px_0px_#000]">
                  {vocabulary.length} مفردة
                </span>
              </div>
              <p className="text-xs text-amber-100 font-bold mt-0.5">
                تصفح كل كلمات المستوى الأول واستمع لنطقها المعتمد للتدرب عليها بالقلم!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EA9835] hover:bg-[#E06045] border-2 border-black text-black hover:text-white flex items-center justify-center transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000]"
            title="إغلاق المكتبة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 border-b-[3px] border-black space-y-3 bg-[#fffdf5]">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-black absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالإنجليزية أو العربية (مثال: Apple / تفاحة)..."
              className="w-full pr-10 pl-4 py-2.5 bg-white border-2 border-black rounded-2xl text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-[#214ECF] transition-all placeholder:text-black/50 shadow-[3px_3px_0px_0px_#000]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#214ECF] hover:underline cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* Categories Pills Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-black">
              <span>تصفح حسب مجموعة الكلمات ({categories.length - 1} مجموعة):</span>
              <span className="text-[10px] text-slate-500 font-bold">مرّر أفقيًا لتصفح باقي المجموعات ↔️</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#EA9835] scrollbar-track-amber-100/50 hover:scrollbar-thumb-[#E06045]">
              {categories.map((cat) => {
                const isCatActive = selectedCategory === cat;
                const count = cat === 'الكل' 
                  ? vocabulary.length 
                  : vocabulary.filter(v => v.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 ${
                      isCatActive
                        ? 'bg-[#214ECF] text-white'
                        : 'bg-white text-black hover:bg-amber-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isCatActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-black/70'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vocabulary Grid Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 bg-[#fffdf5]">
          {filteredVocab.length === 0 ? (
            <div className="col-span-full py-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-black/40 mx-auto" />
              <p className="text-sm font-black text-black">لم نجد مفردات تطابق بحثك حالياً.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('الكل');
                }}
                className="text-xs text-[#214ECF] font-black underline cursor-pointer"
              >
                إعادة ضبط خيارات البحث
              </button>
            </div>
          ) : (
            filteredVocab.map((vocab) => {
              const isSelected = activeWord.id === vocab.id;

              return (
                <div
                  key={vocab.id}
                  className={`bg-white rounded-2xl p-4 border-2 border-black transition-all flex flex-col justify-between shadow-[4px_4px_0px_0px_#000] ${
                    isSelected
                      ? 'bg-amber-50 border-[3px] border-[#214ECF] shadow-[4px_4px_0px_0px_#214ECF]'
                      : 'hover:bg-amber-50/50'
                  }`}
                >
                  <div>
                    {/* Top Row: Category Badge & Audio trigger */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-black bg-[#EA9835] border border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_#000]">
                        {vocab.category}
                      </span>
                      <button
                        onClick={() => speakWord(vocab.word)}
                        className="p-1.5 bg-[#EA9835] hover:bg-[#d88625] text-black rounded-lg border border-black transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                        title="استمع للنطق الأصلي"
                      >
                        <Volume2 className="w-4 h-4 text-black" />
                      </button>
                    </div>

                    {/* Word Display */}
                    <div className="flex items-baseline gap-2 mb-1" dir="ltr">
                      <h3 className="text-lg font-black text-[#214ECF] font-['Outfit']" dir="ltr">
                        {vocab.word}
                      </h3>
                      <span className="text-xs font-black text-slate-800">
                        ({vocab.arabic})
                      </span>
                    </div>

                    {/* Sentence example */}
                    {vocab.exampleEn && (
                      <p className="text-[11px] text-slate-600 font-bold mt-1 line-clamp-1" dir="ltr">
                        "{vocab.exampleEn}"
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                    {isSelected ? (
                      <span className="text-xs font-black text-[#214ECF] flex items-center gap-1">
                        <Check className="w-4 h-4 text-[#214ECF]" />
                        <span>الكلمة المحددة حالياً</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectWord(vocab);
                          onClose();
                        }}
                        className="w-full py-2 bg-[#214ECF] hover:bg-[#1a3fb3] text-white border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-transform cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span>تدرب عليها بالقلم ✍️</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t-[3px] border-black bg-amber-100 flex items-center justify-between text-xs text-black font-black">
          <span>عرض {filteredVocab.length} من أصل {vocabulary.length} مفردة</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#EA9835] hover:bg-[#E06045] text-black hover:text-white border-2 border-black font-black rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            إغلاق المكتبة ✖️
          </button>
        </div>

      </div>
    </div>
  );
};
