import React, { useState } from 'react';
import { X, Printer, FileDown, CheckCircle2, Info, Eye, Loader2 } from 'lucide-react';
import { printIsolatedDocument } from '../utils/printEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
  documentTypeLabel: string;
}

export const PrintPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  htmlContent,
  documentTypeLabel,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printIsolatedDocument(htmlContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[95vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">{title}</h3>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  {documentTypeLabel}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                تنظیم شده در ابعاد استاندارد برگه A4 و فونت فارسی وزیرمتن
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip Box */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-2.5 text-xs text-amber-900 shrink-0">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>راهنمای خروجی PDF و چاپ:</strong> پس از زدن دکمه «چاپ فوری یا خروجی PDF»، در پنجرهٔ مرورگر
            در بخش <strong>Destination (چاپگر یا مقصد)</strong>، گزینه{' '}
            <span className="bg-amber-200/80 px-1.5 py-0.5 rounded font-bold">Save as PDF (ذخیره به صورت PDF)</span>{' '}
            را انتخاب کنید تا یک فایل PDF باکیفیت برداری، حروف کاملاً متصل فارسی و بدون بهم‌ریختگی ایجاد شود.
          </div>
        </div>

        {/* Live A4 Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80 flex justify-center">
          <div className="w-full max-w-[210mm] bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
            <iframe
              srcDoc={htmlContent}
              title="A4 Preview"
              className="w-full h-[650px] border-0"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="bg-white border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 hidden sm:flex">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>حاشیه‌های A4، اتصال صحیح حروف و شکست صفحات رعایت شده است.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              انصراف
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال آماده‌سازی صفحه چاپ...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>چاپ فوری یا خروجی PDF (A4)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
