import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface UploadedImageData {
  data: string; // base64 without prefix
  mimeType: string;
  previewUrl: string; // data URL with prefix for <img>
  name: string;
  size: number;
}

interface Props {
  image: UploadedImageData | null;
  onChange: (image: UploadedImageData | null) => void;
  onExtractText?: (text: string) => void;
  label?: string;
  hint?: string;
}

export const ImageUploader: React.FC<Props> = ({
  image,
  onChange,
  onExtractText,
  label = 'بارگذاری تصویر کتاب یا برگه سؤال (اختیاری)',
  hint = 'پشتیبانی از فرمت‌های JPG، JPEG، PNG و WebP (حداکثر ۸ مگابایت)',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} بایت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
  };

  const processFile = (file: File) => {
    setError(null);
    setExtractedSuccess(false);

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/jfif'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.toLowerCase().endsWith('.jfif')) {
      setError('فرمت فایل نامعتبر است. لطفاً فایلی با پسوند JPG، JPEG، PNG یا WebP انتخاب فرمایید.');
      return;
    }

    // Validate size (max 8MB)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('حجم تصویر انتخاب‌شده بیش از ۸ مگابایت است. لطفاً تصویری با حجم کمتر انتخاب نمایید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      // Extract pure base64 and mime type
      const match = resultStr.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const data = match[2];
        onChange({
          data,
          mimeType,
          previewUrl: resultStr,
          name: file.name,
          size: file.size,
        });
      } else {
        setError('خطا در خواندن فایل تصویر. لطفاً مجدداً امتحان کنید.');
      }
    };

    reader.onerror = () => {
      setError('خواندن فایل تصویر با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    setExtractedSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExtractText = async () => {
    if (!image || !onExtractText) return;
    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/extract-text-from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: {
            data: image.data,
            mimeType: image.mimeType,
          },
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'خطا در استخراج متن از تصویر.');
      }

      onExtractText(resData.text);
      setExtractedSuccess(true);
      setTimeout(() => setExtractedSuccess(false), 3500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'استخراج متن با خطا مواجه شد. لطفاً دوباره امتحان کنید.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
        <span className="text-[11px] text-slate-400 font-medium">{hint}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/jfif,.jfif"
        onChange={handleFileChange}
        className="hidden"
      />

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200 flex items-center justify-center transition-all">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-700 hover:underline">
              کلیک برای انتخاب عکس از گوشی یا رایانه
            </span>
            <span className="text-xs text-slate-500 font-normal"> یا کشیدن و رها کردن فایل در این کادر</span>
          </div>
          <p className="text-[11px] text-slate-400">
            می‌توانید عکس صفحه کتاب درسی یا برگه تمرین را برای طراحی خودکار سؤال یا خلاصه‌سازی انتخاب کنید.
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-xs">
              <img
                src={image.previewUrl}
                alt={image.name}
                className="w-full h-full object-contain bg-slate-100"
              />
            </div>
            <div className="overflow-hidden space-y-1">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[200px] sm:max-w-[280px]">
                  {image.name}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{formatFileSize(image.size)}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">تصویر آماده پردازش</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {onExtractText && (
              <button
                type="button"
                onClick={handleExtractText}
                disabled={isExtracting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="خواندن مستقیم متن‌های فارسی تصویر و قرار دادن در کادر متنی"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال خواندن متن...</span>
                  </>
                ) : extractedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متن استخراج شد!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>استخراج متن از تصویر (OCR)</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
              title="حذف تصویر"
            >
              <X className="w-3.5 h-3.5" />
              <span>حذف تصویر</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
