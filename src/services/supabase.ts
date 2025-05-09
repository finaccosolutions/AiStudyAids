import { createClient } from '@supabase/supabase-js';
import { ApiKeyData, QuizPreferences, UserProfile, QuizResultData, FavoriteQuestion } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signUp = async (
  email: string, 
  password: string, 
  fullName: string, 
  mobileNumber: string,
  countryCode: string = 'IN',
  countryName: string = 'India'
) => {
  // First check if mobile number exists
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('mobile_number')
    .eq('mobile_number', mobileNumber);

  if (existingProfiles && existingProfiles.length > 0) {
    throw new Error('Mobile number already registered');
  }

  // Sign up user with email confirmation required
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
        registration_status: 'pending_verification',
        registration_date: new Date().toISOString(),
      },
      emailRedirectTo: `${window.location.origin}/auth?mode=signin`,
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
        country_code: countryCode,
        country_name: countryName
      });

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw error;

  // Check if email is confirmed
  if (!data.user.email_confirmed_at) {
    throw new Error('Please confirm your email address before signing in');
  }

  return { data, error };
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: null, error: userError };
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      // If no profile is found, this is an error state
      throw new Error('User profile not found');
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
          profile: {
            id: profile.id,
            fullName: profile.full_name,
            mobileNumber: profile.mobile_number,
            countryCode: profile.country_code,
            countryName: profile.country_name,
            avatarUrl: profile.avatar_url,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at),
          },
        }
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err.message,
        status: err.status || 500
      },
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
      country_code: profile.countryCode,
      country_name: profile.countryName,
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