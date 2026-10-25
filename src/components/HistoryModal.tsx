import React from 'react';
import { HistoryItem, LessonPlanData, ExamData, SummaryData } from '../types';
import { History, Trash2, X, ArrowUpRight, BookOpen, FileCheck, Lightbulb, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClearAll: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClearAll,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  const getTypeBadge = (type: HistoryItem['type']) => {
    switch (type) {
      case 'lesson-plan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <BookOpen className="w-3 h-3" />
            طرح درس
          </span>
        );
      case 'exam':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <FileCheck className="w-3 h-3" />
            آزمون و پاسخنامه
          </span>
        );
      case 'summary':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Lightbulb className="w-3 h-3" />
            خلاصه درس
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <History className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">تاریخچه تولیدات اخیر</h2>
              <p className="text-slate-300 text-xs mt-0.5">موارد ذخیره شده در حافظه مرورگر شما</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Clock className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm">هنوز هیچ محتوایی تولید یا ذخیره نکرده‌اید.</p>
              <p className="text-xs text-slate-400">با ایجاد هر طرح درس، آزمون یا خلاصه‌سازی، اینجا ذخیره خواهد شد.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30 rounded-xl p-4 transition-all duration-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeBadge(item.type)}
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm truncate">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    <span>مشاهده و بازیابی</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف این مورد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              تعداد موارد ذخیره شده: {items.length}
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              پاکسازی تمام تاریخچه
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
