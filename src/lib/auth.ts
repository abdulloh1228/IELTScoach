import { supabase } from './supabase';
import type { Profile } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string, phoneNumber: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Generate unique access code
    let accessCode = generateAccessCode();
    let isUnique = false;

    // Ensure access code is unique
    while (!isUnique) {
      const { data: existing } = await supabase
        .from('users')
        .select('access_code')
        .eq('access_code', accessCode)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        accessCode = generateAccessCode();
      }
    }

    // Create user record after successful signup
    if (data.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          phone_number: phoneNumber,
          access_code: accessCode,
        });

      if (userError) throw userError;
    }

    return { ...data, accessCode };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return {
        id: user.id,
        email: user.email!,
        profile: userData || undefined,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Update profile
  async updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.getCurrentUser().then(user => callback(user));
      } else {
        callback(null);
      }
    });
  },
};