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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip auth initialization if no Supabase config
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Get initial user with timeout
    const initAuth = async () => {
      try {
        const user = await Promise.race([
          authService.getCurrentUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000))
        ]);
        setUser(user as AuthUser | null);
      } catch (error) {
        console.log('Auth initialization failed, continuing without auth');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    let subscription: any;
    try {
      const { data } = authService.onAuthStateChange((user) => {
        setUser(user);
      });
      subscription = data?.subscription;
    } catch (error) {
      console.log('Auth listener setup failed');
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await authService.signUp(email, password, fullName);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.log('Sign out failed');
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