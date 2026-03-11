import { supabase } from './supabase';
import { calculateBandScore } from './bandScoreService';

export interface AnswerSubmission {
  questionId: string;
  userAnswer: string;
}

export interface ScoringResult {
  testId: string;
  score: number;
  bandScore: number;
  correctAnswers: number;
  totalQuestions: number;
  detailedResults: DetailedResult[];
}

export interface DetailedResult {
  questionNumber: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export async function submitListeningAnswers(
  testId: string,
  answers: AnswerSubmission[]
): Promise<ScoringResult> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  // Insert user answers
  const insertPromises = answers.map(answer =>
    supabase
      .from('user_listening_answers')
      .insert({
        user_id: user.id,
        question_id: answer.questionId,
        user_answer: answer.userAnswer,
      })
  );

  await Promise.all(insertPromises);

  // Calculate score
  const result = await calculateListeningScore(testId, answers);

  // Save result to listening_attempts
  const { data: savedAttempt, error: attemptError } = await supabase
    .from('listening_attempts')
    .insert({
      user_id: user.id,
      test_id: testId,
      correct_answers: result.correctAnswers,
      band_score: result.bandScore,
    })
    .select()
    .maybeSingle();

  if (attemptError) throw attemptError;

  return result;
}

async function calculateListeningScore(
  testId: string,
  userAnswers: AnswerSubmission[]
): Promise<ScoringResult> {
  // Fetch all questions for the test
  const { data: questionsData, error: questionsError } = await supabase
    .from('listening_questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_number', { ascending: true });

  if (questionsError) throw questionsError;

  // Fetch correct answers
  const questionIds = (questionsData || []).map(q => q.id);
  const { data: correctAnswersData, error: answersError } = await supabase
    .from('listening_answers')
    .select('question_id, correct_answer, acceptable_answers')
    .in('question_id', questionIds);

  if (answersError) throw answersError;

  // Create a map of correct answers
  const correctAnswersMap = new Map(
    (correctAnswersData || []).map(a => [a.question_id, {
      correct: a.correct_answer,
      acceptable: a.acceptable_answers || []
    }])
  );

  // Calculate score and detailed results
  let correctCount = 0;
  const detailedResults: DetailedResult[] = [];

  (questionsData || []).forEach(question => {
    const userAnswerObj = userAnswers.find(a => a.questionId === question.id);
    const userAnswer = userAnswerObj?.userAnswer || '';
    const answerData = correctAnswersMap.get(question.id);
    const correctAnswer = answerData?.correct || '';
    const acceptableAnswers = answerData?.acceptable || [];

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    const normalizedAcceptable = acceptableAnswers.map((ans: string) => normalizeAnswer(ans));

    const isCorrect =
      normalizedUserAnswer === normalizedCorrect ||
      normalizedAcceptable.includes(normalizedUserAnswer);

    if (isCorrect) correctCount++;

    detailedResults.push({
      questionNumber: question.question_number,
      questionText: question.question_text,
      userAnswer,
      correctAnswer,
      isCorrect,
    });
  });

  const bandScore = calculateBandScore(correctCount);

  return {
    testId,
    score: correctCount,
    bandScore,
    correctAnswers: correctCount,
    totalQuestions: questionsData?.length || 0,
    detailedResults,
  };
}

function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

export async function getUserListeningResults(testId?: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('listening_results')
    .select('*')
    .eq('user_id', user.id);

  if (testId) {
    query = query.eq('test_id', testId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getUserAnswersForQuestion(questionId: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_listening_answers')
    .select('user_answer')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) throw error;

  return data?.user_answer || null;
}
