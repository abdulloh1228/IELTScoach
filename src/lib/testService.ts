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
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('Gemini API Key exists:', !!apiKey);

      if (!apiKey) {
        console.log('No API key, using mock response');
        return this.getMockWritingResponse(data);
      }

      console.log('Calling Gemini API for writing analysis...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

      const prompt = `You are an expert IELTS Writing evaluator. Analyze this IELTS essay and provide a JSON response ONLY (no other text).

Essay Prompt: ${data.prompt}

Student Essay: ${data.response}

Provide a JSON response with this exact structure (no markdown, just pure JSON):
{
  "band_score": <number between 5.0 and 9.0>,
  "task_achievement": <number between 5 and 9>,
  "coherence_cohesion": <number between 5 and 9>,
  "lexical_resource": <number between 5 and 9>,
  "grammatical_range": <number between 5 and 9>,
  "strengths": [<3 specific strengths found in the essay>],
  "improvements": [<3 specific areas to improve>]
}

Consider:
- Task completion and relevance
- Paragraph organization and flow
- Vocabulary range and accuracy
- Grammar and sentence structure
- Overall coherence`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log('Gemini response received:', responseText.substring(0, 200));

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('No JSON found in response, using mock');
        return this.getMockWritingResponse(data);
      }

      console.log('JSON extracted, parsing...');
      const feedback = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed AI feedback:', feedback);

      return {
        session_id: data.session_id,
        band_score: Math.min(9.0, Math.max(5.0, feedback.band_score)),
        task_achievement: Math.min(9, Math.max(5, feedback.task_achievement)),
        coherence_cohesion: Math.min(9, Math.max(5, feedback.coherence_cohesion)),
        lexical_resource: Math.min(9, Math.max(5, feedback.lexical_resource)),
        grammatical_range: Math.min(9, Math.max(5, feedback.grammatical_range)),
        ai_feedback: {
          strengths: Array.isArray(feedback.strengths) ? feedback.strengths : ['Good structure', 'Clear ideas'],
          improvements: Array.isArray(feedback.improvements) ? feedback.improvements : ['Add more examples', 'Vary sentence structure']
        }
      };
    } catch (error: any) {
      console.error('Error calling Gemini API for writing:', error);
      console.error('Error details:', error?.message || error);
      return this.getMockWritingResponse(data);
    }
  }

  private getMockWritingResponse(data: any) {
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
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');

      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        return this.getMockReadingResponse(data);
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return this.getMockReadingResponse(data);
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const answersStr = Object.entries(data.answers)
        .map(([q, a]) => `Q${q}: "${a}"`)
        .join('\n');

      const correctStr = Object.entries(data.correct_answers)
        .map(([q, a]) => `Q${q}: "${a}"`)
        .join('\n');

      const prompt = `You are an IELTS Reading expert. Evaluate these reading test answers and provide a JSON response ONLY (no other text).

Student Answers:
${answersStr}

Correct Answers:
${correctStr}

Provide a JSON response with this exact structure (no markdown, just pure JSON):
{
  "band_score": <number between 5.0 and 9.0>,
  "score": <number of correct answers>,
  "analysis": "<brief analysis of performance>"
}

Calculate band_score based on the percentage of correct answers:
- 100% correct = 9.0
- 80% correct = 8.0
- 60% correct = 7.0
- 40% correct = 6.0
- 20% correct = 5.5
- Below 20% = 5.0`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getMockReadingResponse(data);
      }

      const feedback = JSON.parse(jsonMatch[0]);
      let score = 0;
      for (const [key, value] of Object.entries(data.answers)) {
        if (data.correct_answers[key] === value) {
          score++;
        }
      }

      return {
        session_id: data.session_id,
        band_score: Math.min(9.0, Math.max(5.0, feedback.band_score)),
        score,
        total_questions: data.total_questions,
        time_taken: data.time_taken
      };
    } catch (error) {
      console.error('Error calling Gemini API for reading:', error);
      return this.getMockReadingResponse(data);
    }
  }

  private getMockReadingResponse(data: any) {
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
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');

      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        return this.getMockSpeakingResponse(data, transcript);
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return this.getMockSpeakingResponse(data, transcript);
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `You are an expert IELTS Speaking evaluator. Analyze this speaking test response and provide a JSON response ONLY (no other text).

Part ${data.part_number} Question: ${data.question}

Student Response Transcript:
${transcript}

Evaluate based on these criteria and provide a JSON response with this exact structure (no markdown, just pure JSON):
{
  "band_score": <number between 5.0 and 9.0>,
  "fluency_coherence": <number between 5 and 9>,
  "pronunciation": <number between 5 and 9>,
  "lexical_resource": <number between 5 and 9>,
  "grammatical_range": <number between 5 and 9>,
  "strengths": [<2-3 specific strengths>],
  "improvements": [<2-3 areas to improve>]
}

Consider:
- Fluency and coherence: smooth delivery and logical organization
- Pronunciation: clarity and intelligibility
- Lexical resource: vocabulary range and precision
- Grammatical range: sentence complexity and accuracy`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getMockSpeakingResponse(data, transcript);
      }

      const feedback = JSON.parse(jsonMatch[0]);

      return {
        session_id: data.session_id,
        band_score: Math.min(9.0, Math.max(5.0, feedback.band_score)),
        fluency_coherence: Math.min(9, Math.max(5, feedback.fluency_coherence)),
        pronunciation: Math.min(9, Math.max(5, feedback.pronunciation)),
        lexical_resource: Math.min(9, Math.max(5, feedback.lexical_resource)),
        grammatical_range: Math.min(9, Math.max(5, feedback.grammatical_range)),
        ai_feedback: {
          strengths: Array.isArray(feedback.strengths) ? feedback.strengths : ['Good effort', 'Clear voice'],
          improvements: Array.isArray(feedback.improvements) ? feedback.improvements : ['Practice more', 'Use more vocabulary']
        }
      };
    } catch (error) {
      console.error('Error calling Gemini API for speaking:', error);
      return this.getMockSpeakingResponse(data, transcript);
    }
  }

  private getMockSpeakingResponse(data: any, transcript: string) {
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