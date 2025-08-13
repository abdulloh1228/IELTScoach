import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('Supabase not configured, running in demo mode');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Set up auth state listener
        const { data } = authService.onAuthStateChange((user) => {
          setUser(user);
        });

        // Store subscription for cleanup
        return data?.subscription;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const subscription = initAuth();

    // Cleanup function
    return () => {
      subscription?.then(sub => {
        if (sub?.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    try {
      const { user } = await authService.signIn(email, password);
      if (user) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    try {
      const { user } = await authService.signUp(email, password, fullName);
      if (user) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still clear user state even if sign out fails
      setUser(null);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const updatedProfile = await authService.updateProfile(updates);
      if (user) {
        setUser({ ...user, profile: updatedProfile });
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}