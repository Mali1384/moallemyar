import { LessonPlanData, ExamData, SummaryData } from '../types';

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch (e) {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}

export function downloadTextFile(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function downloadWordDocument(filename: string, title: string, bodyHtml: string) {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body {
          font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          font-size: 11pt;
          line-height: 1.6;
          color: #000000;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          direction: rtl;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        th, td {
          border: 1px solid #666666;
          padding: 6px 8px;
          text-align: right;
          vertical-align: top;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
        }
        .exam-header-box {
          border: 2px solid #000000;
          padding: 10px;
          margin-bottom: 15px;
        }
        .section-title {
          background-color: #f1f5f9;
          font-weight: bold;
          padding: 6px 10px;
          margin-top: 14px;
          margin-bottom: 8px;
          border-right: 4px solid #2563eb;
        }
        .question-item {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #cccccc;
        }
        .options-grid {
          margin-right: 18px;
          margin-top: 6px;
        }
        .option-box {
          margin-bottom: 4px;
        }
        .dashed-line {
          border-bottom: 1px dashed #999999;
          height: 24px;
        }
      </style>
    </head>
    <body dir='rtl'>
      ${bodyHtml}
    </body>
    </html>
  `;

  // Prepend UTF-8 BOM so Microsoft Word recognizes Persian characters cleanly without question marks
  const blob = new Blob(['\ufeff' + content], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatLessonPlanAsText(lp: LessonPlanData): string {
  return `بسمه تعالی
طرح درس روزانه - معلم‌یار هوشمند
=========================================
عنوان: ${lp.title}
پایه: ${lp.meta.grade} | درس: ${lp.meta.subject} | موضوع: ${lp.meta.topic}
مدت کلاس: ${lp.meta.duration}

اهداف کلی:
${lp.generalGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

اهداف رفتاری:
الف) شناختی (دانشی):
${lp.behavioralGoals.cognitive.map((g) => `- ${g}`).join('\n')}

ب) عاطفی (نگرشی):
${lp.behavioralGoals.affective.map((g) => `- ${g}`).join('\n')}

ج) روانی - حرکتی (مهارتی):
${lp.behavioralGoals.psychomotor.map((g) => `- ${g}`).join('\n')}

پیش‌نیازها و دانسته‌های پیشین:
${lp.prerequisites.map((p) => `- ${p}`).join('\n')}

روش‌های تدریس:
${lp.teachingMethods.join(' ، ')}

رسانه‌ها و ابزار آموزشی:
${lp.teachingAids.join(' ، ')}

مراحل اجرای تدریس:
${lp.phases
  .map(
    (p) =>
      `-----------------------------------------
مرحله ${p.step}: ${p.name} (زمان تقریبی: ${p.allocatedTime})
فعالیت معلم: ${p.teacherAction}
فعالیت دانش‌آموز: ${p.studentAction}
ارزشیابی این مرحله: ${p.evaluation}`
  )
  .join('\n')}

تکالیف متناسب با تفاوت‌های فردی:
- تکلیف جبرانی و تقویتی: ${lp.differentiatedAssignments.remedial}
- تکلیف عمومی و تثبیتی: ${lp.differentiatedAssignments.standard}
- تکلیف خلاقانه و بسطی: ${lp.differentiatedAssignments.enrichment}

نکات و توصیه‌های مدیریت کلاس:
${lp.classroomTips}

تولید شده توسط «معلم‌یار هوشمند»
`;
}

export function formatStudentExamAsText(exam: ExamData): string {
  let text = `بسمه تعالی
برگه سؤالات آزمون کلاسی
نام و نام خانوادگی: ....................    نام درس: ${exam.examHeader.subject}    پایه: ${exam.examHeader.grade}
موضوع آزمون: ${exam.examHeader.topic}    مدت آزمون: ${exam.examHeader.timeMinutes}    بارم کل: ${exam.examHeader.totalScore} نمره
==================================================================

