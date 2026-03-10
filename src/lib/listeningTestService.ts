import { supabase } from './supabase';

export interface ListeningTest {
  id: string;
  title: string;
  audioUrl: string;
  createdAt: string;
}

export interface ListeningQuestion {
  id: string;
  testId: string;
  questionNumber: number;
  questionText: string;
  createdAt: string;
}

export interface ListeningTestWithQuestions extends ListeningTest {
  questions: ListeningQuestion[];
}

export async function fetchListeningTest(testId: string): Promise<ListeningTestWithQuestions> {
  const { data: testData, error: testError } = await supabase
    .from('listening_tests')
    .select('*')
    .eq('id', testId)
    .maybeSingle();

  if (testError) throw testError;
  if (!testData) throw new Error('Test not found');

  const { data: questionsData, error: questionsError } = await supabase
    .from('listening_questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_number', { ascending: true });

  if (questionsError) throw questionsError;

  return {
    id: testData.id,
    title: testData.title,
    audioUrl: testData.audio_url,
    createdAt: testData.created_at,
    questions: (questionsData || []).map(q => ({
      id: q.id,
      testId: q.test_id,
      questionNumber: q.question_number,
      questionText: q.question_text,
      createdAt: q.created_at,
    })),
  };
}

export async function fetchAllListeningTests(): Promise<ListeningTest[]> {
  const { data, error } = await supabase
    .from('listening_tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(test => ({
    id: test.id,
    title: test.title,
    audioUrl: test.audio_url,
    createdAt: test.created_at,
  }));
}

export async function getTestQuestions(testId: string): Promise<ListeningQuestion[]> {
  const { data, error } = await supabase
    .from('listening_questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_number', { ascending: true });

  if (error) throw error;

  return (data || []).map(q => ({
    id: q.id,
    testId: q.test_id,
    questionNumber: q.question_number,
    questionText: q.question_text,
    createdAt: q.created_at,
  }));
}
