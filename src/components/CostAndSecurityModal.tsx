import React from 'react';
import { ShieldCheck, Coins, Gauge, Lock, X, CheckCircle, Info, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CostAndSecurityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">راهنمای شفاف هزینه‌ها، محدودیت‌ها و امنیت</h2>
              <p className="text-emerald-100 text-xs mt-0.5">اطلاعات ضروری پیش از استقرار و انتشار عمومی سامانه «معلم‌یار هوشمند»</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          {/* Section 1: Costs */}
          <div className="border border-emerald-100 bg-emerald-50/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base mb-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <span>۱. هزینه‌های احتمالی و تعرفه هوش مصنوعی (Gemini 3.8 Flash)</span>
            </div>
            <ul className="space-y-2 text-slate-700 pr-5 list-disc text-xs sm:text-sm">
              <li>
                <strong>سهمیه رایگان (Free Tier):</strong> مدل پیش‌فرض <code className="bg-emerald-150 px-1 py-0.5 rounded text-emerald-900 font-mono">gemini-3.8-flash</code> دارای سهمیه رایگان سخاوتمندانه در پلتفرم Google AI Studio است و برای استفاده آموزشی کلاسی یا روزمره معلمان هزینه‌ای ندارد.
              </li>
              <li>
                <strong>هزینه در پلن تجاری (Pay-as-you-go):</strong> در صورت اتصال حساب ابری یا افزایش مقیاس، تعرفه ورودی حدود ۰٫۰۷۵ دلار به ازای هر ۱ میلیون توکن و خروجی حدود ۰٫۳۰ دلار به ازای هر ۱ میلیون توکن است.
              </li>
              <li>
                <strong>تخمین هزینه به ازای هر عملکرد معلم:</strong>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block font-semibold text-emerald-800">طرح درس روزانه کامل</span>
                    <span className="text-slate-500">حدود ۰٫۰۰۰۵ دلار (کسری از ۱ سنت)</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block font-semibold text-emerald-800">طراحی آزمون و کلید</span>
                    <span className="text-slate-500">حدود ۰٫۰۰۰۶ دلار</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block font-semibold text-emerald-800">خلاصه‌سازی درس</span>
                    <span className="text-slate-500">حدود ۰٫۰۰۰۳ دلار</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Section 2: Rate limits */}
          <div className="border border-amber-100 bg-amber-50/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-2">
              <Gauge className="w-5 h-5 text-amber-600" />
              <span>۲. سقف و محدودیت‌های مصرف (Rate Limits)</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm mb-2">
              برای جلوگیری از اشباع سرویس و حفظ پایداری، محدودیت‌های زیر توسط گوگل اعمال می‌شوند:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-center">
                <span className="text-slate-500 block">درخواست در دقیقه (RPM)</span>
                <span className="text-base font-bold text-amber-800">۱۵ درخواست/دقیقه</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-center">
                <span className="text-slate-500 block">توکن در دقیقه (TPM)</span>
                <span className="text-base font-bold text-amber-800">۱٬۰۰۰٬۰۰۰ توکن</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-center">
                <span className="text-slate-500 block">درخواست در روز (RPD)</span>
                <span className="text-base font-bold text-amber-800">۱٬۵۰۰ درخواست/روز</span>
              </div>
            </div>
            <p className="text-xs text-amber-800 mt-2">
              💡 برای یک مدرسه با ۱۰ تا ۲۰ معلم، این سهمیه پاسخگوی تولید صدها برگه امتحانی و طرح درس در طول روز است.
            </p>
          </div>

          {/* Section 3: Security & Privacy */}
          <div className="border border-sky-100 bg-sky-50/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-base mb-2">
              <Lock className="w-5 h-5 text-sky-600" />
              <span>۳. معماری امنیت و حفاظت از داده‌ها</span>
            </div>
            <ul className="space-y-2 text-slate-700 pr-5 list-disc text-xs sm:text-sm">
              <li>
                <strong>عدم افشای کلید API در مرورگر (Server-Side Proxy):</strong> کلید مخفی API به هیچ عنوان در کد جاوااسکریپت سمت کاربر یا مرورگر وجود ندارد. تمام درخواست‌ها ابتدا به سرور امن داخلی <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900 font-mono">server.ts</code> فرستاده شده و از آنجا به شکل امن ارتباط برقرار می‌شود.
              </li>
              <li>
                <strong>حریم خصوصی متون و سوالات:</strong> متون واردشده تنها برای پردازش همان لحظه به هوش مصنوعی ارسال می‌شوند و در هیچ دیتابیس عمومی یا شخص ثالث ذخیره نمی‌گردند.
              </li>
              <li>
                <strong>ذخیره محلی سوابق (LocalStorage):</strong> تاریخچه تولیدات فقط در حافظه خصوصی مرورگر خود شما باقی می‌ماند و حتی در صورت آفلاین شدن، قابل بازیابی است.
              </li>
            </ul>
          </div>

          {/* Section 4: 403 Forbidden & Publishing Guide */}
          <div className="border border-rose-200 bg-rose-50/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-base mb-2">
              <Info className="w-5 h-5 text-rose-600" />
              <span>۴. علت خطای ۴۰۳ (403 Forbidden) در لینک منتشرشده و روش رفع آن</span>
            </div>
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                اگر هنگام باز کردن آدرس منتشرشده برنامه با خطای <strong>403 Forbidden</strong> مواجه شدید، این موضوع مربوط به دو علت ساختاری سرویس‌های ابری گوگل است و به تنهایی با تغییر کد سمت کلاینت برطرف نمی‌شود:
              </p>
              <ul className="list-disc pr-5 space-y-1.5 text-slate-700">
                <li>
                  <strong>علت اول (تحریم منطقه‌ای آی‌پی‌های ایران توسط گوگل):</strong> دامنه‌های Cloud Run و APIهای هوش مصنوعی گوگل دسترسی مستقیم از آدرس‌های IP کشور ایران را مسدود کرده و کد خطای ۴۰۳ بازمی‌گردانند. برای باز کردن لینک و استفاده از هوش مصنوعی، فعال بودن ابزار رفع تحریم (VPN یا پروکسی پایدار) الزامی است.
                </li>
                <li>
                  <strong>علت دوم (دسترسی عمومی در گوگل کلاد):</strong> سرویس سرور در سرویس Cloud Run باید دسترسی بدون احراز هویت (<code className="bg-white px-1.5 py-0.5 rounded border border-rose-200 font-mono text-rose-800">allUsers &rarr; Cloud Run Invoker</code>) داشته باشد تا عموم کاربران و معلمان بتوانند بدون لاگین به حساب سازمانی گوگل به صفحه دسترسی پیدا کنند.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5: Tips for teachers */}
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>توصیه‌های کاربردی برای معلمان محترم:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              هر چه متن ورودی درس یا موضوع شما دقیق‌تر و ساختاریافته‌تر باشد، هوش مصنوعی سریع‌تر پاسخ تولید می‌کند و مصرف توکن کمتری خواهید داشت. پس از تولید، همواره پاسخنامه و طرح درس را با سرفصل کتب درسی رسمی تطبیق دهید.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>تنظیمات امنیتی و سرور اختصاصی فعال است</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            متوجه شدم، بازگشت به برنامه
          </button>
        </div>
      </div>
    </div>
  );
};
