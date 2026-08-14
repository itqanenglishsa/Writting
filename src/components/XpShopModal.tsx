import React, { useState, useEffect } from 'react';
import { UserStats, ShopItem } from '../types';
import { INITIAL_SHOP_ITEMS } from '../data/vocabulary';
import { X, ShoppingBag, Sparkles, Check, Shield, Palette } from 'lucide-react';

interface XpShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onBuyItem: (item: ShopItem) => boolean;
  onSelectPenColor?: (colorHex: string) => void;
}

export const XpShopModal: React.FC<XpShopModalProps> = ({
  isOpen,
  onClose,
  stats,
  onBuyItem,
  onSelectPenColor
}) => {
  const [purchasedMsg, setPurchasedMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBuy = (item: ShopItem) => {
    const success = onBuyItem(item);
    if (success) {
      setPurchasedMsg(`تم شراء "${item.nameAr}" بنجاح! 🎉`);
      setTimeout(() => setPurchasedMsg(null), 3000);
    } else {
      setPurchasedMsg(`عذراً، تحتاج إلى المزيد من رصيد XP! ⭐️`);
      setTimeout(() => setPurchasedMsg(null), 3000);
    }
  };

  const handleSelectColor = (colorHex: string, nameAr: string) => {
    if (onSelectPenColor) {
      onSelectPenColor(colorHex);
      setPurchasedMsg(`تم تفعيل "${nameAr}" بنجاح! 🎨`);
      setTimeout(() => setPurchasedMsg(null), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#fffdf5] rounded-3xl max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_#000] border-[3px] border-black overflow-hidden relative dir-rtl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rubber Hose Top Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#214ECF] via-[#EA9835] to-[#E06045] border-b-2 border-black" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b-[3px] border-black pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EA9835] border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black font-['Almarai',sans-serif]">متجر إتقان XP 🛍️</h3>
              <p className="text-xs text-slate-700 font-black">تزوّد بألوان قلم جذابة ومتنوعة!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق المتجر"
            className="w-8 h-8 rounded-full bg-[#EA9835] hover:bg-[#E06045] border-2 border-black text-black hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="my-4 p-4 rounded-2xl bg-[#EA9835] text-black border-2 border-black flex items-center justify-between shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-black fill-amber-300 animate-bounce" />
            <div>
              <span className="text-xs font-black text-black block">رصيد XP الحالي:</span>
              <span className="text-2xl font-black text-black font-['Outfit']">{stats.xp} XP</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-center bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-black font-black block">لون القلم:</span>
              <div className="flex items-center justify-center mt-0.5">
                {stats.activePenColor === 'rainbow' ? (
                  <span className="text-xs">🌈</span>
                ) : (
                  <span 
                    className="w-4 h-4 rounded-full border border-black shadow-xs inline-block" 
                    style={{ backgroundColor: stats.activePenColor }}
                    title={stats.activePenColor}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {purchasedMsg && (
          <div className="mb-4 p-3 rounded-xl bg-amber-100 border-2 border-black text-[#214ECF] text-xs font-black text-center shadow-[3px_3px_0px_0px_#000] animate-pulse">
            {purchasedMsg}
          </div>
        )}

        {/* Shop Items List */}
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#EA9835]">
          {INITIAL_SHOP_ITEMS.map((item) => {
            const isOwned = stats.unlockedItems.includes(item.id) || item.priceXp === 0;
            const canAfford = stats.xp >= item.priceXp;
            const isPenColor = item.type === 'pen_color';
            const isActiveColor = isPenColor && stats.activePenColor === item.value;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border-2 border-black flex items-center justify-between bg-white hover:bg-amber-50/60 transition-colors shadow-[3px_3px_0px_0px_#000]"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000] shrink-0 bg-amber-100"
                  >
                    {isPenColor && typeof item.value === 'string' ? (
                      item.value === 'rainbow' ? (
                        <span className="text-xl">🌈</span>
                      ) : (
                        <span 
                          className="w-6 h-6 rounded-full border border-black shadow-xs" 
                          style={{ backgroundColor: item.value }}
                        />
                      )
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-black text-sm font-['Almarai',sans-serif]">{item.nameAr}</h4>
                    </div>
                    <p className="text-[11px] text-slate-700 font-bold mt-0.5 leading-tight">{item.descriptionAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPenColor ? (
                    isActiveColor ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-200 text-black border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                        <Check className="w-3.5 h-3.5 text-black" /> مُفعّل
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleSelectColor(item.value as string, item.nameAr)}
                        className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#214ECF] hover:bg-[#1a3fb3] text-white border-2 border-black transition-transform cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <Palette className="w-3.5 h-3.5 text-white" />
                        <span>استخدام</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-transform flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                          canAfford
                            ? 'bg-[#214ECF] hover:bg-[#1a3fb3] text-white active:translate-x-0.5 active:translate-y-0.5'
                            : 'bg-slate-200 text-slate-500 border-black cursor-not-allowed'
                        }`}
                      >
                        <span className="font-['Outfit']">{item.priceXp} XP</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={item.type === 'streak_freeze' ? (isOwned || !canAfford) : !canAfford}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-transform flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                        item.type === 'streak_freeze' && isOwned
                          ? 'bg-amber-200 text-black cursor-default'
                          : canAfford
                          ? 'bg-[#214ECF] hover:bg-[#1a3fb3] text-white active:translate-x-0.5 active:translate-y-0.5'
                          : 'bg-slate-200 text-slate-500 border-black cursor-not-allowed'
                      }`}
                    >
                      {item.type === 'streak_freeze' && isOwned ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" /> حماية نشطة
                        </>
                      ) : (
                        <>
                          <span className="font-['Outfit']">{item.priceXp} XP</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Close Button */}
        <div className="mt-5 pt-4 border-t-[3px] border-black flex flex-col items-center gap-3">
          <p className="text-xs text-black font-black text-center">
            احصل على المزيد من XP عند إكمال تمارين الكتابة بدقة وبدون أخطاء! 🌟
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#EA9835] hover:bg-[#E06045] text-black hover:text-white border-2 border-black rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>إغلاق متجر XP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
