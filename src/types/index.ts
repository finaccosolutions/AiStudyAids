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
  questionCount: number;
  questionTypes: QuestionType[];
  language: string;
};

export type QuestionType = 'multiple-choice' | 'yes-no' | 'short-answer';

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