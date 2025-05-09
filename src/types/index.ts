export type UserData = {
  id: string;
  email: string;
  emailConfirmed: boolean;
  profile?: UserProfile;
};

export type UserProfile = {
  id: string;
  fullName: string;
  mobileNumber: string;
  countryCode: string;
  countryName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiKeyData = {
  userId: string;
  geminiApiKey: string;
};

export type QuizPreferences = {
  course?: string;
  topic?: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: string[];
  language: string;
  timeLimitEnabled: boolean;
  timeLimit?: string | null;
  totalTimeLimit?: string | null;
  negativeMarking?: boolean;
  negativeMarks?: number;
  mode: 'practice' | 'exam';
  answerMode: 'immediate' | 'end';
};

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'code-output' | 'assertion-reason';

export type Question = {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  userAnswer?: string;
};

export type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  questions: Question[];
};

export type QuizResultData = {
  id: string;
  quizDate: Date;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTaken?: number;
};

export type FavoriteQuestion = {
  id: string;
  questionText: string;
  answer: string;
  explanation?: string;
  topic: string;
  createdAt: Date;
};

export type Country = {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
};