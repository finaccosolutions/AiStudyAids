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

// Supported languages for quiz generation
export type QuizLanguage = 'English' | 'Hindi' | 'Malayalam' | 'Tamil' | 'Telugu';

// Language display information
export type LanguageInfo = {
  code: QuizLanguage;
  name: string;
  nativeName: string;
};

export type QuizPreferences = {
  course?: string;
  topic?: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: QuestionType[];
  language: QuizLanguage;
  timeLimitEnabled: boolean;
  timeLimit?: string | null;
  totalTimeLimit?: string | null;
  negativeMarking?: boolean;
  negativeMarks?: number;
  mode: 'practice' | 'exam';
  answerMode: 'immediate' | 'end';
};

export type QuestionType = 
  | 'multiple-choice'  // Single correct answer from options
  | 'true-false'      // True/False questions
  | 'fill-blank'      // Fill in the blank
  | 'short-answer'    // 1-2 word answers
  | 'sequence'        // Arrange items in correct order
  | 'case-study'      // Analyze real-world scenarios
  | 'situation'       // Choose best action in a scenario
  | 'multi-select';   // Multiple correct options

export type Question = {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  userAnswer?: string;
  language?: QuizLanguage;
  // Additional fields for specific question types
  caseStudy?: string;        // For case-study type
  sequence?: string[];       // For sequence type
  correctSequence?: string[]; // For sequence type
  correctOptions?: string[]; // For multi-select type
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