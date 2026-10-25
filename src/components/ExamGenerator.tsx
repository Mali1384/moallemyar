import React, { useState } from 'react';
import { ExamData } from '../types';
import {
  FileCheck,
  Sparkles,
  Copy,
  Printer,
  Download,
  Check,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Key,
  RotateCcw,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import {
  copyToClipboard,
  downloadTextFile,
  downloadWordDocument,
  formatStudentExamAsText,
  formatTeacherKeyAsText,
} from '../utils/exportUtils';
import {
  generateStudentExamHtml,
  generateTeacherKeyHtml,
  printIsolatedDocument,
} from '../utils/printEngine';
import { PrintPreviewModal } from './PrintPreviewModal';
import { ErrorAlert } from './ErrorAlert';
import { ImageUploader, UploadedImageData } from './ImageUploader';

interface Props {
  onSaveToHistory: (exam: ExamData) => void;
  initialData?: ExamData | null;
}

const PRESET_TEXTS = [
  {
    title: 'فتوسنتز و تنفس گیاهان (علوم)',
    subject: 'علوم تجربی',
    grade: 'پایه ششم ابتدایی',
    text: `گیاهان سبز با استفاده از نور خورشید، آب و دی‌اکسید کربن هوا، غذاسازی می‌کنند که به این فرآیند «فتوسنتز» می‌گویند. کلروفیل یا سبزینه، رنگدانه‌ای است که نور خورشید را جذب می‌کند. در نتیجهٔ فتوسنتز، مادهٔ قندی گلوکز و گاز اکسیژن تولید می‌شود. اکسیژن تولیدشده از طریق روزنه‌های برگ به هوا آزاد شده و موجودات زنده از آن برای تنفس استفاده می‌کنند. گیاهان در تاریکی شب، فتوسنتز انجام نمی‌دهند اما تنفس آن‌ها به طور مداوم در شبانه‌روز ادامه دارد و در تنفس، اکسیژن مصرف کرده و دی‌اکسید کربن پس می‌دهند.`,
  },
  {
    title: 'انقلاب مشروطه (تاریخ)',
    subject: 'تاریخ و مطالعات',
    grade: 'پایه نهم متوسطه اول',
    text: `نهضت مشروطیت ایران در دوران پادشاهی مظفرالدین شاه قاجار شکل گرفت. علل اصلی این قیام، استبداد شدید درباریان، بی‌عدالتی، نفوذ گسترده بیگانگان (روسیه و انگلیس) و بحران‌های شدید اقتصادی بود. از رهبران برجسته روحانی این جنبش می‌توان به آیت‌الله سید محمد طباطبایی و آیت‌الله سید عبدالله بهبهانی اشاره کرد. همچنین بازرگانان، روشنفکران و عموم مردم در اعتراض به فلک بسته شدن تجار قند دست به تحصن در حرم حضرت عبدالعظیم و سپس سفارت انگلیس زدند. سرانجام مظفرالدین شاه در ۱۴ مرداد ۱۲۸۵ هجری شمسی فرمان تأسیس مجلس شورای ملی و قانون اساسی را امضا کرد.`,
  },
  {
    title: 'انرژی و قانون پایستگی (علوم/فیزیک)',
    subject: 'فیزیک و علوم',
    grade: 'پایه هفتم متوسطه',
    text: `انرژی توانایی انجام کار است. انرژی به شکل‌های گوناگونی مانند انرژی پتانسیل گرانشی، انرژی جنبشی، گرمایی، صوتی، الکتریکی و شیمیایی وجود دارد. طبق قانون پایستگی انرژی، انرژی هرگز خودبه‌خود به وجود نمی‌آید و از بین نمی‌رود، بلکه تنها از شکلی به شکل دیگر تبدیل می‌شود یا از جسمی به جسم دیگر منتقل می‌گردد. برای نمونه در یک اتومبیل، انرژی شیمیایی نهفته در بنزین پس از سوختن به انرژی گرمایی و سپس به انرژی جنبشی و حرکتی تبدیل می‌شود. یکای سنجش انرژی در دستگاه بین‌المللی یکاها (SI) ژول است.`,
  },
];

export const ExamGenerator: React.FC<Props> = ({ onSaveToHistory, initialData }) => {
  const [sourceText, setSourceText] = useState('');
  const [attachedImage, setAttachedImage] = useState<UploadedImageData | null>(null);
  const [grade, setGrade] = useState('پایه ششم ابتدایی');
  const [subject, setSubject] = useState('علوم تجربی');
  const [topic, setTopic] = useState('فتوسنتز و تنفس گیاهان');
  const [difficulty, setDifficulty] = useState('متوسط و استاندارد');

  // Counts
  const [mcCount, setMcCount] = useState(3);
  const [tfCount, setTfCount] = useState(2);
  const [descCount, setDescCount] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamData | null>(initialData || null);

  // Active view tab: 'student' | 'teacher' | 'unified'
  const [activeView, setActiveView] = useState<'student' | 'teacher' | 'unified'>('student');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Print & PDF modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [docLabel, setDocLabel] = useState('');

  const getTargetHtml = (type: 'student' | 'teacher') => {
    if (!result) return '';
    return type === 'student' ? generateStudentExamHtml(result) : generateTeacherKeyHtml(result);
  };

  const handleOpenPreview = (type: 'student' | 'teacher') => {
    if (!result) return;
    const html = getTargetHtml(type);
    setPreviewHtml(html);
    setPreviewTitle(
      type === 'student'
        ? `برگه آزمون دانش‌آموز - درس ${result.examHeader.subject}`
        : `کلید تصحیح و پاسخنامه معلم - درس ${result.examHeader.subject}`
    );
    setDocLabel(type === 'student' ? 'برگه آزمون دانش‌آموز (A4)' : 'پاسخنامه تشریحی معلم (A4)');
    setIsPreviewOpen(true);
  };

  const handleInstantPrint = async (type: 'student' | 'teacher') => {
    if (!result) return;
    try {
      const html = getTargetHtml(type);
      await printIsolatedDocument(html);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطا در باز شدن پنجره چاپ مرورگر. لطفاً مجدداً تلاش کنید.');
    }
  };

  const handleDownloadWord = (type: 'student' | 'teacher') => {
    if (!result) return;
    try {
      const html = getTargetHtml(type);
      const prefix = type === 'student' ? 'برگه_سؤالات' : 'پاسخنامه_معلم';
      const filename = `${prefix}_${result.examHeader.subject}_${result.examHeader.topic}.doc`.replace(/\s+/g, '_');
      const title = `${result.examHeader.subject} - ${result.examHeader.topic}`;
      downloadWordDocument(filename, title, html);
    } catch (err: any) {
      console.error(err);
      setError('خطا در دانلود فایل Word. لطفاً دوباره تلاش نمایید.');
    }
  };

  React.useEffect(() => {
    if (initialData) {
      setResult(initialData);
      setGrade(initialData.examHeader.grade);
      setSubject(initialData.examHeader.subject);
      setTopic(initialData.examHeader.topic);
    }
  }, [initialData]);

  const applyPreset = (preset: (typeof PRESET_TEXTS)[0]) => {
    setSourceText(preset.text);
    setSubject(preset.subject);
    setGrade(preset.grade);
    setTopic(preset.title);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceText.trim() && !topic.trim() && !attachedImage) {
      setError('لطفاً متن درسی، تصویر صفحه کتاب یا عنوان مبحث را وارد یا بارگذاری نمایید.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          image: attachedImage
            ? {
                data: attachedImage.data,
                mimeType: attachedImage.mimeType,
              }
            : undefined,
          grade,
          subject,
          topic,
          difficulty,
          multipleChoiceCount: mcCount,
          trueFalseCount: tfCount,
          descriptiveCount: descCount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'خطا در طراحی سؤالات.');
      }

      setResult(data.data);
      onSaveToHistory(data.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'خطایی در طراحی سؤالات امتحانی رخ داد. لطفاً اتصال اینترنت را چک کرده و مجدداً تلاش کنید.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (type: 'student' | 'teacher') => {
    if (!result) return;
    const text =
      type === 'student' ? formatStudentExamAsText(result) : formatTeacherKeyAsText(result);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleDownload = (type: 'student' | 'teacher') => {
    if (!result) return;
    const text =
      type === 'student' ? formatStudentExamAsText(result) : formatTeacherKeyAsText(result);
    const prefix = type === 'student' ? 'برگه_سؤالات' : 'پاسخنامه_معلم';
    const filename = `${prefix}_${result.examHeader.subject}_${result.examHeader.topic}.txt`.replace(
      /\s+/g,
      '_'
    );
    downloadTextFile(filename, text);
  };


  return (
    <div className="space-y-8">
      {/* Input Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 no-print">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">طراحی سؤال امتحانی همراه پاسخنامه</h2>
              <p className="text-xs text-slate-500">
                تولید خودکار سؤالات تستی، صحیح/غلط و تشریحی با کلید تصحیح و بارم‌بندی
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 ml-1">متون آماده نمونه:</span>
            {PRESET_TEXTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Image Uploader for Textbook Page / Questions */}
          <ImageUploader
            image={attachedImage}
            onChange={setAttachedImage}
            onExtractText={(extracted) => {
              setSourceText((prev) => (prev ? `${prev}\n\n${extracted}` : extracted));
            }}
            label="بارگذاری عکس صفحه کتاب درسی یا برگه سؤال (اختیاری)"
            hint="با انتخاب عکس، متن آن خودکار استخراج شده یا سؤالات مستقیماً از روی عکس طراحی می‌شوند"
          />

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                متن کتاب درسی یا سرفصل آموزشی: {!attachedImage && <span className="text-rose-500">*</span>}
              </label>
              <span className="text-xs text-slate-400">
                {sourceText.length} کاراکتر (می‌توانید بخشی از کتاب را مستقیماً کپی و جای‌گذاری کنید)
              </span>
            </div>
            <textarea
              rows={4}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="متن درس، بخش یا فصلی از کتاب را اینجا وارد کنید (یا از بخش بالا تصویر کتاب را بارگذاری کنید)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">پایه تحصیلی:</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="مثلاً پایه ششم ابتدایی"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام درس:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً علوم تجربی"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">موضوع آزمون:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثلاً فصل دوم - فتوسنتز"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سطح دشواری:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
              >
                <option value="ساده و در سطح کتاب">ساده (یادآوری و درک اولیه)</option>
                <option value="متوسط و استاندارد">متوسط (استاندارد امتحانات مدارس)</option>
                <option value="دشوار و تفکربرانگیز">دشوار (تیزهوشان / سنجش عمقی)</option>
                <option value="ترکیبی و جامع">ترکیبی (شامل ساده، متوسط و سخت)</option>
              </select>
            </div>
          </div>

          {/* Counts Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">تعداد سؤالات به تفکیک نوع:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  سؤالات تستی (چهارگزینه‌ای): <strong>{mcCount} عدد</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={mcCount}
                  onChange={(e) => setMcCount(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  سؤالات صحیح / غلط: <strong>{tfCount} عدد</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={tfCount}
                  onChange={(e) => setTfCount(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  سؤالات تشریحی / کوتاه پاسخ: <strong>{descCount} عدد</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={descCount}
                  onChange={(e) => setDescCount(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          <ErrorAlert error={error} onRetry={handleGenerate} onDismiss={() => setError(null)} />

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading || (!sourceText.trim() && !topic.trim() && !attachedImage)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>در حال طراحی سؤالات امتحانی و پاسخنامه...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>طراحی سؤالات امتحانی با پاسخنامه</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* View Selector & Export Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-4 no-print shadow-xs">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveView('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'student'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>برگه سؤالات دانش‌آموز</span>
              </button>

              <button
                onClick={() => setActiveView('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'teacher'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>پاسخنامه تشریحی (معلم)</span>
              </button>

              <button
                onClick={() => setActiveView('unified')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'unified'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>نمای ترکیبی</span>
              </button>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleInstantPrint(activeView === 'teacher' ? 'teacher' : 'student')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="باز کردن پنجره چاپ مرورگر جهت چاپ مستقیم یا ذخیره به صورت PDF استاندارد A4"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ / ذخیره به‌صورت PDF (A4)</span>
              </button>

              <button
                onClick={() => handleDownloadWord(activeView === 'teacher' ? 'teacher' : 'student')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="دانلود مستقیم فایل قابل ویرایش در نرم‌افزار Microsoft Word"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>دانلود فایل Word (.doc)</span>
              </button>

              <button
                onClick={() => handleOpenPreview(activeView === 'teacher' ? 'teacher' : 'student')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="مشاهده پیش‌نمایش ابعاد برگه A4 قبل از چاپ"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                <span>پیش‌نمایش A4</span>
              </button>

              <button
                onClick={() => handleCopy(activeView === 'teacher' ? 'teacher' : 'student')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedType ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copiedType ? 'کپی شد!' : `کپی متن ${activeView === 'teacher' ? 'پاسخنامه' : 'سؤالات'}`}
                </span>
              </button>

              <button
                onClick={() => handleDownload(activeView === 'teacher' ? 'teacher' : 'student')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>دانلود متن (.txt)</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: STUDENT EXAM PAPER */}
          {activeView === 'student' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 print-card">
              {/* Exam Header */}
              <div className="border-2 border-slate-800 rounded-2xl p-4 sm:p-5 text-center space-y-3">
                <div className="text-xs text-slate-600 font-bold">بسمه تعالی</div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {result.examHeader.title} - درس {result.examHeader.subject}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-t border-slate-200 pt-3 text-right">
                  <div>
                    <span className="text-slate-500">نام و نام خانوادگی:</span> ....................
                  </div>
                  <div>
                    <span className="text-slate-500">پایه تحصیلی:</span> {result.examHeader.grade}
                  </div>
                  <div>
                    <span className="text-slate-500">مدت آزمون:</span> {result.examHeader.timeMinutes}
                  </div>
                  <div>
                    <span className="text-slate-500">بارم کل:</span> {result.examHeader.totalScore} نمره
                  </div>
                </div>
              </div>

              {/* Section 1: Multiple Choice */}
              {result.multipleChoice.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-between font-bold text-sm text-slate-800">
                    <span>بخش اول: سؤالات چهارگزینه‌ای (گزینه درست را انتخاب کنید)</span>
                  </div>
                  <div className="space-y-4 pr-2">
                    {result.multipleChoice.map((q, idx) => (
                      <div key={q.id} className="space-y-2 border-b border-slate-100 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            <span className="font-bold text-blue-700 ml-1">{idx + 1}.</span>
                            {q.question}
                          </p>
                          <span className="text-xs text-slate-400 font-medium shrink-0">
                            ({q.score} نمره)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4 text-xs text-slate-700">
                          {q.options.map((opt, optIdx) => {
                            const letters = ['الف', 'ب', 'ج', 'د'];
                            return (
                              <div
                                key={optIdx}
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                              >
                                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center shrink-0">
                                  {letters[optIdx]}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: True / False */}
              {result.trueFalse.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-between font-bold text-sm text-slate-800">
                    <span>بخش دوم: سؤالات صحیح / غلط (درستی یا نادرستی هر جمله را مشخص کنید)</span>
                  </div>
                  <div className="space-y-3 pr-2">
                    {result.trueFalse.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-700">{idx + 1}.</span>
                          <span>{q.statement}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                          <span className="px-3 py-1 rounded-md border border-slate-300">
                            صحیح [ &nbsp; ]
                          </span>
                          <span className="px-3 py-1 rounded-md border border-slate-300">
                            غلط [ &nbsp; ]
                          </span>
                          <span className="text-slate-400">({q.score} نمره)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Descriptive */}
              {result.descriptive.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-between font-bold text-sm text-slate-800">
                    <span>بخش سوم: سؤالات تشریحی و کوتاه پاسخ</span>
                  </div>
                  <div className="space-y-6 pr-2">
                    {result.descriptive.map((q, idx) => (
                      <div key={q.id} className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            <span className="font-bold text-blue-700 ml-1">{idx + 1}.</span>
                            {q.question}
                          </p>
                          <span className="text-xs text-slate-400 font-medium shrink-0">
                            ({q.score} نمره)
                          </span>
                        </div>
                        {/* Blank lines for student answering */}
                        <div className="space-y-2 pt-1 pr-4">
                          <div className="border-b border-dashed border-slate-300 h-6"></div>
                          <div className="border-b border-dashed border-slate-300 h-6"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center pt-6 border-t border-slate-200 text-xs text-slate-400">
                با آرزوی موفقیت و سربلندی برای شما عزیزان • معلم‌یار هوشمند
              </div>
            </div>
          )}

          {/* VIEW 2: TEACHER ANSWER KEY */}
          {activeView === 'teacher' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 print-card">
              <div className="border-b-2 border-amber-500 pb-4 text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
                  <Key className="w-3.5 h-3.5" />
                  محرمانه - ویژه آموزگار و مصحح
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  کلید تصحیح و پاسخنامه تشریحی آزمون {result.examHeader.subject}
                </h2>
                <p className="text-xs text-slate-500">
                  پایه: {result.examHeader.grade} | مبحث: {result.examHeader.topic} | بارم کل:{' '}
                  {result.examHeader.totalScore} نمره
                </p>
              </div>

              {/* MC Answers */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-r-4 border-blue-600 pr-3">
                  پاسخنامه سؤالات تستی:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.multipleChoice.map((q, idx) => {
                    const letters = ['الف', 'ب', 'ج', 'د'];
                    return (
                      <div
                        key={q.id}
                        className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                          <span>
                            سؤال {idx + 1}: گزینه ({letters[q.correctOptionIndex]})
                          </span>
                          <span className="text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full text-xs">
                            بارم: {q.score} نمره
                          </span>
                        </div>
                        <div className="text-slate-700 font-medium">
                          متن گزینه صحیح: «{q.options[q.correctOptionIndex]}»
                        </div>
                        <div className="text-slate-500 pt-1 leading-relaxed">
                          <strong>توضیح مفهومی:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* True/False Answers */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-r-4 border-emerald-600 pr-3">
                  پاسخنامه سؤالات صحیح / غلط:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.trueFalse.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                        <span className="flex items-center gap-1.5">
                          {q.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          سؤال {idx + 1}: [{q.isCorrect ? 'صحیح' : 'غلط'}]
                        </span>
                        <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                          بارم: {q.score} نمره
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <strong>دلیل و نکته کتاب:</strong> {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptive Answers */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-r-4 border-indigo-600 pr-3">
                  پاسخنامه سؤالات تشریحی و راهنمای بارم‌بندی:
                </h3>
                <div className="space-y-3">
                  {result.descriptive.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                        <span>سؤال {idx + 1}: {q.question}</span>
                        <span className="text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full text-xs">
                          بارم: {q.score} نمره
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-slate-800">
                        <span className="font-bold text-emerald-700 block">پاسخ کامل مورد انتظار:</span>
                        <p className="leading-relaxed">{q.answer}</p>
                      </div>
                      <div className="text-slate-500">
                        <strong>نحوه بارم‌بندی و کلید تصحیح:</strong> {q.scoringGuide}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.examSummary && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
                  <strong>خلاصه بارم‌بندی و اهداف آزمون:</strong> {result.examSummary}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: UNIFIED VIEW */}
          {activeView === 'unified' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-xl font-black text-slate-900">نمای یکپارچه سؤالات و پاسخ‌ها</h2>
                <p className="text-xs text-slate-500 mt-1">مشاهده همزمان صورت سؤال و کلید پاسخ</p>
              </div>

              <div className="space-y-6">
                {result.multipleChoice.map((q, idx) => (
                  <div key={q.id} className="border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-800 text-sm">
                        {idx + 1}. {q.question}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                        تستی ({q.score} نمره)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            oIdx === q.correctOptionIndex
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {opt} {oIdx === q.correctOptionIndex && '✓ (پاسخ صحیح)'}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                      {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* A4 Print and PDF Preview Modal */}
      <PrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewTitle}
        htmlContent={previewHtml}
        documentTypeLabel={docLabel}
      />
    </div>
  );
};
