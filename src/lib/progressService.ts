import { supabase } from './supabase';

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
    bandScore: number;
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
  async getUserProgress(): Promise<ProgressData> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: testAttempts } = await supabase
      .from('test_attempts')
      .select(
        `
        *,
        tests (
          test_type
        )
      `
      )
      .eq('user_id', user.id)
      .eq('completion_status', 'completed')
      .not('band_score', 'is', null)
      .order('completed_at', { ascending: false });

    const attempts = testAttempts || [];

    const writingAttempts = attempts.filter((a: any) => a.tests?.test_type === 'writing');
    const readingAttempts = attempts.filter((a: any) => a.tests?.test_type === 'reading');
    const speakingAttempts = attempts.filter((a: any) => a.tests?.test_type === 'speaking');
    const listeningAttempts = attempts.filter((a: any) => a.tests?.test_type === 'listening');

    const sectionScores = {
      writing: this.calculateAverage(writingAttempts.map((a: any) => a.band_score)),
      reading: this.calculateAverage(readingAttempts.map((a: any) => a.band_score)),
      speaking: this.calculateAverage(speakingAttempts.map((a: any) => a.band_score)),
      listening: this.calculateAverage(listeningAttempts.map((a: any) => a.band_score)),
    };

    const overallScore = this.calculateAverage(Object.values(sectionScores).filter(score => score > 0));

    const totalTimeSpent = attempts.reduce((sum: number, a: any) => sum + (a.time_spent || 0), 0);
    const totalHours = Math.round((totalTimeSpent / 3600) * 10) / 10;

    const testsCompleted = attempts.length;

    const firstScore = attempts.length > 0 ? attempts[attempts.length - 1].band_score : overallScore;
    const improvement = firstScore > 0 ? ((overallScore - firstScore) / firstScore) * 100 : 0;

    const weakAreas = this.identifyWeakAreas(sectionScores);
    const recommendations = this.generateRecommendations(weakAreas);

    return {
      overallScore,
      sectionScores,
      recentTests: attempts.slice(0, 10).map((a: any) => ({
        date: a.completed_at || a.created_at,
        testType: a.tests?.test_type || 'Unknown',
        score: a.score || 0,
        bandScore: a.band_score || 0,
      })),
      studyStats: {
        totalHours,
        testsCompleted,
        currentStreak: 0,
        improvement: Math.round(improvement),
      },
      weakAreas,
      recommendations,
    };
  },

  async saveTestAttempt(testId: string, bandScore: number, score: number, timeSpent: number, aiFeedback: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: attempt, error } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_id: testId,
        band_score: bandScore,
        score: score,
        time_spent: timeSpent,
        completion_status: 'completed',
        ai_feedback: aiFeedback,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return attempt;
  },

  async saveUserAnswers(attemptId: string, answers: Array<{ questionId: string; answer: string; isCorrect: boolean }>) {
    const userAnswers = answers.map(a => ({
      attempt_id: attemptId,
      question_id: a.questionId,
      user_answer: a.answer,
      is_correct: a.isCorrect,
    }));

    const { error } = await supabase.from('user_answers').insert(userAnswers);

    if (error) throw error;
  },

  calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    const validScores = scores.filter(score => score > 0);
    if (validScores.length === 0) return 0;
    return Number((validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1));
  },

  identifyWeakAreas(sectionScores: any): string[] {
    const areas = [];
    const threshold = 6.5;

    if (sectionScores.writing > 0 && sectionScores.writing < threshold) areas.push('Writing');
    if (sectionScores.reading > 0 && sectionScores.reading < threshold) areas.push('Reading');
    if (sectionScores.speaking > 0 && sectionScores.speaking < threshold) areas.push('Speaking');
    if (sectionScores.listening > 0 && sectionScores.listening < threshold) areas.push('Listening');

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
