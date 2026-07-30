import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  type?: 'success' | 'badge' | 'streak' | 'xp';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 max-w-md w-[90%] pointer-events-none dir-rtl">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isBadge = toast.type === 'badge';
          const isStreak = toast.type === 'streak';
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto p-4 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_#000] flex items-center justify-between gap-3 relative overflow-hidden ${
                isBadge 
                  ? 'bg-[#fffdf5] text-black' 
                  : isStreak 
                  ? 'bg-[#fffdf5] text-black' 
                  : 'bg-[#fffdf5] text-black'
              }`}
            >
              {/* Left Accent Strip */}
              <div 
                className={`absolute right-0 top-0 bottom-0 w-2.5 ${
                  isBadge 
                    ? 'bg-[#EA9835]' 
                    : isStreak 
                    ? 'bg-[#E06045]' 
                    : 'bg-[#214ECF]'
                }`}
              />

              <div className="flex items-center gap-3 pr-2">
                <div 
                  className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-lg shrink-0 shadow-[2px_2px_0px_0px_#000] ${
                    isBadge 
                      ? 'bg-[#EA9835] text-black' 
                      : isStreak 
                      ? 'bg-[#E06045] text-white' 
                      : 'bg-[#214ECF] text-white'
                  }`}
                >
                  {toast.icon ? (
                    toast.icon
                  ) : isBadge ? (
                    <Award className="w-5 h-5 text-black" />
                  ) : isStreak ? (
                    <Flame className="w-5 h-5 text-white fill-amber-300" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-black font-['Almarai',sans-serif] leading-tight flex items-center gap-1.5">
                    {toast.title}
                    {isBadge && <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />}
                  </h4>
                  {toast.description && (
                    <p className="text-xs text-slate-700 font-bold mt-0.5 leading-snug">
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-black text-black flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
