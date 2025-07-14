import { supabase } from './supabase';
import type { Profile } from './supabase';

export interface ProgressData {
  overallScore: number;
  sectionScores: {
    writing: number;
    reading: number;
    speaking: number;
    listening: number;
  };
  recentTests: Array<{
    date: string;
    testType: string;
    score: number;
  }>;
  studyStats: {
    totalHours: number;
    testsCompleted: number;
    currentStreak: number;
    improvement: number;
  };
  weakAreas: string[];
  recommendations: string[];
}

export const progressService = {
  // Get comprehensive progress data
  async getUserProgress(): Promise<ProgressData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get recent test sessions
    const { data: testSessions } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    // Get recent writing submissions
    const { data: writingSubmissions } = await supabase
      .from('writing_submissions')
      .select('band_score, created_at')
      .eq('user_id', user.id)
      .not('band_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent speaking recordings
    const { data: speakingRecordings } = await supabase
      .from('speaking_recordings')
      .select('band_score, created_at')
      .eq('user_id', user.id)
      .not('band_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent reading responses
    const { data: readingResponses } = await supabase
      .from('reading_responses')
      .select('band_score, created_at')
      .eq('user_id', user.id)
      .not('band_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent listening responses
    const { data: listeningResponses } = await supabase
      .from('listening_responses')
      .select('band_score, created_at')
      .eq('user_id', user.id)
      .not('band_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate section averages
    const writingAvg = this.calculateAverage(writingSubmissions?.map(s => s.band_score) || []);
    const speakingAvg = this.calculateAverage(speakingRecordings?.map(s => s.band_score) || []);
    const readingAvg = this.calculateAverage(readingResponses?.map(s => s.band_score) || []);
    const listeningAvg = this.calculateAverage(listeningResponses?.map(s => s.band_score) || []);

    const sectionScores = {
      writing: writingAvg,
      reading: readingAvg,
      speaking: speakingAvg,
      listening: listeningAvg,
    };

    const overallScore = this.calculateAverage(Object.values(sectionScores).filter(score => score > 0));

    // Calculate improvement
    const firstScore = profile?.current_score || 0;
    const improvement = overallScore > 0 ? ((overallScore - firstScore) / firstScore) * 100 : 0;

    // Generate recommendations based on weak areas
    const weakAreas = this.identifyWeakAreas(sectionScores);
    const recommendations = this.generateRecommendations(weakAreas);

    return {
      overallScore,
      sectionScores,
      recentTests: (testSessions || []).map(session => ({
        date: session.completed_at || session.created_at,
        testType: session.test_type,
        score: session.overall_score || 0,
      })),
      studyStats: {
        totalHours: profile?.total_study_hours || 0,
        testsCompleted: profile?.tests_completed || 0,
        currentStreak: profile?.current_streak || 0,
        improvement: Math.round(improvement),
      },
      weakAreas,
      recommendations,
    };
  },

  // Update user statistics
  async updateUserStats(updates: Partial<Profile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
  },

  // Increment test completion count
  async incrementTestCompletion(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tests_completed')
      .eq('id', user.id)
      .single();

    if (profile) {
      await this.updateUserStats({
        tests_completed: (profile.tests_completed || 0) + 1,
      });
    }
  },

  // Add study time
  async addStudyTime(minutes: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('total_study_hours')
      .eq('id', user.id)
      .single();

    if (profile) {
      const additionalHours = minutes / 60;
      await this.updateUserStats({
        total_study_hours: (profile.total_study_hours || 0) + additionalHours,
      });
    }
  },

  // Helper functions
  calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    const validScores = scores.filter(score => score > 0);
    if (validScores.length === 0) return 0;
    return Number((validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1));
  },

  identifyWeakAreas(sectionScores: any): string[] {
    const areas = [];
    const threshold = 6.5; // Below this is considered weak

    if (sectionScores.writing < threshold) areas.push('Writing');
    if (sectionScores.reading < threshold) areas.push('Reading');
    if (sectionScores.speaking < threshold) areas.push('Speaking');
    if (sectionScores.listening < threshold) areas.push('Listening');

    return areas;
  },

  generateRecommendations(weakAreas: string[]): string[] {
    const recommendations = [];

    if (weakAreas.includes('Writing')) {
      recommendations.push('Practice essay structure and coherence');
      recommendations.push('Expand academic vocabulary');
    }
    if (weakAreas.includes('Speaking')) {
      recommendations.push('Record daily speaking practice');
      recommendations.push('Work on pronunciation and fluency');
    }
    if (weakAreas.includes('Reading')) {
      recommendations.push('Practice skimming and scanning techniques');
      recommendations.push('Build reading speed and comprehension');
    }
    if (weakAreas.includes('Listening')) {
      recommendations.push('Listen to various English accents daily');
      recommendations.push('Practice note-taking while listening');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue practicing all sections regularly');
      recommendations.push('Take full mock exams weekly');
    }

    return recommendations;
  },
};