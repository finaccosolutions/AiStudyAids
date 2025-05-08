export type UserData = {
  id: string;
  email: string;
};

export type ApiKeyData = {
  userId: string;
  geminiApiKey: string;
};

export type QuizPreferences = {
  topic: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: string[];
  language: string;
  timeLimit?: string;
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