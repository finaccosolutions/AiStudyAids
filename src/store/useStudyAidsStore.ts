import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface StudyAidsState {
  isLoading: boolean;
  error: string | null;
  
  // Question Bank
  questionBanks: any[];
  loadQuestionBanks: (userId: string) => Promise<void>;
  createQuestionBank: (userId: string, data: any) => Promise<void>;
  
  // Answer Evaluation
  evaluations: any[];
  loadEvaluations: (userId: string) => Promise<void>;
  createEvaluation: (userId: string, data: any) => Promise<void>;
  
  // Notes
  notes: any[];
  loadNotes: (userId: string) => Promise<void>;
  createNote: (userId: string, data: any) => Promise<void>;
  
  // Study Plan
  studyPlans: any[];
  loadStudyPlans: (userId: string) => Promise<void>;
  createStudyPlan: (userId: string, data: any) => Promise<void>;
  
  // Progress Stats
  progressStats: any[];
  loadProgressStats: (userId: string) => Promise<void>;
  updateProgressStats: (userId: string, data: any) => Promise<void>;
  
  // Chat History
  chatHistory: any[];
  loadChatHistory: (userId: string) => Promise<void>;
  addChatMessage: (userId: string, message: string, type: 'user' | 'assistant') => Promise<void>;
}

export const useStudyAidsStore = create<StudyAidsState>((set, get) => ({
  isLoading: false,
  error: null,
  
  // Question Bank
  questionBanks: [],
  loadQuestionBanks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ questionBanks: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createQuestionBank: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('question_banks')
        .insert({ user_id: userId, ...data });
        
      if (error) throw error;
      get().loadQuestionBanks(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Answer Evaluation
  evaluations: [],
  loadEvaluations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('answer_evaluations')
        .select('*')
        .eq('user_id', userId)
        .order('evaluated_at', { ascending: false });
        
      if (error) throw error;
      set({ evaluations: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createEvaluation: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('answer_evaluations')
        .insert({ user_id: userId, ...data });
        
      if (error) throw error;
      get().loadEvaluations(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Notes
  notes: [],
  loadNotes: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ notes: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createNote: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('notes')
        .insert({ user_id: userId, ...data });
        
      if (error) throw error;
      get().loadNotes(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Study Plan
  studyPlans: [],
  loadStudyPlans: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ studyPlans: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createStudyPlan: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { 
        examDate,
        startDate,
        dailyHours,
        topics, // Extract topics from the data
        ...rest
      } = data;

      // Create the correct structure for the database
      const dbData = {
        user_id: userId,
        exam_date: examDate,
        start_date: startDate,
        daily_hours: dailyHours,
        syllabus: { topics }, // Wrap topics in syllabus object
        ...rest
      };

      const { error } = await supabase
        .from('study_plans')
        .insert(dbData);
        
      if (error) throw error;
      get().loadStudyPlans(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Progress Stats
  progressStats: [],
  loadProgressStats: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('progress_stats')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });
        
      if (error) throw error;
      set({ progressStats: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  updateProgressStats: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('progress_stats')
        .upsert({ user_id: userId, ...data });
        
      if (error) throw error;
      get().loadProgressStats(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Chat History
  chatHistory: [],
  loadChatHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      set({ chatHistory: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  addChatMessage: async (userId, content, type) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({ user_id: userId, content, type });
        
      if (error) throw error;
      get().loadChatHistory(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));