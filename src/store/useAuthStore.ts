import { create } from 'zustand';
import { UserData } from '../types';
import { getCurrentUser, signIn, signOut, signUp, resetPassword as resetPasswordRequest } from '../services/supabase';

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, mobileNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data.user) {
        const { data: userData } = await getCurrentUser();
        if (userData?.user) {
          set({
            user: userData.user,
            isLoggedIn: true,
          });
        }
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to login' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (email, password, fullName, mobileNumber) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await signUp(email, password, fullName, mobileNumber);
      
      if (error) throw error;
      
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            profile: {
              id: '',
              fullName,
              mobileNumber,
              emailConfirmed: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          isLoggedIn: true,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to register' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ user: null, isLoggedIn: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to logout' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadUser: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await getCurrentUser();
      
      if (error) throw error;
      
      if (data?.user) {
        set({
          user: data.user,
          isLoggedIn: true,
        });
      }
    } catch (error) {
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await resetPasswordRequest(email);
      if (error) throw error;
      set({ error: 'Password reset link sent to your email' });
    } catch (error: any) {
      set({ error: error.message || 'Failed to send reset link' });
    } finally {
      set({ isLoading: false });
    }
  },
}));