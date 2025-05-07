import { createClient } from '@supabase/supabase-js';
import { ApiKeyData, QuizPreferences } from '../types';

// Environment variables would be used in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signUp = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return supabase.auth.getUser();
};

// API Key functions
export const saveApiKey = async (userId: string, apiKey: string) => {
  return supabase
    .from('api_keys')
    .upsert({ user_id: userId, gemini_api_key: apiKey })
    .select();
};

export const getApiKey = async (userId: string) => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('gemini_api_key')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return data?.gemini_api_key;
};

// Quiz preferences functions
export const saveQuizPreferences = async (userId: string, preferences: QuizPreferences) => {
  return supabase
    .from('quiz_preferences')
    .upsert({ 
      user_id: userId, 
      topic: preferences.topic,
      subtopic: preferences.subtopic,
      question_count: preferences.questionCount,
      question_types: preferences.questionTypes,
      language: preferences.language,
      difficulty: preferences.difficulty,
      time_limit: preferences.timeLimit?.toString() || null,
      negative_marking: preferences.negativeMarking,
      negative_marks: preferences.negativeMarks,
      mode: preferences.mode,
      answer_mode: preferences.answerMode
    }, { onConflict: 'user_id' });
};

export const getQuizPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  
  if (data) {
    return {
      topic: data.topic,
      subtopic: data.subtopic,
      questionCount: data.question_count,
      questionTypes: data.question_types,
      language: data.language,
      difficulty: data.difficulty,
      timeLimit: data.time_limit,
      negativeMarking: data.negative_marking,
      negativeMarks: data.negative_marks,
      mode: data.mode,
      answerMode: data.answer_mode
    };
  }
  
  return null;
};