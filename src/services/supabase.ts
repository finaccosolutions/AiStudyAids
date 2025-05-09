import { createClient } from '@supabase/supabase-js';
import { ApiKeyData, QuizPreferences, UserProfile, QuizResultData, FavoriteQuestion } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API Key functions
export const getApiKey = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('gemini_api_key')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data?.gemini_api_key || null;
};

export const saveApiKey = async (userId: string, apiKey: string) => {
  const { data: existingKey } = await supabase
    .from('api_keys')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingKey) {
    // Update existing key
    const { error } = await supabase
      .from('api_keys')
      .update({ gemini_api_key: apiKey })
      .eq('user_id', userId);
    
    if (error) throw error;
  } else {
    // Insert new key
    const { error } = await supabase
      .from('api_keys')
      .insert({ user_id: userId, gemini_api_key: apiKey });
    
    if (error) throw error;
  }
};

// Quiz preferences functions
export const getQuizPreferences = async (userId: string): Promise<QuizPreferences | null> => {
  const { data, error } = await supabase
    .from('quiz_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    throw error;
  }

  return {
    topic: data.topic,
    subtopic: data.subtopic,
    questionCount: data.question_count,
    questionTypes: data.question_types,
    language: data.language,
    difficulty: data.difficulty,
    timeLimit: data.time_limit,
    customTimeLimit: data.custom_time_limit,
    negativeMarking: data.negative_marking,
    negativeMarks: data.negative_marks,
    mode: data.mode,
    totalTimeLimit: data.total_time_limit,
    customTotalTimeLimit: data.custom_total_time_limit
  };
};

export const saveQuizPreferences = async (userId: string, preferences: QuizPreferences) => {
  const { data: existingPrefs } = await supabase
    .from('quiz_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  const prefsData = {
    user_id: userId,
    topic: preferences.topic,
    subtopic: preferences.subtopic,
    question_count: preferences.questionCount,
    question_types: preferences.questionTypes,
    language: preferences.language,
    difficulty: preferences.difficulty,
    time_limit: preferences.timeLimit,
    custom_time_limit: preferences.customTimeLimit,
    negative_marking: preferences.negativeMarking,
    negative_marks: preferences.negativeMarks,
    mode: preferences.mode,
    total_time_limit: preferences.totalTimeLimit,
    custom_total_time_limit: preferences.customTotalTimeLimit
  };

  if (existingPrefs) {
    // Update existing preferences
    const { error } = await supabase
      .from('quiz_preferences')
      .update(prefsData)
      .eq('user_id', userId);
    
    if (error) throw error;
  } else {
    // Insert new preferences
    const { error } = await supabase
      .from('quiz_preferences')
      .insert(prefsData);
    
    if (error) throw error;
  }
};

// Auth functions
export const signUp = async (email: string, password: string, fullName: string, mobileNumber: string) => {
  // First check if mobile number exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('mobile_number')
    .eq('mobile_number', mobileNumber)
    .single();

  if (existingProfile) {
    throw new Error('Mobile number already registered');
  }

  // Sign up user
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });

  if (error) throw error;

  if (data.user) {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        full_name: fullName,
        mobile_number: mobileNumber,
      });

    if (profileError) throw profileError;

    // Send confirmation email
    await fetch(`${supabaseUrl}/functions/v1/send-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        userId: data.user.id,
        email,
        name: fullName,
      }),
    });
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return { data: null, error };

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: profile ? {
            id: profile.id,
            fullName: profile.full_name,
            mobileNumber: profile.mobile_number,
            emailConfirmed: profile.email_confirmed,
            avatarUrl: profile.avatar_url,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at),
          } : undefined,
        }
      },
      error: null,
    };
  } catch (err) {
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: undefined,
        }
      },
      error: null,
    };
  }
};

export const resetPassword = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const updatePassword = async (newPassword: string) => {
  return supabase.auth.updateUser({ password: newPassword });
};

export const updateProfile = async (userId: string, profile: Partial<UserProfile>) => {
  return supabase
    .from('profiles')
    .update({
      full_name: profile.fullName,
      mobile_number: profile.mobileNumber,
      avatar_url: profile.avatarUrl,
    })
    .eq('user_id', userId);
};

// Quiz results functions
export const saveQuizResult = async (userId: string, result: QuizResultData) => {
  return supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      quiz_date: result.quizDate,
      topic: result.topic,
      score: result.score,
      total_questions: result.totalQuestions,
      time_taken: result.timeTaken,
    });
};

export const getQuizResults = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('quiz_date', { ascending: false });

  if (error) throw error;

  return data.map(result => ({
    id: result.id,
    quizDate: new Date(result.quiz_date),
    topic: result.topic,
    score: result.score,
    totalQuestions: result.total_questions,
    timeTaken: result.time_taken,
  }));
};

// Favorite questions functions
export const saveFavoriteQuestion = async (userId: string, question: Omit<FavoriteQuestion, 'id' | 'createdAt'>) => {
  return supabase
    .from('favorite_questions')
    .insert({
      user_id: userId,
      question_text: question.questionText,
      answer: question.answer,
      explanation: question.explanation,
      topic: question.topic,
    });
};

export const getFavoriteQuestions = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorite_questions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(question => ({
    id: question.id,
    questionText: question.question_text,
    answer: question.answer,
    explanation: question.explanation,
    topic: question.topic,
    createdAt: new Date(question.created_at),
  }));
};

export const removeFavoriteQuestion = async (userId: string, questionId: string) => {
  return supabase
    .from('favorite_questions')
    .delete()
    .eq('user_id', userId)
    .eq('id', questionId);
};