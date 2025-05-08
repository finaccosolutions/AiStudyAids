import { create } from 'zustand';
import { ApiKeyData, Question, QuizPreferences, QuizResult } from '../types';
import { getApiKey, getQuizPreferences, saveApiKey, saveQuizPreferences } from '../services/supabase';
import { generateQuiz, getAnswerExplanation } from '../services/gemini';

interface QuizState {
  preferences: QuizPreferences | null;
  apiKey: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  result: QuizResult | null;
  isLoading: boolean;
  error: string | null;
  explanation: string | null;
  
  // Preference actions
  loadApiKey: (userId: string) => Promise<void>;
  saveApiKey: (userId: string, apiKey: string) => Promise<void>;
  loadPreferences: (userId: string) => Promise<void>;
  savePreferences: (userId: string, preferences: QuizPreferences) => Promise<void>;
  
  // Quiz actions
  generateQuiz: (userId: string) => Promise<void>;
  answerQuestion: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  
  // Explanation
  getExplanation: (questionId: number) => Promise<void>;
  resetExplanation: () => void;
}

export const defaultPreferences: QuizPreferences = {
  topic: '',
  subtopic: null,
  questionCount: 5,
  questionTypes: ['multiple-choice'],
  language: 'en',
  difficulty: 'medium',
  timeLimit: null,
  customTimeLimit: null,
  negativeMarking: false,
  negativeMarks: -0.25,
  mode: 'practice'
};

export const useQuizStore = create<QuizState>((set, get) => ({
  preferences: null,
  apiKey: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  result: null,
  isLoading: false,
  error: null,
  explanation: null,
  
  loadApiKey: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const apiKey = await getApiKey(userId);
      set({ apiKey });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load API key' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveApiKey: async (userId, apiKey) => {
    set({ isLoading: true, error: null });
    try {
      await saveApiKey(userId, apiKey);
      set({ apiKey });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save API key' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadPreferences: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const preferences = await getQuizPreferences(userId);
      // If preferences exist in DB, use them, otherwise use defaults
      set({ 
        preferences: preferences ? {
          ...defaultPreferences,
          ...preferences,
          // Ensure negativeMarks is set when loading preferences
          negativeMarks: preferences.negativeMarks ?? defaultPreferences.negativeMarks
        } : defaultPreferences 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load preferences',
        preferences: defaultPreferences // Fallback to defaults on error
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  savePreferences: async (userId, preferences) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure at least one question type is selected
      if (!preferences.questionTypes || preferences.questionTypes.length === 0) {
        preferences.questionTypes = ['multiple-choice'];
      }
      
      // Handle time limit conversion
      if (preferences.timeLimit === 'custom' && preferences.customTimeLimit) {
        preferences.timeLimit = preferences.customTimeLimit.toString();
      }
      
      // Ensure negativeMarks is included when negativeMarking is true
      const prefsToSave = {
        ...preferences,
        negativeMarks: preferences.negativeMarking ? 
          (preferences.negativeMarks ?? defaultPreferences.negativeMarks) : 
          null
      };
      
      await saveQuizPreferences(userId, prefsToSave);
      set({ preferences: prefsToSave });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save preferences' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  generateQuiz: async (userId) => {
    const { preferences, apiKey } = get();
    set({ isLoading: true, error: null, questions: [], answers: {}, result: null });
    
    if (!preferences || !apiKey) {
      set({ 
        error: !preferences 
          ? 'Quiz preferences not set' 
          : 'Gemini API key not set',
        isLoading: false 
      });
      return;
    }
    
    try {
      const questions = await generateQuiz(apiKey, preferences);
      set({ 
        questions, 
        currentQuestionIndex: 0,
        answers: {},
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate quiz' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  answerQuestion: (questionId, answer) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer
      }
    }));
  },
  
  nextQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state;
    });
  },
  
  prevQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        return { currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;
    });
  },
  
  finishQuiz: () => {
    const { questions, answers, preferences } = get();
    
    let correctAnswers = 0;
    let totalScore = 0;
    
    const questionsWithAnswers = questions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      
      if (isCorrect) {
        correctAnswers++;
        totalScore++;
      } else if (preferences?.negativeMarking && userAnswer) {
        totalScore += preferences.negativeMarks;
      }
      
      return {
        ...question,
        userAnswer
      };
    });
    
    const maxScore = questions.length;
    const percentage = Math.max(0, Math.round((totalScore / maxScore) * 100));
    
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers,
      percentage,
      questions: questionsWithAnswers
    };
    
    set({ result });
  },
  
  resetQuiz: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      result: null,
      error: null
    });
  },
  
  getExplanation: async (questionId) => {
    const { questions, apiKey, preferences } = get();
    set({ isLoading: true, error: null, explanation: null });
    
    const question = questions.find(q => q.id === questionId);
    
    if (!question || !apiKey || !preferences) {
      set({ 
        error: !question 
          ? 'Question not found' 
          : !apiKey 
            ? 'API key not set'
            : 'Preferences not set',
        isLoading: false 
      });
      return;
    }
    
    try {
      const explanation = await getAnswerExplanation(
        apiKey,
        question.text,
        question.correctAnswer,
        preferences.topic,
        preferences.language
      );
      
      set({ explanation });
    } catch (error: any) {
      set({ error: error.message || 'Failed to get explanation' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetExplanation: () => {
    set({ explanation: null });
  }
}));