بخش اول: سؤالات چهارگزینه‌ای (تستی)
`;

  exam.multipleChoice.forEach((q, idx) => {
    text += `\n${idx + 1}. ${q.question} (${q.score} نمره)\n`;
    const letters = ['الف', 'ب', 'ج', 'د'];
    q.options.forEach((opt, optIdx) => {
      text += `   ${letters[optIdx]}) ${opt}\n`;
    });
  });

  text += `\n==================================================================\nبخش دوم: سؤالات صحیح یا غلط (درستی یا نادرستی هر عبارت را با ص / غ مشخص کنید)\n`;
  exam.trueFalse.forEach((q, idx) => {
    text += `\n${idx + 1}. [   ] ${q.statement} (${q.score} نمره)\n`;
  });

  text += `\n==================================================================\nبخش سوم: سؤالات تشریحی و کوتاه پاسخ\n`;
  exam.descriptive.forEach((q, idx) => {
    text += `\n${idx + 1}. ${q.question} (${q.score} نمره)\n\n\n`;
  });

  text += `\nبا آرزوی موفقیت و سر بلندی - معلم‌یار هوشمند\n`;
  return text;
}

export function formatTeacherKeyAsText(exam: ExamData): string {
  let text = `کلید و پاسخنامه تشریحی آزمون - ویژه معلم
نام درس: ${exam.examHeader.subject} | پایه: ${exam.examHeader.grade} | موضوع: ${exam.examHeader.topic}
بارم کل: ${exam.examHeader.totalScore} نمره
==================================================================

کلید بخش اول: سؤالات تستی
`;

  const letters = ['الف', 'ب', 'ج', 'د'];
  exam.multipleChoice.forEach((q, idx) => {
    text += `${idx + 1}. گزینه (${letters[q.correctOptionIndex]}) -> ${q.options[q.correctOptionIndex]}\n   توضیح: ${q.explanation} [بارم: ${q.score}]\n\n`;
  });

  text += `------------------------------------------------------------------\nکلید بخش دوم: سؤالات صحیح یا غلط\n`;
  exam.trueFalse.forEach((q, idx) => {
    text += `${idx + 1}. [${q.isCorrect ? 'صحیح' : 'غلط'}] -> توضیح: ${q.explanation} [بارم: ${q.score}]\n\n`;
  });

  text += `------------------------------------------------------------------\nکلید بخش سوم: سؤالات تشریحی\n`;
  exam.descriptive.forEach((q, idx) => {
    text += `${idx + 1}. پاسخ مورد انتظار:\n   ${q.answer}\n   راهنمای تصحیح: ${q.scoringGuide} [بارم: ${q.score}]\n\n`;
  });

  if (exam.examSummary) {
    text += `خلاصه و اهداف آزمون:\n${exam.examSummary}\n`;
  }

  text += `\nمعلم‌یار هوشمند - دستیار تدریس معلمان\n`;
  return text;
}

export function formatSummaryAsText(sum: SummaryData): string {
  return `خلاصه درس: ${sum.title}
تهیه شده در سامانه «معلم‌یار هوشمند»
=========================================

متن خلاصه درس به زبان ساده:
${sum.summary}

-----------------------------------------
نکات طلایی و کلیدی درس:
${sum.keyHighlights.map((k, i) => `${i + 1}. ${k}`).join('\n')}

-----------------------------------------
واژه‌نامه واژگان مهم:
${sum.vocabulary.map((v) => `• ${v.word}: ${v.simplifiedMeaning}`).join('\n')}

-----------------------------------------
مثال ملموس در دنیای واقعی:
${sum.realWorldExample}

-----------------------------------------
سؤالات خودسنجی درک مطلب:
${sum.comprehensionQuiz
  .map((q, i) => `سؤال ${i + 1}: ${q.question}\nپاسخ: ${q.answer}\n`)
  .join('\n')}
`;
}
