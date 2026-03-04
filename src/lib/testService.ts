import { supabase } from './supabase';
import type { TestSession, WritingSubmission, SpeakingRecording, ReadingResponse, ListeningResponse } from './supabase';

export const testService = {
  // Create a new test session
  async createTestSession(testType: TestSession['test_type']): Promise<TestSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('test_sessions')
      .insert({
        user_id: user.id,
        test_type: testType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Complete a test session
  async completeTestSession(sessionId: string, overallScore?: number): Promise<void> {
    const { error } = await supabase
      .from('test_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        overall_score: overallScore,
      })
      .eq('id', sessionId);

    if (error) throw error;
  },

  // Submit writing essay
  async submitWritingEssay(submission: Omit<WritingSubmission, 'id' | 'user_id' | 'created_at'>): Promise<WritingSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate word count
    const wordCount = submission.content.split(/\s+/).filter(word => word.length > 0).length;

    // Generate AI feedback (mock implementation)
    const aiFeedback = await this.generateWritingFeedback(submission.content, submission.task_type);

    const { data, error } = await supabase
      .from('writing_submissions')
      .insert({
        ...submission,
        user_id: user.id,
        word_count: wordCount,
        ...aiFeedback,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit speaking recording
  async submitSpeakingRecording(recording: Omit<SpeakingRecording, 'id' | 'user_id' | 'created_at'>): Promise<SpeakingRecording> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate AI feedback (mock implementation)
    const aiFeedback = await this.generateSpeakingFeedback(recording.part_number);

    const { data, error } = await supabase
      .from('speaking_recordings')
      .insert({
        ...recording,
        user_id: user.id,
        ...aiFeedback,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit reading responses
  async submitReadingResponse(response: Omit<ReadingResponse, 'id' | 'user_id' | 'created_at'>): Promise<ReadingResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate score and band
    const score = this.calculateReadingScore(response.answers, response.correct_answers);
    const bandScore = this.calculateBandScore(score, response.total_questions);

    const { data, error } = await supabase
      .from('reading_responses')
      .insert({
        ...response,
        user_id: user.id,
        score,
        band_score: bandScore,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit listening responses
  async submitListeningResponse(response: Omit<ListeningResponse, 'id' | 'user_id' | 'created_at'>): Promise<ListeningResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate score and band
    const score = this.calculateListeningScore(response.answers, response.correct_answers);
    const bandScore = this.calculateBandScore(score, response.total_questions);

    const { data, error } = await supabase
      .from('listening_responses')
      .insert({
        ...response,
        user_id: user.id,
        score,
        band_score: bandScore,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's test history
  async getUserTestHistory(): Promise<TestSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user's writing submissions
  async getUserWritingSubmissions(): Promise<WritingSubmission[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('writing_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Generate default writing band score (ready for GPT API integration)
  async generateWritingFeedback(content: string, taskType: 'task1' | 'task2') {
    // Ready for GPT API integration - currently returns default scores
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    // Default band scores for now
    const defaultBandScore = 6.5;

    return {
      band_score: defaultBandScore,
      task_response: defaultBandScore,
      coherence_cohesion: defaultBandScore,
      lexical_resource: defaultBandScore,
      grammatical_range: defaultBandScore,
      ai_feedback: {
        strengths: [],
        improvements: [],
        suggestions: []
      }
    };
  },

  // Generate default speaking band score (ready for GPT API integration)
  async generateSpeakingFeedback(partNumber: number) {
    // Ready for GPT API integration - currently returns default scores
    const defaultBandScore = 6.5;

    return {
      band_score: defaultBandScore,
      fluency_coherence: defaultBandScore,
      pronunciation: defaultBandScore,
      lexical_resource: defaultBandScore,
      grammatical_range: defaultBandScore,
      ai_feedback: {
        strengths: [],
        improvements: [],
        suggestions: []
      }
    };
  },

  // Calculate reading/listening scores
  calculateReadingScore(userAnswers: any, correctAnswers: any): number {
    let correct = 0;
    Object.keys(correctAnswers).forEach(key => {
      if (userAnswers[key] && userAnswers[key].toLowerCase() === correctAnswers[key].toLowerCase()) {
        correct++;
      }
    });
    return correct;
  },

  calculateListeningScore(userAnswers: any, correctAnswers: any): number {
    return this.calculateReadingScore(userAnswers, correctAnswers);
  },

  // Convert raw score to band score
  calculateBandScore(score: number, total: number): number {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 9.0;
    if (percentage >= 80) return 8.0;
    if (percentage >= 70) return 7.0;
    if (percentage >= 60) return 6.0;
    if (percentage >= 50) return 5.0;
    if (percentage >= 40) return 4.0;
    return 3.0;
  },
};