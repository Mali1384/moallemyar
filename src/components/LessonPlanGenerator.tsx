import React, { useState } from 'react';
import { LessonPlanData } from '../types';
import {
  BookOpen,
  Sparkles,
  Copy,
  Printer,
  Download,
  Check,
  Clock,
  Layers,
  Target,
  Wrench,
  Users,
  Lightbulb,
  FileText,
  RotateCcw,
  Eye,
} from 'lucide-react';
import {
  copyToClipboard,
  downloadTextFile,
  downloadWordDocument,
  formatLessonPlanAsText,
} from '../utils/exportUtils';
import { generateLessonPlanHtml, printIsolatedDocument } from '../utils/printEngine';
import { PrintPreviewModal } from './PrintPreviewModal';
import { ErrorAlert } from './ErrorAlert';

import { ImageUploader, UploadedImageData } from './ImageUploader';

interface Props {
  onSaveToHistory: (plan: LessonPlanData) => void;
  initialData?: LessonPlanData | null;
}

const PRESET_EXAMPLES = [
  {
    grade: 'پایه اول ابتدایی',
    subject: 'قرآن',
    topic: 'آموزش سوره ناس و پیام قرآنی (درستی)',
    duration: '۴۵ دقیقه',
  },
  {
    grade: 'پایه چهارم ابتدایی',
    subject: 'علوم تجربی',
    topic: 'چرخه آب و تشکیل ابر و باران',
    duration: '۴۵ دقیقه',
  },
  {
    grade: 'پایه ششم ابتدایی',
    subject: 'ریاضی',
    topic: 'ضرب و تقسیم کسرها با رسم شکل',
    duration: '۴۵ دقیقه',
  },
  {
    grade: 'پایه هفتم (متوسطه اول)',
    subject: 'فارسی',
    topic: 'تشخیص نهاد و گزاره در جملات فارسی',
    duration: '۶۰ دقیقه',
  },
];

const GRADE_OPTIONS = [
  'پیش‌دبستانی',
  'پایه اول ابتدایی',
  'پایه دوم ابتدایی',
  'پایه سوم ابتدایی',
  'پایه چهارم ابتدایی',
  'پایه پنجم ابتدایی',
  'پایه ششم ابتدایی',
  'پایه هفتم (متوسطه اول)',
  'پایه هشتم (متوسطه اول)',
  'پایه نهم (متوسطه اول)',
  'پایه دهم (متوسطه دوم)',
  'پایه یازدهم (متوسطه دوم)',
  'پایه دوازدهم (متوسطه دوم)',
];

const COMMON_SUBJECTS = [
  'ریاضی',
  'علوم تجربی',
  'فارسی و نگارش',
  'مطالعات اجتماعی',
  'پیام‌های آسمان / هدیه‌های آسمان',
  'قرآن',
  'عربی',
  'زبان انگلیسی',
  'فیزیک',
  'شیمی',
  'زیست‌شناسی',
  'هندسه',
  'تاریخ و جغرافیا',
];

