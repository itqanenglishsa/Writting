import React from 'react';
import { UserStats } from '../types';
import { Sparkles, Shield, Palette, ShoppingBag, Flame, Award, BookOpen } from 'lucide-react';
// استيراد الشعار من مجلد الروت بناءً على موقع ملف Header.tsx الحالي
import logo from '../../logo.png';

interface HeaderProps {
  stats: UserStats;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onOpenVocabLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenShop,
  onOpenStats,
  onOpenVocabLibrary
}) => {
  return (
    <header className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 my-4 max-w-7xl mx-auto w-full transition-all relative overflow-hidden dir-rtl">
      {/* Decorative Brand Top Bar Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#214ECF] via-[#EA9835] to-[#E06045]" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
        
        {/* Brand Logo Image */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="شعار منصة إتقان" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          
          {/* Vocab Bank Library Button */}
          <button
            onClick={onOpenVocabLibrary}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="فتح مكتبة مفردات A1 الشاملة"
          >
            <BookOpen className="w-4 h-4 text-[#214ECF]" />
            <span>مكتبة المفردات</span>
          </button>

          {/* Streak Counter */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-orange-700 font-semibold text-xs"
            title="أيام الحماسة المتتالية"
          >
            <Flame className="w-4 h-4 text-[#E06045] fill-[#E06045]" />
            <span>{stats.streakDays} أيام حماسة</span>
          </div>

          {/* XP Counter */}
          <div 
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[#214ECF] font-bold text-xs"
            title="نقاط الخبرة الكلية"
          >
            <Sparkles className="w-4 h-4 text-[#EA9835] fill-[#EA9835]" />
            <span>{stats.xp} XP</span>
          </div>

          {/* Active Pen Color Badge & Shop Trigger */}
          <div className="flex items-center bg-emerald-50/90 border border-emerald-200/80 rounded-full p-1.5 px-3">
            <div 
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700"
              title="لون القلم المفعل حالياً"
            >
              <Palette className="w-3.5 h-3.5 text-[#214ECF]" />
              {stats.activePenColor === 'rainbow' ? (
                <span className="text-sm">🌈</span>
              ) : (
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-black shadow-xs inline-block" 
                  style={{ backgroundColor: stats.activePenColor }}
                />
              )}
            </div>

            <button
              onClick={onOpenShop}
              className="bg-[#214ECF] hover:bg-[#1a3fb3] text-white px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer mr-1"
              title="فتح متجر XP (ألوان قلم ودروع حماية)"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>المتجر</span>
            </button>
          </div>

          {/* Progress Stats Modal Trigger */}
          <button
            onClick={onOpenStats}
            className="p-2 text-slate-700 hover:text-[#214ECF] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="إحصائيات إتقاني"
          >
            <Award className="w-5 h-5" />
          </button>

        </div>

      </div>
    </header>
  );
};