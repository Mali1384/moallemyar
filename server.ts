import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// --- AI Provider Abstraction ---

type AiMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
};

interface GenerateOptions {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  image?: {
    data: string; // base64
    mimeType: string;
  };
  temperature?: number;
  responseMimeType?: string;
}

async function generateContent(options: GenerateOptions): Promise<string> {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const preferredModel = process.env.AI_MODEL;

  if (!apiKey) {
    throw new Error('کلید API سرویس هوش مصنوعی (AI_API_KEY) در سرور تنظیم نشده است. لطفاً متغیرهای محیطی را در پنل میزبانی خود بررسی کنید.');
  }

  if (provider === 'openai' || baseUrl) {
    return callOpenAi(options, apiKey, baseUrl, preferredModel);
  } else {
    return callGemini(options, apiKey, preferredModel);
  }
}

async function callGemini(options: GenerateOptions, apiKey: string, preferredModel?: string): Promise<string> {
  const genAI = new GoogleGenAI(apiKey);
  const modelName = preferredModel || options.model || 'gemini-3.8-flash';
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      responseMimeType: options.responseMimeType as any,
    }
  });

  const parts: any[] = [{ text: options.prompt }];
  if (options.image) {
    parts.unshift({
      inlineData: {
        data: options.image.data,
        mimeType: options.image.mimeType
      }
    });
  }

  // Retry logic for Gemini
  let lastError: any = null;
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      if (msg.includes('400') || msg.includes('INVALID_ARGUMENT')) break;
      console.warn(`[Gemini Attempt ${attempt + 1}] failed:`, msg);
    }
  }
  throw translateError(lastError);
}

async function callOpenAi(options: GenerateOptions, apiKey: string, baseUrl?: string, preferredModel?: string): Promise<string> {
  const openai = new OpenAI({
    apiKey,
    baseURL: baseUrl || undefined,
  });

  const modelName = preferredModel || (options.image ? 'gpt-4o' : 'gpt-4o-mini');
  
  const messages: any[] = [];
  if (options.systemInstruction) {
    messages.push({ role: 'system', content: options.systemInstruction });
  }

  const userContent: any[] = [{ type: 'text', text: options.prompt }];
  if (options.image) {
    userContent.unshift({
      type: 'image_url',
      image_url: {
        url: `data:${options.image.mimeType};base64,${options.image.data}`
      }
    });
  }
  messages.push({ role: 'user', content: userContent });

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages,
      temperature: options.temperature ?? 0.7,
      response_format: options.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
    });
    return response.choices[0].message.content || '';
  } catch (err: any) {
    throw translateError(err);
  }
}

function translateError(err: any): Error {
  let msg = err?.message || 'خطا در ارتباط با سرور هوش مصنوعی.';
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    msg = 'سامانه هوش مصنوعی در حال حاضر شلوغ است. لطفاً چند لحظه صبر کرده و دوباره تلاش کنید.';
  } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    msg = 'سقف درخواست‌های مجاز تکمیل شده است. لطفاً ۳۰ ثانیه صبر کرده و مجدداً امتحان کنید.';
  } else if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('fetch failed')) {
    msg = 'ارتباط با سرویس هوش مصنوعی برقرار نشد. لطفاً تنظیمات اینترنت یا پروکسی سرور را بررسی کنید.';
  }
  return new Error(msg);
}

// Helper to extract JSON from model response safely
function extractJsonFromText(text: string): any {
  if (!text) throw new Error('پاسخی از مدل هوش مصنوعی دریافت نشد.');
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    }
    throw new Error('قالب پاسخ دریافتی قابل پردازش نبود. لطفاً مجدداً امتحان کنید.');
  }
}

