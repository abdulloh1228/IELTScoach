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

  // Mock AI feedback generation for writing
  async generateWritingFeedback(content: string, taskType: 'task1' | 'task2') {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const baseScore = Math.min(9, Math.max(4, 5 + (wordCount / 50)));

    return {
      band_score: Number((baseScore + Math.random() * 1.5).toFixed(1)),
      task_response: Number((baseScore + Math.random() * 1).toFixed(1)),
      coherence_cohesion: Number((baseScore + Math.random() * 1).toFixed(1)),
      lexical_resource: Number((baseScore + Math.random() * 1).toFixed(1)),
      grammatical_range: Number((baseScore + Math.random() * 1).toFixed(1)),
      ai_feedback: {
        strengths: [
          "Good task achievement with clear position",
          "Appropriate use of examples and explanations",
          "Generally well-organized structure"
        ],
        improvements: [
          "Consider using more varied cohesive devices",
          "Expand vocabulary with more sophisticated synonyms",
          "Work on complex sentence structures"
        ],
        suggestions: [
          "Practice using conditional sentences",
          "Learn more academic vocabulary",
          "Focus on paragraph transitions"
        ]
      }
    };
  },

  // Mock AI feedback generation for speaking
  async generateSpeakingFeedback(partNumber: number) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const baseScore = 6 + Math.random() * 2;

    return {
      band_score: Number(baseScore.toFixed(1)),
      fluency_coherence: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      pronunciation: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      lexical_resource: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      grammatical_range: Number((baseScore + Math.random() * 0.5).toFixed(1)),
      ai_feedback: {
        strengths: [
          "Good fluency with natural rhythm",
          "Clear pronunciation of most sounds",
          "Appropriate use of vocabulary"
        ],
        improvements: [
          "Work on specific sound pronunciation",
          "Use more varied vocabulary",
          "Practice complex grammatical structures"
        ],
        suggestions: [
          "Record yourself daily",
          "Practice tongue twisters",
          "Learn idiomatic expressions"
        ]
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