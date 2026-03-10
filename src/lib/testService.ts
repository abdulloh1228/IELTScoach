import { supabase } from './supabase';

export const testService = {
  async getTestsByType(testType: 'listening' | 'writing' | 'speaking' | 'reading', section: 'practice' | 'full_mock') {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('test_type', testType)
      .eq('section', section)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTestQuestions(testId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCorrectAnswers(questionIds: string[]) {
    const { data, error } = await supabase.from('answers').select('*').in('question_id', questionIds);

    if (error) throw error;
    return data || [];
  },

  async createTestAttempt(testId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_id: testId,
        completion_status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeTestAttempt(
    attemptId: string,
    bandScore: number,
    score: number,
    timeSpent: number,
    aiFeedback: any
  ) {
    const { data, error } = await supabase
      .from('test_attempts')
      .update({
        band_score: bandScore,
        score: score,
        time_spent: timeSpent,
        ai_feedback: aiFeedback,
        completion_status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async saveUserAnswers(
    attemptId: string,
    answers: Array<{ questionId: string; answer: string; isCorrect: boolean }>
  ) {
    const userAnswers = answers.map(a => ({
      attempt_id: attemptId,
      question_id: a.questionId,
      user_answer: a.answer,
      is_correct: a.isCorrect,
    }));

    const { error } = await supabase.from('user_answers').insert(userAnswers);

    if (error) throw error;
  },

  async getUserTestHistory(testType?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('test_attempts')
      .select(
        `
        *,
        tests (
          title,
          test_type,
          section
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (testType) {
      query = query.eq('tests.test_type', testType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};