// --- API Routes ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'معلم‌یار هوشمند',
    provider: process.env.AI_PROVIDER || 'gemini',
    hasApiKey: !!(process.env.AI_API_KEY || process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/extract-text-from-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image?.data) return res.status(400).json({ error: 'تصویر معتبری ارسال نشده است.' });

    const text = await generateContent({
      prompt: `شما یک سامانه OCR بسیار دقیق مسلط به زبان فارسی هستید. تمام متون موجود در این تصویر را با دقت استخراج کن. فقط متن را بازگردان بدون هیچ توضیحی.`,
      image: { data: image.data, mimeType: image.mimeType },
      temperature: 0.1,
    });

    return res.json({ success: true, text: text.trim() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const { grade, subject, topic, duration, specialRequirements, image } = req.body;
    if (!grade || !subject || !topic) return res.status(400).json({ error: 'لطفاً پایه تحصیلی، نام درس و موضوع درس را به طور کامل وارد نمایید.' });

    const classDuration = duration || '۴۵ دقیقه';
    const promptText = `
شما یک استاد برجسته روش تدریس، مؤلف کتب درسی و کارشناس ارشد برنامه‌ریزی آموزشی در وزارت آموزش و پرورش ایران هستید.
وظیفه شما نگارش یک «طرح درس روزانه جامع، عمیق، کاربردی و صددرصد آماده تدریس» برای معلمان مدارس است.

مشخصات ورودی:
- پایه تحصیلی: ${grade}
- نام درس: ${subject}
- موضوع درس: ${topic}
- مدت زمان کل کلاس: ${classDuration}
- نیازمندی‌ها و انتظارات خاص معلم: ${specialRequirements || 'الگوی استاندارد یادگیری فعال و تعاملی'}

قوانین الزامی و حیاتی (بسیار مهم):
۱. ممنوعیت مطلق عبارات کلیشه‌ای و مبهم: از به کار بردن جملات تنبلانه و کلی نظیر «یک داستان تعریف کنید»، «یک جمله زیبا بگویید»، «چند سوال بپرسید»، «آزمایش ساده‌ای انجام دهید»، «معلم خاطره‌ای بگوید» اکیداً خودداری کن!
۲. در مرحله ۱ (انگیزه‌سازی): باید متن کامل داستان، تمثیل یا معمای تفکربرانگیز کلمه‌به‌کلمه (حداقل یک تا دو پاراگراف داستان جذاب و آموزنده متناسب با سن دانش‌آموز) نوشته شود تا معلم بتواند دقیقاً آن را سر کلاس بخواند.
۳. در مرحله ۲ (ارزشیابی تشخیصی): حداقل ۲ سوال مشخص از پیش‌نیازهای درسی به همراه پاسخ دقیق مورد انتظار دانش‌آموزان به صورت تفکیکی ذکر شود.
۴. در مرحله ۳ (ارائه درس جدید): شرح کامل و گام‌به‌گام تدریس با دیالوگ مستقیم معلم، سناریوی کارگاهی، مثال‌های ملموس، و متن دقیق محتوای درسی نوشته شود. 
   - برای درس قرآن: حتماً متن دقیق آیه شریفه به زبان عربی، ترجمه روان و معتبر فارسی، و پیام آموزشی مرتبط را بنویس. هرگز به گفتن «آیه را بخوانید» بسنده نکن؛ خود آیه و ترجمه را کلمه‌به‌کلمه بنویس.
   - برای داستان‌ها: اگر پیشنهاد می‌دهی داستانی تعریف شود، حتماً کل متن داستان را متناسب با سن دانش‌آموز (حداقل یک پاراگراف کامل) در فیلد teacherAction بنویس.
   - برای پیام‌های اخلاقی: متن دقیق جمله‌ای که معلم باید بگوید را بنویس.
۵. در مرحله ۴ (جمع‌بندی): نتیجه‌گیری نهایی کلمه‌به‌کلمه و خلاصه درس برای ارائه به دانش‌آموزان نوشته شود.
۶. در مرحله ۵ (ارزشیابی پایانی): حداقل ۲ سوال مشخص پایانی همراه با پاسخ مدل درج شود.
۷. زمان‌بندی دقیق مراحل: مجموع دقایق مراحل شش‌گانه در فیلد allocatedTime باید دقیقاً برابر با مدت کل کلاس (${classDuration}) باشد.

پاسخ را دقیقاً در قالب ساختار JSON زیر ارسال کن:
{
  "title": "طرح درس روزانه: ${subject} - ${topic}",
  "meta": { "grade": "${grade}", "subject": "${subject}", "topic": "${topic}", "duration": "${classDuration}", "date": "جلسه آموزشی" },
  "generalGoals": ["هدف کلی ۱...", "هدف کلی ۲..."],
  "behavioralGoals": {
    "cognitive": ["حیطه دانشی ۱", "حیطه شناختی ۲"],
    "affective": ["حیطه عاطفی ۱", "حیطه عاطفی ۲"],
    "psychomotor": ["حیطه مهارتی ۱", "حیطه مهارتی ۲"]
  },
  "prerequisites": ["پیش‌دانسته ۱...", "پیش‌دانسته ۲..."],
  "teachingMethods": ["روش تدریس ۱", "روش تدریس ۲"],
  "teachingAids": ["ابزار آموزشی"],
  "phases": [
    { "step": 1, "name": "انگیزه‌سازی", "allocatedTime": "۷ دقیقه", "teacherAction": "متن کامل سناریوی آغازین...", "studentAction": "مشارکت فعال", "evaluation": "مشاهده مستقیم" },
    { "step": 2, "name": "ارزشیابی تشخیصی", "allocatedTime": "۴ دقیقه", "teacherAction": "سوالات و پاسخ‌ها...", "studentAction": "پاسخ‌گویی", "evaluation": "ارزیابی درک" },
    { "step": 3, "name": "ارائه درس جدید", "allocatedTime": "۲۱ دقیقه", "teacherAction": "شرح گام‌به‌گام با دیالوگ...", "studentAction": "یادداشت‌برداری", "evaluation": "ارزشیابی تکوینی" },
    { "step": 4, "name": "جمع‌بندی", "allocatedTime": "۵ دقیقه", "teacherAction": "متن جمع‌بندی...", "studentAction": "مرور", "evaluation": "توانایی بیان خلاصه" },
    { "step": 5, "name": "ارزشیابی پایانی", "allocatedTime": "۵ دقیقه", "teacherAction": "سوالات پایانی...", "studentAction": "پاسخ به سوالات", "evaluation": "سنجش اهداف" },
    { "step": 6, "name": "تکالیف", "allocatedTime": "۳ دقیقه", "teacherAction": "اعلام تکالیف...", "studentAction": "ثبت تکالیف", "evaluation": "درک تکالیف" }
  ],
  "differentiatedAssignments": { "remedial": "تکلیف جبرانی", "standard": "تکلیف عمومی", "enrichment": "تکلیف خلاقانه" },
  "classroomTips": "توصیه مدیریت کلاس"
}
`;

    const responseText = await generateContent({
      prompt: promptText,
      systemInstruction: 'شما مشاور ارشد و استاد راهنمای نگارش طرح درس در وزارت آموزش و پرورش ایران در سامانه «معلم‌یار هوشمند» هستید. تمام پاسخ‌ها باید کاملاً ساختاریافته، عمیق، حاوی داستان و سناریوی کامل کلمه‌به‌کلمه و در قالب معتبر JSON بازگردانده شوند.',
      image: image?.data ? { data: image.data, mimeType: image.mimeType } : undefined,
      temperature: 0.4,
      responseMimeType: 'application/json',
    });

    return res.json({ success: true, data: extractJsonFromText(responseText) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-exam', async (req, res) => {
  try {
    const { sourceText, image, grade, subject, topic, difficulty, multipleChoiceCount = 3, trueFalseCount = 2, descriptiveCount = 2 } = req.body;

    const promptText = `
شما به عنوان طراح سؤال ارشد امتحانات نهایی و استاندارد آموزش و پرورش در سامانه «معلم‌یار هوشمند» فعالیت می‌کنید.
بر اساس محتوای ارائه‌شده (متن، تصویر کتاب یا مبحث درس)، یک برگه آزمون کاملاً استاندارد به همراه پاسخنامه تهیه کنید.

مشخصات آزمون:
- پایه: ${grade || ''} | درس: ${subject || ''} | مبحث: ${topic || ''}
- سطح: ${difficulty || 'متوسط'}
- تستی: ${multipleChoiceCount} | ص/غ: ${trueFalseCount} | تشریحی: ${descriptiveCount}

قوانین:
۱. سؤالات دقیقاً از مفاهیم منبع استخراج شوند.
۲. تستی: ۴ گزینه، correctOptionIndex 0-3.
۳. خروجی صددرصد JSON طبق ساختار باشد.

فرمت JSON:
{
  "examHeader": { "title": "آزمون سنجش کلاسی", "grade": "${grade}", "subject": "${subject}", "topic": "${topic}", "timeMinutes": "۴۵ دقیقه", "totalScore": 20 },
  "multipleChoice": [ { "id": 1, "question": "...", "options": ["...", "...", "...", "..."], "correctOptionIndex": 0, "explanation": "...", "score": 1.5 } ],
  "trueFalse": [ { "id": 1, "statement": "...", "isCorrect": true, "explanation": "...", "score": 1.0 } ],
  "descriptive": [ { "id": 1, "question": "...", "answer": "...", "scoringGuide": "...", "score": 2.5 } ],
  "examSummary": "خلاصه بارم‌بندی"
}
`;

    const responseText = await generateContent({
      prompt: promptText,
      systemInstruction: 'شما طراح حرفه‌ای سؤالات امتحانی برای مدارس در سامانه «معلم‌یار هوشمند» هستید. خروجی را تنها به شکل JSON بازگردانید.',
      image: image?.data ? { data: image.data, mimeType: image.mimeType } : undefined,
      temperature: 0.5,
      responseMimeType: 'application/json',
    });

    return res.json({ success: true, data: extractJsonFromText(responseText) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/summarize-lesson', async (req, res) => {
  try {
    const { text, image, grade, style = 'simple', length = 'medium' } = req.body;

    let styleInstruction = 'زبان ساده و روان';
    if (style === 'story') styleInstruction = 'لحن داستانی و جذاب';
    else if (style === 'bullet') styleInstruction = 'نکته‌وار و امتحانی';

    const promptText = `
شما دستیار آموزش در سامانه «معلم‌یار هوشمند» هستید. محتوا را برای دانش‌آموز ${grade} خلاصه‌سازی کنید.
سبک: ${styleInstruction} | حجم: ${length}
متن ورودی: ${text || ''}

فرمت JSON خروجی:
{
  "title": "عنوان جذاب",
  "summary": "متن اصلی خلاصه شده...",
  "keyHighlights": ["نکته ۱", "نکته ۲"],
  "vocabulary": [ { "word": "...", "simplifiedMeaning": "..." } ],
  "realWorldExample": "مثال عینی",
  "comprehensionQuiz": [ { "question": "...", "answer": "..." } ]
}
`;

    const responseText = await generateContent({
      prompt: promptText,
      systemInstruction: 'شما خلاصه‌نویس تخصصی کتب درسی برای کودکان و نوجوانان در «معلم‌یار هوشمند» هستید. پاسخ را فقط در قالب JSON ارائه دهید.',
      image: image?.data ? { data: image.data, mimeType: image.mimeType } : undefined,
      temperature: 0.6,
      responseMimeType: 'application/json',
    });

    return res.json({ success: true, data: extractJsonFromText(responseText) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[معلم‌یار هوشمند] سرور با موفقیت روی پورت ${PORT} شروع به کار کرد.`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
