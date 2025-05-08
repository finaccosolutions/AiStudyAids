import { createClient } from '@supabase/supabase-js';
import { ApiKeyData, QuizPreferences } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
  // Ensure question_types is an array and contains valid values
  const validQuestionTypes = [
    'multiple-choice',
    'true-false',
    'fill-blank',
    'matching',
    'code-output',
    'assertion-reason'
  ];
  
  const questionTypes = preferences.questionTypes.filter(type => 
    validQuestionTypes.includes(type)
  );
  
  // Ensure at least one valid question type
  if (questionTypes.length === 0) {
    questionTypes.push('multiple-choice');
  }
  
  // Handle time limit conversion
  let timeLimit = preferences.timeLimit;
  let customTimeLimit = null;
  
  if (timeLimit === 'custom' && preferences.customTimeLimit) {
    customTimeLimit = preferences.customTimeLimit;
  } else if (timeLimit && timeLimit !== 'none' && timeLimit !== 'custom') {
    timeLimit = timeLimit.toString();
  }

  // Check if a record already exists for this user
  const { data: existingPrefs } = await supabase
    .from('quiz_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  const preferencesData = {
    user_id: userId,
    topic: preferences.topic,
    subtopic: preferences.subtopic,
    question_count: preferences.questionCount,
    question_types: questionTypes,
    language: preferences.language,
    difficulty: preferences.difficulty,
    time_limit: timeLimit,
    custom_time_limit: customTimeLimit,
    negative_marking: preferences.negativeMarking,
    negative_marks: preferences.negativeMarks,
    mode: preferences.mode
  };

  if (existingPrefs) {
    // Update existing record
    return supabase
      .from('quiz_preferences')
      .update(preferencesData)
      .eq('user_id', userId)
      .select();
  } else {
    // Insert new record
    return supabase
      .from('quiz_preferences')
      .insert(preferencesData)
      .select();
  }
};

export const getQuizPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  
  if (data) {
    // Convert time limit back to the correct format
    let timeLimit = data.time_limit;
    let customTimeLimit = data.custom_time_limit;
    
    if (customTimeLimit) {
      timeLimit = 'custom';
    }
    
    return {
      topic: data.topic,
      subtopic: data.subtopic,
      questionCount: data.question_count,
      questionTypes: data.question_types,
      language: data.language,
      difficulty: data.difficulty,
      timeLimit,
      customTimeLimit,
      negativeMarking: data.negative_marking,
      negativeMarks: data.negative_marks,
      mode: data.mode
    };
  }
  
  return null;
};