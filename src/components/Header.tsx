import React from 'react';
import { Sparkles, ShieldCheck, History, GraduationCap, Heart, HelpCircle } from 'lucide-react';

interface Props {
  onOpenCostSecurity: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<Props> = ({
  onOpenCostSecurity,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="لوگوی معلم‌یار هوشمند"
            className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-emerald-500/20 ring-2 ring-emerald-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                معلم‌یار هوشمند
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                نسخه اول
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              دستیار تخصصی معلمان فارسی‌زبان برای نگارش طرح درس، آزمون‌سازی و خلاصه‌سازی دروس
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            title="مشاهده تاریخچه موارد تولید شده"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">تاریخچه</span>
            {historyCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Cost & Security Button */}
          <button
            onClick={onOpenCostSecurity}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
            title="راهنمای هزینه‌ها، سهمیه و امنیت برنامه"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">هزینه‌ها و امنیت</span>
          </button>
        </div>
      </div>
    </header>
  );
};
