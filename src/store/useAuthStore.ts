import { create } from 'zustand';
import { UserData } from '../types';
import { getCurrentUser, signIn, signOut, signUp } from '../services/supabase';

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
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
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
          isLoggedIn: true,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to login' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) throw error;
      
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
          isLoggedIn: true,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to register' });
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
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
          isLoggedIn: true,
        });
      }
    } catch (error) {
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));