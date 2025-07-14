import { supabase } from './supabase';
import type { DailyTip } from './supabase';

export const dailyTipsService = {
  // Get daily tips based on user's weak areas
  async getDailyTips(limit: number = 3): Promise<DailyTip[]> {
    const { data, error } = await supabase
      .from('daily_tips')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get tips by category
  async getTipsByCategory(category: DailyTip['category']): Promise<DailyTip[]> {
    const { data, error } = await supabase
      .from('daily_tips')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get personalized tips based on user's progress
  async getPersonalizedTips(): Promise<DailyTip[]> {
    // This would integrate with the progress service to get weak areas
    // For now, return random tips from different categories
    const categories: DailyTip['category'][] = ['writing', 'speaking', 'reading', 'listening', 'grammar', 'vocabulary'];
    const randomCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 3);

    const tips: DailyTip[] = [];
    
    for (const category of randomCategories) {
      const { data } = await supabase
        .from('daily_tips')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .limit(1);
      
      if (data && data.length > 0) {
        tips.push(data[0]);
      }
    }

    return tips;
  },

  // Add a new tip (admin function)
  async addTip(tip: Omit<DailyTip, 'id' | 'created_at'>): Promise<DailyTip> {
    const { data, error } = await supabase
      .from('daily_tips')
      .insert(tip)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};