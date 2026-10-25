import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, XCircle, Info } from 'lucide-react';

interface Props {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<Props> = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  const isNetworkIssue =
    error.includes('اینترنت') ||
    error.includes('اتصال') ||
    error.includes('شبکه') ||
    error.includes('Failed to fetch') ||
    error.includes('NetworkError');

  return (
    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 shadow-sm my-4 text-slate-800 transition-all duration-300 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
          {isNetworkIssue ? (
            <WifiOff className="w-6 h-6 animate-pulse" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-rose-800 text-base">
              {isNetworkIssue ? 'خطا در ارتباط یا قطعی اینترنت' : 'خطا در پردازش و تولید پاسخ'}
            </h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-sm text-rose-700 leading-relaxed font-medium">
            {error}
          </p>

          <div className="bg-white/80 border border-rose-100 rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="w-3.5 h-3.5 text-rose-500" />
              <span>راهنمای رفع مشکل:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pr-2">
              <li>اتصال اینترنت دستگاه خود را بررسی کنید.</li>
              <li>به دلیل تحریم‌های منطقه‌ای سرورهای گوگل بر روی آی‌پی‌های ایران، اطمینان حاصل کنید ابزار تغییر آی‌پی (VPN) متصل است.</li>
              <li>در صورت طولانی بودن متن، می‌توانید آن را به بخش‌های کوچک‌تر تقسیم نمایید.</li>
              <li>چند ثانیه صبر کنید و دکمه «تلاش مجدد» را لمس نمایید.</li>
            </ul>
          </div>

          {onRetry && (
            <div className="pt-1">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تلاش مجدد</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