export const LessonPlanGenerator: React.FC<Props> = ({ onSaveToHistory, initialData }) => {
  const [grade, setGrade] = useState('پایه چهارم ابتدایی');
  const [subject, setSubject] = useState('علوم تجربی');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('۴۵ دقیقه');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [attachedImage, setAttachedImage] = useState<UploadedImageData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LessonPlanData | null>(initialData || null);
  const [copied, setCopied] = useState(false);

  // Sync if initialData changes from history
  React.useEffect(() => {
    if (initialData) {
      setResult(initialData);
      setGrade(initialData.meta.grade);
      setSubject(initialData.meta.subject);
      setTopic(initialData.meta.topic);
      setDuration(initialData.meta.duration);
    }
  }, [initialData]);

  const applyPreset = (preset: (typeof PRESET_EXAMPLES)[0]) => {
    setGrade(preset.grade);
    setSubject(preset.subject);
    setTopic(preset.topic);
    setDuration(preset.duration);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() && !attachedImage) {
      setError('لطفاً موضوع درس را وارد کنید یا تصویر صفحه کتاب را بارگذاری نمایید.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subject,
          topic,
          duration,
          specialRequirements,
          image: attachedImage
            ? {
                data: attachedImage.data,
                mimeType: attachedImage.mimeType,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'خطا در برقراری ارتباط با سرور.');
      }

      setResult(data.data);
      onSaveToHistory(data.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'خطایی در تولید طرح درس رخ داد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره امتحان کنید.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = formatLessonPlanAsText(result);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const text = formatLessonPlanAsText(result);
    const filename = `طرح_درس_${result.meta.subject}_${result.meta.topic}.txt`.replace(/\s+/g, '_');
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
      const html = generateLessonPlanHtml(result);
      await printIsolatedDocument(html);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطا در باز شدن پنجره چاپ مرورگر. لطفاً مجدداً امتحان کنید.');
    }
  };

  const handleDownloadWord = () => {
    if (!result) return;
    try {
      const html = generateLessonPlanHtml(result);
      const filename = `طرح_درس_${result.meta.subject}_${result.meta.topic}.doc`.replace(/\s+/g, '_');
      const title = `طرح درس روزانه: ${result.meta.subject} - ${result.meta.topic}`;
      downloadWordDocument(filename, title, html);
    } catch (err: any) {
      console.error(err);
      setError('خطا در دانلود فایل Word. لطفاً دوباره تلاش نمایید.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 no-print">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">تولید طرح درس روزانه استاندارد</h2>
              <p className="text-xs text-slate-500">
                بر اساس سرفصل‌ها و اهداف مصوب آموزش و پرورش با زمان‌بندی دقیق
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 ml-1">نمونه‌های آماده:</span>
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(ex)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                {ex.subject} ({ex.grade.split(' ')[1] || ex.grade})
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Image Uploader for Lesson Content / Textbook Page */}
          <ImageUploader
            image={attachedImage}
            onChange={setAttachedImage}
            onExtractText={(extracted) => {
              setTopic((prev) => (prev ? `${prev} - بر مبنای: ${extracted.slice(0, 50)}...` : extracted.slice(0, 100)));
              setSpecialRequirements((prev) => 
                prev ? `${prev}\nنکته: بر اساس محتوای تصویر پیوست شده تدوین شود.` : 'بر اساس محتوای تصویر پیوست شده تدوین شود.'
              );
            }}
            label="بارگذاری عکس صفحه کتاب درسی (اختیاری)"
            hint="با انتخاب عکس، طرح درس دقیقاً بر اساس محتوای همان صفحه کتاب طراحی می‌شود"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Grade Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                پایه تحصیلی: <span className="text-rose-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection / Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نام درس: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً علوم تجربی، ریاضی..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مدت زمان کلاس:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
              >
                <option value="۴۵ دقیقه">۴۵ دقیقه (استاندارد ابتدایی)</option>
                <option value="۶۰ دقیقه">۶۰ دقیقه</option>
                <option value="۸۰ دقیقه">۸۰ دقیقه (دو زنگ پشت سر هم)</option>
                <option value="۹۰ دقیقه">۹۰ دقیقه (متوسطه)</option>
              </select>
            </div>

            {/* Quick Subjects Suggestions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                انتخاب سریع درس:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) setSubject(e.target.value);
                }}
                defaultValue=""
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all text-slate-600"
              >
                <option value="" disabled>
                  فهرست دروس رایج...
                </option>
                {COMMON_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              موضوع درس / مبحث این جلسه: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: چرخه آب و نحوه تشکیل ابرها، یا مساحت دایره و عدد پی..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
              required
            />
          </div>

          {/* Optional Special Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              توضیحات و نیازمندی‌های ویژه معلم (اختیاری):
            </label>
            <input
              type="text"
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="مثال: تأکید بر انجام آزمایش کلاسی، استفاده از روش ۵E، یا حضور دانش‌آموزان با نیازهای ویژه"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Error Alert */}
          <ErrorAlert error={error} onRetry={handleGenerate} onDismiss={() => setError(null)} />

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>در حال نگارش طرح درس با هوش مصنوعی...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>تولید هوشمند طرح درس روزانه</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Result Display */}
      {result && (
        <div id="lesson-plan-print-area" className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3 no-print shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-bold text-slate-800">طرح درس روزانه آماده شد</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleInstantPrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="باز کردن پنجره چاپ مرورگر جهت چاپ مستقیم یا ذخیره به صورت PDF استاندارد A4"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ / ذخیره به‌صورت PDF (A4)</span>
              </button>

              <button
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="دانلود مستقیم طرح درس با فرمت Word (.doc) قابل ویرایش"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
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

          {/* Main Plan Sheet */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 print-card">
            {/* Header Banner */}
            <div className="border-b-2 border-emerald-500 pb-6 text-center space-y-2">
              <div className="text-xs text-slate-500 font-semibold">جمهوری اسلامی ایران - وزارت آموزش و پرورش</div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{result.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">پایه تحصیلی</span>
                  <span className="font-bold text-slate-800">{result.meta.grade}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">نام درس</span>
                  <span className="font-bold text-slate-800">{result.meta.subject}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">موضوع درس</span>
                  <span className="font-bold text-slate-800">{result.meta.topic}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">مدت جلسه</span>
                  <span className="font-bold text-slate-800">{result.meta.duration}</span>
                </div>
              </div>
            </div>

            {/* General Goals */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3>اهداف کلی جلسه</h3>
              </div>
              <ul className="space-y-1.5 pr-6 list-disc text-sm text-slate-700 leading-relaxed">
                {result.generalGoals.map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </ul>
            </div>

            {/* Behavioral Objectives (Cognitive, Affective, Psychomotor) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3>اهداف رفتاری (تفکیک حیطه یادگیری)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    حیطه شناختی (دانشی)
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 pr-4 list-disc">
                    {result.behavioralGoals.cognitive.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-sky-900 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    حیطه عاطفی (نگرشی)
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 pr-4 list-disc">
                    {result.behavioralGoals.affective.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    حیطه مهارتی (روانی - حرکتی)
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 pr-4 list-disc">
                    {result.behavioralGoals.psychomotor.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Prerequisites & Teaching Aids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-slate-800 block text-sm">پیش‌نیازها و پیش‌دانسته‌ها:</span>
                <ul className="text-slate-600 space-y-1 pr-4 list-disc">
                  {result.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-slate-800 block text-sm">الگوها و روش‌های تدریس:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.teachingMethods.map((m, i) => (
                    <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium text-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-slate-800 block text-sm">رسانه‌ها و ابزار آموزشی:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.teachingAids.map((aid, i) => (
                    <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium text-slate-700">
                      {aid}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 6-Phase Step by Step Teaching Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3>مراحل گام‌به‌گام اجرای تدریس و زمان‌بندی</h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">مرحله</th>
                      <th className="py-3 px-3 w-36">عنوان مرحله</th>
                      <th className="py-3 px-2 w-24 text-center">زمان</th>
                      <th className="py-3 px-4">فعالیت‌های معلم</th>
                      <th className="py-3 px-4">فعالیت‌های دانش‌آموز</th>
                      <th className="py-3 px-3 w-36">ارزشیابی این مرحله</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.phases.map((phase) => (
                      <tr key={phase.step} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                          {phase.step}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{phase.name}</td>
                        <td className="py-3 px-2 text-center text-slate-500 whitespace-nowrap">
                          {phase.allocatedTime}
                        </td>
                        <td className="py-3 px-4 text-slate-700 leading-relaxed">{phase.teacherAction}</td>
                        <td className="py-3 px-4 text-slate-700 leading-relaxed">{phase.studentAction}</td>
                        <td className="py-3 px-3 text-slate-600 bg-slate-50/50">{phase.evaluation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Differentiated Homework */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3>تعیین تکلیف متناسب با تفاوت‌های فردی</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="border border-rose-100 bg-rose-50/40 p-4 rounded-2xl space-y-1.5">
                  <span className="font-bold text-rose-800 block text-sm">تکلیف جبرانی (تقویتی):</span>
                  <p className="text-slate-700 leading-relaxed">{result.differentiatedAssignments.remedial}</p>
                </div>
                <div className="border border-blue-100 bg-blue-50/40 p-4 rounded-2xl space-y-1.5">
                  <span className="font-bold text-blue-800 block text-sm">تکلیف عمومی (تثبیتی):</span>
                  <p className="text-slate-700 leading-relaxed">{result.differentiatedAssignments.standard}</p>
                </div>
                <div className="border border-emerald-100 bg-emerald-50/40 p-4 rounded-2xl space-y-1.5">
                  <span className="font-bold text-emerald-800 block text-sm">تکلیف بسطی (خلاقانه):</span>
                  <p className="text-slate-700 leading-relaxed">{result.differentiatedAssignments.enrichment}</p>
                </div>
              </div>
            </div>

            {/* Classroom Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed text-amber-950">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm mb-1 text-amber-900">
                  توصیه معلم‌یار هوشمند برای مدیریت کلاس و یادگیری بهتر:
                </strong>
                <p>{result.classroomTips}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A4 Print and PDF Preview Modal */}
      {result && (
        <PrintPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`طرح درس: ${result.meta.subject} - ${result.meta.topic}`}
          htmlContent={generateLessonPlanHtml(result)}
          documentTypeLabel="طرح درس روزانه استاندارد (A4)"
        />
      )}
    </div>
  );
};
