import { ExamData, LessonPlanData, SummaryData } from '../types';

/**
 * Common A4 CSS styles for Persian documents with Vazirmatn font
 */
const COMMON_A4_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');

  @page {
    size: A4 portrait;
    margin: 14mm 12mm 14mm 12mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    background-color: #ffffff !important;
    color: #111827 !important;
    font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    direction: rtl !important;
    text-align: right !important;
    font-size: 11pt;
    line-height: 1.6;
  }

  .a4-page {
    width: 100%;
    margin: 0 auto;
    background: #fff;
  }

  /* Header Box */
  .exam-header-box {
    border: 2px solid #1e293b;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .header-grid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  .header-col-right, .header-col-left {
    width: 32%;
    font-size: 9.5pt;
    line-height: 1.6;
  }

  .header-col-center {
    width: 36%;
    text-align: center;
  }

  .header-meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 9.5pt;
    font-weight: 500;
  }

  /* Section styling */
  .section-title {
    background-color: #f1f5f9 !important;
    border: 1px solid #cbd5e1;
    border-right: 4px solid #2563eb;
    padding: 6px 10px;
    font-size: 10.5pt;
    font-weight: 700;
    margin-top: 14px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    page-break-after: avoid;
    break-after: avoid;
  }

  .question-item {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e2e8f0;
  }

  .question-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;
  }

  .question-text {
    font-size: 10.5pt;
    font-weight: 600;
    color: #0f172a;
    flex: 1;
  }

  .question-score {
    font-size: 9pt;
    font-weight: 600;
    color: #475569;
    white-space: nowrap;
    padding: 2px 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }

  /* Multiple choice options */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-right: 18px;
    margin-top: 6px;
  }

  .option-box {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10pt;
    color: #334155;
  }

  .option-label {
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 18px;
    border: 1px solid #94a3b8;
    border-radius: 50%;
    text-align: center;
    font-size: 8.5pt;
    font-weight: bold;
    color: #1e293b;
    background: #f8fafc;
  }

  /* True / false statement */
  .tf-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    border-radius: 6px;
    background: #fafafa;
    border: 1px solid #f1f5f9;
  }

  .tf-boxes {
    display: flex;
    gap: 16px;
    font-size: 9.5pt;
    font-weight: 600;
    white-space: nowrap;
  }

  .checkbox-square {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1.5px solid #64748b;
    border-radius: 3px;
    vertical-align: middle;
    margin-right: 4px;
  }

  /* Descriptive answer writing lines */
  .answer-writing-lines {
    margin-top: 8px;
    margin-right: 18px;
  }

  .dashed-line {
    border-bottom: 1px dashed #cbd5e1;
    height: 24px;
    width: 100%;
  }

  /* Footer */
  .exam-footer {
    text-align: center;
    font-size: 9pt;
    color: #64748b;
    border-top: 1px solid #cbd5e1;
    padding-top: 10px;
    margin-top: 20px;
    page-break-before: auto;
  }

  /* Lesson Plan Table */
  table.lesson-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 9.5pt;
  }

  table.lesson-table th, table.lesson-table td {
    border: 1px solid #94a3b8;
    padding: 6px 8px;
    text-align: right;
    vertical-align: top;
  }

  table.lesson-table th {
    background-color: #f1f5f9 !important;
    font-weight: bold;
    color: #0f172a;
  }

  .badge-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 8.5pt;
    font-weight: 600;
  }

  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-amber { background: #fef3c7; color: #92400e; }
`;

/**
 * Generate HTML string for Student Exam Paper
 */
export function generateStudentExamHtml(exam: ExamData): string {
  const letters = ['الف', 'ب', 'ج', 'د'];

  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>برگه سؤالات ${exam.examHeader.subject} - ${exam.examHeader.topic}</title>
  <style>${COMMON_A4_STYLES}</style>
</head>
<body>
  <div class="a4-page">
    <!-- Exam Official Header -->
    <div class="exam-header-box">
      <div class="header-grid">
        <div class="header-col-right">
          <div>جمهوری اسلامی ایران</div>
          <div>وزارت آموزش و پرورش</div>
          <div>نام آموزشگاه: ....................</div>
        </div>
        <div class="header-col-center">
          <div style="font-size: 13pt; font-weight: 900; color: #0f172a; margin-bottom: 2px;">
            ${exam.examHeader.title || 'آزمون سنجش کلاسی'}
          </div>
          <div style="font-size: 11pt; font-weight: 700; color: #1e3a8a;">
            درس: ${exam.examHeader.subject}
          </div>
          <div style="font-size: 9.5pt; color: #475569;">
            مبحث: ${exam.examHeader.topic}
          </div>
        </div>
        <div class="header-col-left">
          <div>نام و نام خانوادگی: ....................</div>
          <div>نام پدر: ....................</div>
          <div>پایه تحصیلی: ${exam.examHeader.grade}</div>
        </div>
      </div>
      <div class="header-meta-row">
        <div><strong>مدت آزمون:</strong> ${exam.examHeader.timeMinutes}</div>
        <div><strong>تاریخ آزمون:</strong> .... / .... / ۱۴۰</div>
        <div><strong>شماره داوطلب:</strong> ....................</div>
        <div><strong>نمره به عدد و حروف:</strong> ....................</div>
      </div>
    </div>

    <!-- Section 1: Multiple Choice -->
    ${
      exam.multipleChoice.length > 0
        ? `
      <div class="section-title">
        <span>بخش اول: سؤالات چهارگزینه‌ای (تستی) - پاسخ صحیح را مشخص کنید.</span>
      </div>
      ${exam.multipleChoice
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-title-row">
            <div class="question-text">
              <span>${idx + 1}. </span>
              <span>${q.question}</span>
            </div>
            <div class="question-score">${q.score} نمره</div>
          </div>
          <div class="options-grid">
            ${q.options
              .map(
                (opt, optIdx) => `
              <div class="option-box">
                <span class="option-label">${letters[optIdx]}</span>
                <span>${opt}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    <!-- Section 2: True / False -->
    ${
      exam.trueFalse.length > 0
        ? `
      <div class="section-title">
        <span>بخش دوم: سؤالات صحیح / غلط - درستی یا نادرستی هر عبارت را تعیین نمایید.</span>
      </div>
      ${exam.trueFalse
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="tf-row">
            <div class="question-text" style="font-size: 10pt;">
              <span>${idx + 1}. </span>
              <span>${q.statement}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="tf-boxes">
                <span>صحیح <span class="checkbox-square"></span></span>
                <span>غلط <span class="checkbox-square"></span></span>
              </div>
              <div class="question-score">${q.score} نمره</div>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    <!-- Section 3: Descriptive -->
    ${
      exam.descriptive.length > 0
        ? `
      <div class="section-title">
        <span>بخش سوم: سؤالات تشریحی و کوتاه پاسخ</span>
      </div>
      ${exam.descriptive
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-title-row">
            <div class="question-text">
              <span>${idx + 1}. </span>
              <span>${q.question}</span>
            </div>
            <div class="question-score">${q.score} نمره</div>
          </div>
          <div class="answer-writing-lines">
            <div class="dashed-line"></div>
            <div class="dashed-line"></div>
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    <div class="exam-footer">
      <div>با آرزوی موفقیت و سر بلندی برای شما دانش‌آموز کوشا و عزیز</div>
      <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">طراحی شده با سامانه «معلم‌یار هوشمند»</div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generate HTML string for Teacher Key Sheet
 */
export function generateTeacherKeyHtml(exam: ExamData): string {
  const letters = ['الف', 'ب', 'ج', 'د'];

  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>کلید و پاسخنامه تشریحی ${exam.examHeader.subject} - ${exam.examHeader.topic}</title>
  <style>${COMMON_A4_STYLES}</style>
</head>
<body>
  <div class="a4-page">
    <div class="exam-header-box" style="border-color: #92400e; background-color: #fffbeb;">
      <div style="text-align: center; margin-bottom: 6px;">
        <span class="badge-pill badge-amber">محرمانه - راهنمای تصحیح و پاسخنامه تشریحی معلم</span>
      </div>
      <div style="text-align: center; font-size: 13pt; font-weight: 800; color: #78350f;">
        کلید آزمون ${exam.examHeader.subject} (مبحث: ${exam.examHeader.topic})
      </div>
      <div class="header-meta-row" style="margin-top: 8px; border-top: 1px solid #fde68a; padding-top: 6px;">
        <div><strong>پایه:</strong> ${exam.examHeader.grade}</div>
        <div><strong>بارم کل:</strong> ${exam.examHeader.totalScore} نمره</div>
        <div><strong>مدت:</strong> ${exam.examHeader.timeMinutes}</div>
      </div>
    </div>

    <!-- MC Answers -->
    ${
      exam.multipleChoice.length > 0
        ? `
      <div class="section-title" style="border-right-color: #2563eb;">
        <span>کلید بخش اول: سؤالات تستی (چهارگزینه‌ای)</span>
      </div>
      ${exam.multipleChoice
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-title-row">
            <div class="question-text">
              سؤال ${idx + 1}: <span style="color: #1e40af; font-weight: 800;">گزینه (${letters[q.correctOptionIndex]}) &rarr; ${q.options[q.correctOptionIndex]}</span>
            </div>
            <div class="question-score">${q.score} نمره</div>
          </div>
          <div style="font-size: 9.5pt; color: #475569; margin-top: 4px; background: #f8fafc; padding: 6px 10px; border-radius: 6px;">
            <strong>توضیح مفهومی:</strong> ${q.explanation}
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    <!-- True/False Answers -->
    ${
      exam.trueFalse.length > 0
        ? `
      <div class="section-title" style="border-right-color: #16a34a;">
        <span>کلید بخش دوم: سؤالات صحیح / غلط</span>
      </div>
      ${exam.trueFalse
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-title-row">
            <div class="question-text">
              سؤال ${idx + 1}: <span style="font-weight: 800; color: ${q.isCorrect ? '#166534' : '#991b1b'};">[${q.isCorrect ? 'صحیح' : 'غلط'}]</span>
            </div>
            <div class="question-score">${q.score} نمره</div>
          </div>
          <div style="font-size: 9.5pt; color: #475569; margin-top: 4px; background: #f8fafc; padding: 6px 10px; border-radius: 6px;">
            <strong>نکته و دلیل:</strong> ${q.explanation}
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    <!-- Descriptive Answers -->
    ${
      exam.descriptive.length > 0
        ? `
      <div class="section-title" style="border-right-color: #7c3aed;">
        <span>کلید بخش سوم: سؤالات تشریحی و راهنمای بارم‌بندی</span>
      </div>
      ${exam.descriptive
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-title-row">
            <div class="question-text">سؤال ${idx + 1}: ${q.question}</div>
            <div class="question-score">${q.score} نمره</div>
          </div>
          <div style="font-size: 9.5pt; margin-top: 6px; background: #f8fafc; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-weight: 700; color: #166534; margin-bottom: 2px;">پاسخ کامل مورد انتظار:</div>
            <div style="color: #1e293b; line-height: 1.6;">${q.answer}</div>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; color: #64748b; font-size: 9pt;">
              <strong>راهنمای نمره‌دهی:</strong> ${q.scoringGuide}
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    ${
      exam.examSummary
        ? `
      <div style="margin-top: 14px; padding: 8px 12px; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; font-size: 9pt; color: #713f12;">
        <strong>خلاصه اهداف سنجش در این آزمون:</strong> ${exam.examSummary}
      </div>
    `
        : ''
    }

    <div class="exam-footer">
      <div>سامانه هوشمند «معلم‌یار هوشمند» - دستیار تخصصی معلمان ایران</div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generate HTML string for Daily Lesson Plan Sheet
 */
export function generateLessonPlanHtml(plan: LessonPlanData): string {
  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>طرح درس روزانه: ${plan.meta.subject} - ${plan.meta.topic}</title>
  <style>${COMMON_A4_STYLES}</style>
</head>
<body>
  <div class="a4-page">
    <!-- Header -->
    <div class="exam-header-box" style="border-color: #047857;">
      <div style="text-align: center; font-size: 9pt; color: #64748b; margin-bottom: 2px;">
        جمهوری اسلامی ایران - وزارت آموزش و پرورش
      </div>
      <div style="text-align: center; font-size: 13pt; font-weight: 800; color: #065f46; margin-bottom: 6px;">
        ${plan.title}
      </div>
      <div class="header-meta-row" style="border-top: 1px solid #cbd5e1; padding-top: 8px;">
        <div><strong>پایه تحصیلی:</strong> ${plan.meta.grade}</div>
        <div><strong>نام درس:</strong> ${plan.meta.subject}</div>
        <div><strong>موضوع درس:</strong> ${plan.meta.topic}</div>
        <div><strong>مدت کلاس:</strong> ${plan.meta.duration}</div>
      </div>
    </div>

    <!-- General Goals -->
    <div class="section-title" style="border-right-color: #059669;">
      <span>۱. اهداف کلی جلسه</span>
    </div>
    <ul style="margin: 0; padding-right: 20px; font-size: 10pt; color: #1e293b;">
      ${plan.generalGoals.map((g) => `<li style="margin-bottom: 4px;">${g}</li>`).join('')}
    </ul>

    <!-- Behavioral Goals -->
    <div class="section-title" style="border-right-color: #059669;">
      <span>۲. اهداف رفتاری (تفکیک حیطه‌های سه‌گانه یادگیری)</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 9pt; margin-top: 6px;">
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 8px;">
        <strong style="color: #166534; display: block; margin-bottom: 4px;">حیطه شناختی (دانشی):</strong>
        <ul style="margin: 0; padding-right: 14px;">
          ${plan.behavioralGoals.cognitive.map((c) => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 8px;">
        <strong style="color: #0369a1; display: block; margin-bottom: 4px;">حیطه عاطفی (نگرشی):</strong>
        <ul style="margin: 0; padding-right: 14px;">
          ${plan.behavioralGoals.affective.map((a) => `<li>${a}</li>`).join('')}
        </ul>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 6px 8px;">
        <strong style="color: #b45309; display: block; margin-bottom: 4px;">حیطه روانی-حرکتی (مهارتی):</strong>
        <ul style="margin: 0; padding-right: 14px;">
          ${plan.behavioralGoals.psychomotor.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Prerequisites, Methods, Aids -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; font-size: 9pt;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
        <strong>پیش‌دانسته‌ها:</strong>
        <div>${plan.prerequisites.join(' ، ')}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
        <strong>روش‌های تدریس:</strong>
        <div>${plan.teachingMethods.join(' ، ')}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
        <strong>ابزار و رسانه:</strong>
        <div>${plan.teachingAids.join(' ، ')}</div>
      </div>
    </div>

    <!-- 6-Phase Table -->
    <div class="section-title" style="border-right-color: #059669; margin-top: 14px;">
      <span>۳. مراحل اجرای تدریس و یاددهی - یادگیری (با زمان‌بندی دقیق)</span>
    </div>
    <table class="lesson-table">
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">گام</th>
          <th style="width: 140px;">مرحله</th>
          <th style="width: 65px; text-align: center;">زمان</th>
          <th>فعالیت‌های معلم</th>
          <th>فعالیت‌های دانش‌آموز</th>
          <th style="width: 130px;">ارزشیابی مرحله</th>
        </tr>
      </thead>
      <tbody>
        ${plan.phases
          .map(
            (p) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${p.step}</td>
            <td style="font-weight: bold; color: #0f172a;">${p.name}</td>
            <td style="text-align: center; color: #475569;">${p.allocatedTime}</td>
            <td>${p.teacherAction}</td>
            <td>${p.studentAction}</td>
            <td style="color: #475569; font-size: 8.5pt;">${p.evaluation}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <!-- Homework & Tips -->
    <div class="section-title" style="border-right-color: #059669; margin-top: 14px;">
      <span>۴. فعالیت‌های تکمیلی و تکالیف متناسب با تفاوت‌های فردی</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 9pt;">
      <div style="border: 1px solid #fecdd3; background: #fff1f2; border-radius: 6px; padding: 6px 8px;">
        <strong style="color: #9f1239;">تکلیف جبرانی:</strong>
        <p style="margin: 4px 0 0 0; line-height: 1.5;">${plan.differentiatedAssignments.remedial}</p>
      </div>
      <div style="border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 6px; padding: 6px 8px;">
        <strong style="color: #1e40af;">تکلیف تثبیتی (عمومی):</strong>
        <p style="margin: 4px 0 0 0; line-height: 1.5;">${plan.differentiatedAssignments.standard}</p>
      </div>
      <div style="border: 1px solid #bbf7d0; background: #f0fdf4; border-radius: 6px; padding: 6px 8px;">
        <strong style="color: #166534;">تکلیف بسطی (خلاقانه):</strong>
        <p style="margin: 4px 0 0 0; line-height: 1.5;">${plan.differentiatedAssignments.enrichment}</p>
      </div>
    </div>

    <div style="margin-top: 10px; padding: 8px 12px; background: #fefce8; border: 1px solid #fde047; border-radius: 6px; font-size: 9pt; color: #713f12;">
      <strong>توصیه معلم‌یار هوشمند برای مدیریت کلاس:</strong> ${plan.classroomTips}
    </div>

    <div class="exam-footer">
      <div>طرح درس روزانه استاندارد • تولید شده در سامانه «معلم‌یار هوشمند»</div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generate HTML string for Lesson Summary
 */
export function generateSummaryHtml(sum: SummaryData): string {
  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>خلاصه درس: ${sum.title}</title>
  <style>${COMMON_A4_STYLES}</style>
</head>
<body>
  <div class="a4-page">
    <div class="exam-header-box" style="border-color: #d97706; background-color: #fffbeb;">
      <div style="text-align: center; font-size: 13pt; font-weight: 800; color: #92400e; margin-bottom: 2px;">
        خلاصه و چکیدهٔ درس: ${sum.title}
      </div>
      <div style="text-align: center; font-size: 9.5pt; color: #b45309;">
        سامانه «معلم‌یار هوشمند» - یادگیری آسان و لذت‌بخش برای دانش‌آموزان
      </div>
    </div>

    <div class="section-title" style="border-right-color: #d97706;">
      <span>متن خلاصه درس به زبان ساده و شیوا</span>
    </div>
    <div style="font-size: 10.5pt; line-height: 1.8; color: #1e293b; text-align: justify; padding: 6px 2px;">
      ${sum.summary}
    </div>

    <div class="section-title" style="border-right-color: #059669; margin-top: 14px;">
      <span>نکات طلایی و کلیدی درس</span>
    </div>
    <ul style="margin: 0; padding-right: 20px; font-size: 10pt; color: #1e293b;">
      ${sum.keyHighlights.map((k) => `<li style="margin-bottom: 4px;"><strong>${k}</strong></li>`).join('')}
    </ul>

    ${
      sum.vocabulary.length > 0
        ? `
      <div class="section-title" style="border-right-color: #2563eb; margin-top: 14px;">
        <span>واژه‌نامه واژگان مهم درس</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 9.5pt;">
        ${sum.vocabulary
          .map(
            (v) => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px;">
            <strong style="color: #1e40af;">« ${v.word} »:</strong>
            <span style="color: #475569;">${v.simplifiedMeaning}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `
        : ''
    }

    ${
      sum.realWorldExample
        ? `
      <div style="margin-top: 14px; padding: 10px 14px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; font-size: 9.5pt; color: #4c1d95;">
        <strong>این درس کجای زندگی به دردمان می‌خورد؟</strong>
        <p style="margin: 4px 0 0 0; line-height: 1.6;">${sum.realWorldExample}</p>
      </div>
    `
        : ''
    }

    ${
      sum.comprehensionQuiz.length > 0
        ? `
      <div class="section-title" style="border-right-color: #7c3aed; margin-top: 14px;">
        <span>سؤالات خودسنجی دانش‌آموز</span>
      </div>
      ${sum.comprehensionQuiz
        .map(
          (q, idx) => `
        <div class="question-item">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${idx + 1}. ${q.question}
          </div>
          <div style="font-size: 9pt; color: #166534; background: #f0fdf4; padding: 4px 8px; border-radius: 4px; display: inline-block;">
            پاسخ: ${q.answer}
          </div>
        </div>
      `
        )
        .join('')}
    `
        : ''
    }

    <div class="exam-footer">
      <div>تهیه شده در سامانه هوشمند «معلم‌یار هوشمند»</div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Extracts inner body content if an HTML document string was passed
 */
export function extractBodyContent(htmlOrBody: string): string {
  const bodyMatch = htmlOrBody.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : htmlOrBody;
}

/**
 * Clean browser printing function using dedicated body mount
 * Guaranteed to:
 * 1. Only print the desired document (hides application UI, navbars, buttons, tabs).
 * 2. Load Vazirmatn font with document.fonts.ready before print.
 * 3. Preserve connected Persian letters and RTL layout in both Print and PDF.
 * 4. Obey A4 page size and margins.
 * 5. Work reliably across all browsers, Chrome/Edge/Firefox/Safari and iFrame environments.
 */
/**
 * Clean browser printing function using a hidden iframe.
 * This is the most reliable method to print isolated content without 
 * affecting the main application's UI or causing layout shifts.
 */
export async function printCleanDocument(htmlContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Create a hidden iframe
      const iframe = document.createElement('iframe');
      
      // Basic styling to keep it hidden but "functional"
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!frameDoc) {
        throw new Error('عدم دسترسی به فریم چاپ');
      }

      // 2. Write the full HTML content to the iframe
      // We don't use extractBodyContent here because we want the full 
      // document with head styles and A4 definitions from the generators
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      // 3. Wait for assets and fonts to load
      const handlePrint = async () => {
        try {
          // Ensure fonts are ready in the iframe context
          if ((iframe.contentWindow as any).document.fonts) {
            await (iframe.contentWindow as any).document.fonts.ready;
          }
          
          // Small safety buffer for layout calculation
          await new Promise(r => setTimeout(r, 500));

          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // Cleanup after a delay (enough for the print dialog to open)
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve();
          }, 1000);
        } catch (err) {
          console.error('Inner print error:', err);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(err);
        }
      };

      // If already loaded (unlikely for write), trigger now
      if (frameDoc.readyState === 'complete') {
        handlePrint();
      } else {
        iframe.onload = handlePrint;
      }
    } catch (err: any) {
      console.error('Print failed:', err);
      reject(new Error('باز شدن پنجره چاپ توسط مرورگر مسدود شد یا با خطا مواجه گردید. لطفاً دسترسی Print را در مرورگر فعال کنید.'));
    }
  });
}

// Keep printIsolatedDocument as alias for backwards compatibility
export const printIsolatedDocument = printCleanDocument;
