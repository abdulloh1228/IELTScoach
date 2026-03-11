import { supabase } from './supabase';

export interface ListeningTest {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
}

export interface ListeningSection {
  id: string;
  testId: string;
  sectionNumber: number;
  questionStart: number;
  questionEnd: number;
  instructions: string;
}

export interface ListeningQuestion {
  id: string;
  testId: string;
  questionNumber: number;
  sectionNumber: number;
  questionText: string;
  questionType: 'form_completion' | 'table_completion' | 'note_completion' | 'sentence_completion' | 'multiple_choice' | 'matching' | 'map_labeling';
  imageUrl?: string;
  tableStructure?: any;
  options?: string[];
  createdAt: string;
}

export interface ListeningTestWithQuestions extends ListeningTest {
  sections: ListeningSection[];
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

  const { data: sectionsData, error: sectionsError } = await supabase
    .from('listening_sections')
    .select('*')
    .eq('test_id', testId)
    .order('section_number', { ascending: true });

  if (sectionsError) throw sectionsError;

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
    duration: testData.duration || 1800,
    createdAt: testData.created_at,
    sections: (sectionsData || []).map(s => ({
      id: s.id,
      testId: s.test_id,
      sectionNumber: s.section_number,
      questionStart: s.question_start,
      questionEnd: s.question_end,
      instructions: s.instructions || '',
    })),
    questions: (questionsData || []).map(q => ({
      id: q.id,
      testId: q.test_id,
      questionNumber: q.question_number,
      sectionNumber: q.section_number || 1,
      questionText: q.question_text,
      questionType: q.question_type || 'form_completion',
      imageUrl: q.image_url,
      tableStructure: q.table_structure,
      options: q.options,
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
    duration: test.duration || 1800,
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
    sectionNumber: q.section_number || 1,
    questionText: q.question_text,
    questionType: q.question_type || 'form_completion',
    imageUrl: q.image_url,
    tableStructure: q.table_structure,
    options: q.options,
    createdAt: q.created_at,
  }));
}
