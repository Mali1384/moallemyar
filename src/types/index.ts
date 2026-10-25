export interface LessonPlanMeta {
  grade: string;
  subject: string;
  topic: string;
  duration: string;
  date?: string;
}

export interface LessonPlanPhase {
  step: number;
  name: string;
  allocatedTime: string;
  teacherAction: string;
  studentAction: string;
  evaluation: string;
}

export interface LessonPlanData {
  title: string;
  meta: LessonPlanMeta;
  generalGoals: string[];
  behavioralGoals: {
    cognitive: string[];
    affective: string[];
    psychomotor: string[];
  };
  prerequisites: string[];
  teachingMethods: string[];
  teachingAids: string[];
  phases: LessonPlanPhase[];
  differentiatedAssignments: {
    remedial: string;
    standard: string;
    enrichment: string;
  };
  classroomTips: string;
}

export interface ExamMultipleChoice {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  score: number;
}

export interface ExamTrueFalse {
  id: number;
  statement: string;
  isCorrect: boolean;
  explanation: string;
  score: number;
}

export interface ExamDescriptive {
  id: number;
  question: string;
  answer: string;
  scoringGuide: string;
  score: number;
}

export interface ExamData {
  examHeader: {
    title: string;
    grade: string;
    subject: string;
    topic: string;
    timeMinutes: string;
    totalScore: number;
  };
  multipleChoice: ExamMultipleChoice[];
  trueFalse: ExamTrueFalse[];
  descriptive: ExamDescriptive[];
  examSummary?: string;
}

export interface VocabularyItem {
  word: string;
  simplifiedMeaning: string;
}

export interface SelfCheckQuestion {
  question: string;
  answer: string;
}

export interface SummaryData {
  title: string;
  summary: string;
  keyHighlights: string[];
  vocabulary: VocabularyItem[];
  realWorldExample: string;
  comprehensionQuiz: SelfCheckQuestion[];
}

export type HistoryItemType = 'lesson-plan' | 'exam' | 'summary';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  createdAt: string;
  data: LessonPlanData | ExamData | SummaryData;
}
