import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LessonPlanGenerator } from './components/LessonPlanGenerator';
import { ExamGenerator } from './components/ExamGenerator';
import { LessonSummarizer } from './components/LessonSummarizer';
import { CostAndSecurityModal } from './components/CostAndSecurityModal';
import { HistoryModal } from './components/HistoryModal';
import { HistoryItem, LessonPlanData, ExamData, SummaryData } from './types';
import {
  BookOpen,
  FileCheck,
  Lightbulb,
  Sparkles,
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';

const STORAGE_KEY = 'moallemyar_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'lesson-plan' | 'exam' | 'summary'>('lesson-plan');
  const [isCostSecurityOpen, setIsCostSecurityOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Restored items to pass into components
  const [restoredLessonPlan, setRestoredLessonPlan] = useState<LessonPlanData | null>(null);
  const [restoredExam, setRestoredExam] = useState<ExamData | null>(null);
  const [restoredSummary, setRestoredSummary] = useState<SummaryData | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage');
    }
  }, []);

  // Save history helper
  const saveToHistory = (type: HistoryItem['type'], title: string, data: any) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type,
      title,
      createdAt: new Date().toISOString(),
      data,
    };

    setHistoryItems((prev) => {
      const updated = [newItem, ...prev.slice(0, 29)]; // keep last 30
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history to localStorage');
      }
      return updated;
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.type === 'lesson-plan') {
      setActiveTab('lesson-plan');
      setRestoredLessonPlan(item.data as LessonPlanData);
    } else if (item.type === 'exam') {
      setActiveTab('exam');
      setRestoredExam(item.data as ExamData);
    } else if (item.type === 'summary') {
      setActiveTab('summary');
      setRestoredSummary(item.data as SummaryData);
    }
  };

  const handleClearAllHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" dir="rtl">
      {/* Top Navbar */}
      <Header
        onOpenCostSecurity={() => setIsCostSecurityOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-b border-slate-200/60 pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>سامانه دستیار هوشمند تدریس و ارزشیابی برای معلمان</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            تدریس هوشمندانه‌تر، صرفه‌جویی در زمان، <br className="hidden sm:inline" />
            با سامانه <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">«معلم‌یار هوشمند»</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ابزار اختصاصی معلمان فارسی‌زبان برای نگارش دقیق طرح درس‌های روزانه، طراحی سؤالات استاندارد امتحانی به همراه پاسخنامه تشریحی، و ساده‌سازی مفاهیم کتاب برای دانش‌آموزان.
          </p>

          {/* Quick feature tags */}
          <div className="pt-2 flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>مطابق استانداردهای آموزش و پرورش</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>امنیت کامل و پردازش سمت سرور</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>پشتیبانی کامل از چاپ و کپی سریع</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap no-print">
          <button
            onClick={() => setActiveTab('lesson-plan')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'lesson-plan'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>۱. طرح درس روزانه</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>۲. طراحی سؤال امتحانی و کلید</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>۳. خلاصه‌ساز درس برای دانش‌آموز</span>
          </button>
        </div>

        {/* Tab 1: Lesson Plan */}
        {activeTab === 'lesson-plan' && (
          <LessonPlanGenerator
            initialData={restoredLessonPlan}
            onSaveToHistory={(data) =>
              saveToHistory(
                'lesson-plan',
                `طرح درس: ${data.meta.subject} - ${data.meta.topic} (${data.meta.grade})`,
                data
              )
            }
          />
        )}

        {/* Tab 2: Exam Generator */}
        {activeTab === 'exam' && (
          <ExamGenerator
            initialData={restoredExam}
            onSaveToHistory={(data) =>
              saveToHistory(
                'exam',
                `آزمون: ${data.examHeader.subject} - ${data.examHeader.topic} (${data.examHeader.grade})`,
                data
              )
            }
          />
        )}

        {/* Tab 3: Lesson Summarizer */}
        {activeTab === 'summary' && (
          <LessonSummarizer
            initialData={restoredSummary}
            onSaveToHistory={(data) =>
              saveToHistory('summary', `خلاصه درس: ${data.title}`, data)
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
          <span>«معلم‌یار هوشمند»</span>
          <span>•</span>
          <span>دستیار هوشمند و همراه همیشگی معلمان دلسوز ایران اسلامی</span>
        </div>
        <p className="text-slate-400">
          طراحی شده بر مبنای آخرین الگوهای یاددهی-یادگیری آموزش و پرورش و پردازش امن با هوش مصنوعی گوگل
        </p>
      </footer>

      {/* Modals */}
      <CostAndSecurityModal
        isOpen={isCostSecurityOpen}
        onClose={() => setIsCostSecurityOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelect={handleSelectHistoryItem}
        onClearAll={handleClearAllHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />
    </div>
  );
}
