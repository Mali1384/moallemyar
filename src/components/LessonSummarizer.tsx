import React, { useState } from 'react';
import { SummaryData } from '../types';
import {
  Lightbulb,
  Sparkles,
  Copy,
  Printer,
  Download,
  Check,
  BookOpen,
  HelpCircle,
  BookmarkCheck,
  Compass,
  RotateCcw,
  Volume2,
  Eye,
  FileText,
} from 'lucide-react';
import {
  copyToClipboard,
  downloadTextFile,
  downloadWordDocument,
  formatSummaryAsText,
} from '../utils/exportUtils';
import { generateSummaryHtml, printIsolatedDocument } from '../utils/printEngine';
import { PrintPreviewModal } from './PrintPreviewModal';
import { ErrorAlert } from './ErrorAlert';
import { ImageUploader, UploadedImageData } from './ImageUploader';

interface Props {
  onSaveToHistory: (summary: SummaryData) => void;
  initialData?: SummaryData | null;
}

const PRESET_SUMMARIES = [
  {
    title: 'سیاره زمین و منظومه شمسی (علوم چهارم)',
    grade: 'پایه چهارم ابتدایی',
    style: 'story',
    text: `زمین ما یکی از سیارات شگفت‌انگیز منظومه شمسی است که به دور خورشید می‌چرخد. خورشید یک ستاره بسیار بزرگ و داغ در مرکز این منظومه است که به همه سیارات گرما و نور می‌بخشد. زمین دو نوع حرکت دارد: یکی چرخش به دور خودش که ۲۴ ساعت یعنی یک شبانه‌روز طول می‌کشد و باعث پدید آمدن شب و روز می‌شود؛ دیگری چرخش به دور خورشید که ۳۶۵ روز یعنی یک سال طول می‌کشد و با مایل بودن محور زمین، چهار فصل زیبا (بهار، تابستان، پاییز و زمستان) را می‌سازد. ماه تنها قمر طبیعی زمین است که به دور زمین می‌گردد و از خود نوری ندارد بلکه نور خورشید را مثل آینه بازتاب می‌دهد.`,
  },
  {
    title: 'دستگاه گوارش انسان (علوم پنجم)',
    grade: 'پایه پنجم ابتدایی',
    style: 'simple',
    text: `بدن ما برای رشد و فعالیت به انرژی و مواد غذایی نیاز دارد، اما لقمه‌های غذایی که می‌خوریم بسیار بزرگ‌تر از آن هستند که مستقیماً وارد خون و سلول‌ها شوند. وظیفه خرد کردن و تبدیل این غذاها به ذرات بسیار ریز و قابل جذب، بر عهده دستگاه گوارش است. این سفر شگفت‌انگیز از دهان آغاز می‌شود؛ دندان‌ها غذا را خرد می‌کنند و بزاق دهان آن را نرم می‌کند. سپس غذا از لوله‌ای به نام مری عبور کرده و وارد کیسه‌ای عضلانی به نام معده می‌شود. در معده، اسید و شیره‌های گوارشی غذا را به صورت مایعی غلیظ درمی‌آورند. در ادامه غذا وارد روده باریک می‌شود؛ جایی که جذب اصلی مواد غذایی به خون انجام می‌پذیرد. در نهایت مواد زاید و غیرقابل جذب به روده بزرگ رفته و دفع می‌شوند.`,
  },
];

