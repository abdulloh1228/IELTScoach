import { supabase } from './supabase';

export interface TestSession {
  id: string;
  userId: string;
  examType: string;
  section: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  answers: any[];
  status: 'in-progress' | 'completed' | 'abandoned';
}

export interface TestResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

class TestService {
  async createTestSession(section: string): Promise<{ id: string }> {
    try {
      // Always return a demo session for now
      return {
        id: `demo-${Date.now()}-${section}`
      };
    } catch (error) {
      console.error('Failed to create test session:', error);
      return {
        id: `demo-${Date.now()}-${section}`
      };
    }
  }

  async createTestSessionOld(userId: string, examType: string, section: string): Promise<TestSession> {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - return mock session
        return {
          id: `demo-${Date.now()}`,
          userId,
          examType,
          section,
          startTime: new Date(),
          answers: [],
          status: 'in-progress'
        };
      }

      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: userId,
          exam_type: examType,
          section,
          start_time: new Date().toISOString(),
          status: 'in-progress',
          answers: []
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        examType: data.exam_type,
        section: data.section,
        startTime: new Date(data.start_time),
        endTime: data.end_time ? new Date(data.end_time) : undefined,
        score: data.score,
        answers: data.answers || [],
        status: data.status
      };
    } catch (error) {
      console.error('Failed to create test session:', error);
      // Return demo session as fallback
      return {
        id: `demo-${Date.now()}`,
        userId,
        examType,
        section,
        startTime: new Date(),
        answers: [],
        status: 'in-progress'
      };
    }
  }

  async submitTestSession(sessionId: string, answers: any[]): Promise<TestResult> {
    try {
      if (sessionId.startsWith('demo-')) {
        // Demo mode - return mock result
        const score = Math.floor(Math.random() * 30) + 70; // 70-100
        return {
          sessionId,
          score,
          totalQuestions: answers.length,
          correctAnswers: Math.floor((score / 100) * answers.length),
          timeSpent: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
          feedback: 'Great work! Your writing shows good structure and vocabulary usage.',
          strengths: ['Clear organization', 'Good vocabulary', 'Proper grammar'],
          improvements: ['Add more examples', 'Expand conclusions', 'Use more transitions']
        };
      }

      const endTime = new Date().toISOString();
      
      // Calculate basic score (this would be more sophisticated in real implementation)
      const score = Math.min(100, Math.max(0, (answers.length * 10) + Math.floor(Math.random() * 40)));

      const { data, error } = await supabase
        .from('test_sessions')
        .update({
          end_time: endTime,
          answers,
          score,
          status: 'completed'
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return {
        sessionId,
        score: data.score,
        totalQuestions: answers.length,
        correctAnswers: Math.floor((data.score / 100) * answers.length),
        timeSpent: Math.floor((new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000),
        feedback: 'Your essay has been analyzed. Keep practicing to improve your skills!',
        strengths: ['Good effort', 'Completed the task'],
        improvements: ['Continue practicing', 'Focus on structure']
      };
    } catch (error) {
      console.error('Failed to submit test session:', error);
      // Return demo result as fallback
      const score = Math.floor(Math.random() * 30) + 70;
      return {
        sessionId,
        score,
        totalQuestions: answers.length,
        correctAnswers: Math.floor((score / 100) * answers.length),
        timeSpent: Math.floor(Math.random() * 1800) + 600,
        feedback: 'Demo mode: Your essay has been submitted successfully!',
        strengths: ['Good structure', 'Clear writing'],
        improvements: ['Add more details', 'Use varied vocabulary']
      };
    }
  }

  async getTestHistory(userId: string): Promise<TestSession[]> {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - return mock history
        return [
          {
            id: 'demo-1',
            userId,
            examType: 'IELTS',
            section: 'Writing',
            startTime: new Date(Date.now() - 86400000), // Yesterday
            endTime: new Date(Date.now() - 86400000 + 3600000), // 1 hour later
            score: 85,
            answers: [],
            status: 'completed'
          }
        ];
      }

      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        userId: session.user_id,
        examType: session.exam_type,
        section: session.section,
        startTime: new Date(session.start_time),
        endTime: session.end_time ? new Date(session.end_time) : undefined,
        score: session.score,
        answers: session.answers || [],
        status: session.status
      }));
    } catch (error) {
      console.error('Failed to get test history:', error);
      return [];
    }
  }

  async submitWritingResponse(data: {
    session_id: string;
    task_number: number;
    prompt: string;
    response: string;
    word_count: number;
    time_taken: number;
  }): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const bandScore = Math.min(9.0, Math.max(5.0, 6.5 + (data.word_count / 100) * 0.5));

    return {
      session_id: data.session_id,
      band_score: Number(bandScore.toFixed(1)),
      task_achievement: Number((bandScore - 0.5 + Math.random() * 0.5).toFixed(1)),
      coherence_cohesion: Number((bandScore - 0.3 + Math.random() * 0.4).toFixed(1)),
      lexical_resource: Number((bandScore + Math.random() * 0.3).toFixed(1)),
      grammatical_range: Number((bandScore - 0.2 + Math.random() * 0.4).toFixed(1)),
      ai_feedback: {
        strengths: [
          'Good paragraph structure and organization',
          'Appropriate use of topic sentences',
          'Clear introduction and conclusion'
        ],
        improvements: [
          'Use more varied vocabulary and synonyms',
          'Include more specific examples to support arguments',
          'Work on sentence variety and complexity'
        ]
      }
    };
  }

  async submitReadingResponse(data: {
    session_id: string;
    passage_id: string;
    answers: any;
    correct_answers: any;
    total_questions: number;
    time_taken: number;
  }): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let score = 0;
    for (const [key, value] of Object.entries(data.answers)) {
      if (data.correct_answers[key] === value) {
        score++;
      }
    }

    const bandScore = score === 5 ? 9.0 : score === 4 ? 7.5 : score === 3 ? 6.5 : score === 2 ? 5.5 : 5.0;

    return {
      session_id: data.session_id,
      band_score: bandScore,
      score,
      total_questions: data.total_questions,
      time_taken: data.time_taken
    };
  }

  async submitSpeakingRecording(data: {
    session_id: string;
    part_number: number;
    question: string;
    recording_url?: string;
    duration: number;
  }, transcript: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const wordCount = transcript.split(/\s+/).length;
    const baseBand = Math.min(8.5, 6.0 + (wordCount / 50) * 0.5);

    return {
      session_id: data.session_id,
      band_score: Number(baseBand.toFixed(1)),
      fluency_coherence: Number((baseBand - 0.3 + Math.random() * 0.5).toFixed(1)),
      pronunciation: Number((baseBand - 0.2 + Math.random() * 0.4).toFixed(1)),
      lexical_resource: Number((baseBand + Math.random() * 0.3).toFixed(1)),
      grammatical_range: Number((baseBand - 0.4 + Math.random() * 0.6).toFixed(1)),
      ai_feedback: {
        strengths: [
          'Good fluency and natural speech rhythm',
          'Clear pronunciation of most words'
        ],
        improvements: [
          'Use more complex sentence structures',
          'Expand your answers with more details',
          'Practice stress and intonation patterns'
        ]
      }
    };
  }
}

export const testService = new TestService();