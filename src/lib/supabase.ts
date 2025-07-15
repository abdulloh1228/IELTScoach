import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config:', { 
  url: supabaseUrl ? 'Set' : 'Missing', 
  key: supabaseAnonKey ? 'Set' : 'Missing' 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey });
  // Don't throw error immediately, let it fail gracefully
}


// Database types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  target_score: number;
  current_score: number;
  exam_date?: string;
  study_goal: string;
  country?: string;
  total_study_hours: number;
  tests_completed: number;
  current_streak: number;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  user_id: string;
  test_type: 'full_exam' | 'writing' | 'reading' | 'speaking' | 'listening';
  status: 'in_progress' | 'completed' | 'submitted';
  started_at: string;
  completed_at?: string;
  overall_score?: number;
  created_at: string;
}

export interface WritingSubmission {
  id: string;
  user_id: string;
  session_id?: string;
  task_type: 'task1' | 'task2';
  prompt: string;
  content: string;
  submission_type: 'typed' | 'uploaded';
  file_url?: string;
  word_count: number;
  band_score?: number;
  task_response?: number;
  coherence_cohesion?: number;
  lexical_resource?: number;
  grammatical_range?: number;
  ai_feedback: any;
  human_feedback_requested: boolean;
  human_feedback?: string;
  created_at: string;
}

export interface SpeakingRecording {
  id: string;
  user_id: string;
  session_id?: string;
  part_number: 1 | 2 | 3;
  question: string;
  recording_url?: string;
  duration: number;
  band_score?: number;
  fluency_coherence?: number;
  pronunciation?: number;
  lexical_resource?: number;
  grammatical_range?: number;
  ai_feedback: any;
  created_at: string;
}

export interface ReadingResponse {
  id: string;
  user_id: string;
  session_id?: string;
  passage_id: string;
  answers: any;
  correct_answers: any;
  score: number;
  total_questions: number;
  band_score?: number;
  time_taken: number;
  created_at: string;
}

export interface ListeningResponse {
  id: string;
  user_id: string;
  session_id?: string;
  audio_id: string;
  answers: any;
  correct_answers: any;
  score: number;
  total_questions: number;
  band_score?: number;
  created_at: string;
}

export interface DailyTip {
  id: string;
  category: 'grammar' | 'vocabulary' | 'writing' | 'speaking' | 'reading' | 'listening';
  title: string;
  content: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
}