export const LessonSummarizer: React.FC<Props> = ({ onSaveToHistory, initialData }) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<UploadedImageData | null>(null);
  const [grade, setGrade] = useState('پایه چهارم ابتدایی');
  const [style, setStyle] = useState<'simple' | 'story' | 'bullet'>('simple');
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryData | null>(initialData || null);
  const [copied, setCopied] = useState(false);
  const [revealedQuiz, setRevealedQuiz] = useState<Record<number, boolean>>({});

  React.useEffect(() => {
    if (initialData) {
      setResult(initialData);
    }
  }, [initialData]);

  const applyPreset = (preset: (typeof PRESET_SUMMARIES)[0]) => {
    setText(preset.text);
    setGrade(preset.grade);
    setStyle(preset.style as any);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !attachedImage) {
      setError('لطفاً متن درسی یا تصویر صفحه کتاب را وارد یا بارگذاری نمایید.');
      return;
    }

    setLoading(true);
    setError(null);
    setRevealedQuiz({});

    try {
      const response = await fetch('/api/summarize-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          image: attachedImage
            ? {
                data: attachedImage.data,
                mimeType: attachedImage.mimeType,
              }
            : undefined,
          grade,
          style,
          length,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'خطا در ارتباط با سرور.');
      }

      setResult(data.data);
      onSaveToHistory(data.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'خطایی در خلاصه‌سازی متن رخ داد. لطفاً ارتباط اینترنت را بررسی و مجدداً امتحان کنید.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = formatSummaryAsText(result);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const text = formatSummaryAsText(result);
    const filename = `خلاصه_درس_${result.title}.txt`.replace(/\s+/g, '_');
    downloadTextFile(filename, text);
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    if (!result) return;
    setIsPreviewOpen(true);
  };

  const handleInstantPrint = async () => {
    if (!result) return;
    try {
      const html = generateSummaryHtml(result);
      await printIsolatedDocument(html);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطا در باز شدن پنجره چاپ مرورگر. لطفاً مجدداً امتحان کنید.');
    }
  };

  const handleDownloadWord = () => {
    if (!result) return;
    try {
      const html = generateSummaryHtml(result);
      const filename = `خلاصه_درس_${result.title}.doc`.replace(/\s+/g, '_');
      downloadWordDocument(filename, `خلاصه درس: ${result.title}`, html);
    } catch (err: any) {
      console.error(err);
      setError('خطا در دانلود فایل Word. لطفاً دوباره تلاش نمایید.');
    }
  };

  const toggleQuizAnswer = (idx: number) => {
    setRevealedQuiz((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 no-print">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">خلاصه‌سازی متن درسی به زبان دانش‌آموز</h2>
              <p className="text-xs text-slate-500">
                تبدیل متون سنگین کتاب به مفاهیم روان، نکات کلیدی و واژه‌نامه کودکانه
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 ml-1">نمونه‌های پیشنهادی:</span>
            {PRESET_SUMMARIES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Image Uploader */}
          <ImageUploader
            image={attachedImage}
            onChange={setAttachedImage}
            onExtractText={(extracted) => {
              setText((prev) => (prev ? `${prev}\n\n${extracted}` : extracted));
            }}
            label="بارگذاری تصویر صفحه کتاب درسی (اختیاری)"
            hint="می‌توانید عکس صفحه درس را انتخاب کنید تا متن آن خودکار استخراج یا خلاصه شود"
          />

          {/* Text input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                متن کامل درس یا پاراگراف‌های مورد نظر: {!attachedImage && <span className="text-rose-500">*</span>}
              </label>
              <span className="text-xs text-slate-400">{text.length} کاراکتر</span>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="متن درس کتاب را اینجا بچسبانید (یا از کادر بالا تصویر صفحه کتاب را بارگذاری کنید)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مقطع و پایه مخاطب:
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="مثلاً پایه پنجم ابتدایی"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
              />
            </div>

            {/* Writing Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                سبک نگارش خلاصه:
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
              >
                <option value="simple">ساده، صمیمی و روان (پیش‌فرض)</option>
                <option value="story">داستانی و تمثیلی (جذاب برای کودکان)</option>
                <option value="bullet">نکته‌وار، کنکوری و نموداری</option>
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                حجم خلاصه:
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
              >
                <option value="short">کوتاه و سریع (مرور در ۱ دقیقه)</option>
                <option value="medium">متوسط و متعادل (توضیح کامل مفهوم)</option>
                <option value="detailed">تفصیلی و جامع (همراه با مثال‌های بیشتر)</option>
              </select>
            </div>
          </div>

          {/* Error Alert */}
          <ErrorAlert error={error} onRetry={handleGenerate} onDismiss={() => setError(null)} />

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading || (!text.trim() && !attachedImage)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>در حال ساده‌سازی و خلاصه‌نویسی متن...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>خلاصه‌سازی متن به زبان دانش‌آموز</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3 no-print shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-sm font-bold text-slate-800">خلاصه درس آماده شد</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleInstantPrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="باز کردن پنجره چاپ مرورگر جهت چاپ مستقیم یا ذخیره به صورت PDF استاندارد A4"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ / ذخیره به‌صورت PDF (A4)</span>
              </button>

              <button
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="دانلود خلاصه درس به صورت فایل Word (.doc) قابل ویرایش"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>دانلود فایل Word (.doc)</span>
              </button>

              <button
                onClick={handleOpenPreview}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="مشاهده پیش‌نمایش صفحه استاندارد A4 قبل از چاپ"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                <span>پیش‌نمایش A4</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'کپی شد!' : 'کپی متن'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>دانلود متن (.txt)</span>
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 print-card">
            {/* Header */}
            <div className="border-b-2 border-amber-400 pb-5 text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                <BookOpen className="w-3.5 h-3.5" />
                خلاصه و یادگیری آسان
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{result.title}</h2>
            </div>

            {/* Main Summary Text */}
            <div className="bg-amber-50/40 border border-amber-100 rounded-3xl p-6 space-y-3">
              <h3 className="font-bold text-amber-900 text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <span>داستان و چکیدهٔ درس به زبان خودمانی:</span>
              </h3>
              <p className="text-slate-800 text-sm sm:text-base leading-loose text-justify font-normal">
                {result.summary}
              </p>
            </div>

            {/* Key Highlights */}
            {result.keyHighlights.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <BookmarkCheck className="w-5 h-5 text-emerald-600" />
                  <h3>نکات طلایی که حتماً باید یادت بماند:</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.keyHighlights.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary Dictionary */}
            {result.vocabulary.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3>جعبه‌ابزار کلمات مهم (واژه‌نامه ساده):</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.vocabulary.map((vocab, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 space-y-1 text-xs"
                    >
                      <span className="font-black text-blue-900 block text-sm">
                        « {vocab.word} »
                      </span>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        {vocab.simplifiedMeaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real World Example */}
            {result.realWorldExample && (
              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-purple-950">
                <Compass className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold text-purple-900">
                    این درس کجای زندگی واقعی به دردمان می‌خورد؟
                  </strong>
                  <p className="leading-relaxed text-slate-700">{result.realWorldExample}</p>
                </div>
              </div>
            )}

            {/* Self-check comprehension quiz */}
            {result.comprehensionQuiz.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <h3>سؤالات خودسنجی دانش‌آموز (آیا درس را خوب یاد گرفتم؟):</h3>
                </div>
                <div className="space-y-3">
                  {result.comprehensionQuiz.map((q, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800">
                        <span>
                          {idx + 1}. {q.question}
                        </span>
                        <button
                          onClick={() => toggleQuizAnswer(idx)}
                          className="text-xs text-amber-700 hover:text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 font-medium"
                        >
                          {revealedQuiz[idx] ? 'مخفی کردن پاسخ' : 'مشاهده پاسخ'}
                        </button>
                      </div>
                      {revealedQuiz[idx] && (
                        <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 mt-2 animate-fadeIn leading-relaxed">
                          <strong className="text-emerald-700 ml-1">پاسخ کلیدی:</strong>
                          {q.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* A4 Print and PDF Preview Modal */}
      {result && (
        <PrintPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`خلاصه درس: ${result.title}`}
          htmlContent={generateSummaryHtml(result)}
          documentTypeLabel="خلاصه درس دانش‌آموز (A4)"
        />
      )}
    </div>
  );
};
