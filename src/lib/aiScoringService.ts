export interface AIFeedback {
  band_score: number;
  task_achievement?: string;
  coherence_cohesion?: string;
  lexical_resource?: string;
  grammatical_range?: string;
  pronunciation?: string;
  fluency?: string;
  overall_feedback: string;
}

export interface ScoringRequest {
  test_type: 'listening' | 'writing' | 'speaking' | 'reading';
  user_answers: Array<{
    question_id: string;
    answer: string;
  }>;
  correct_answers?: Array<{
    question_id: string;
    correct_answer: string;
  }>;
}

function generateMockBandScore(): number {
  const min = 5.0;
  const max = 8.5;
  const score = Math.random() * (max - min) + min;
  return Math.round(score * 2) / 2;
}

function generateMockWritingFeedback(bandScore: number): AIFeedback {
  const feedbackTemplates = {
    task_achievement: [
      'Good response with clear position. Some details could be expanded.',
      'Adequate response but main ideas need more support.',
      'Strong task response with well-developed ideas.',
      'Task addressed but some parts lack clarity.',
    ],
    coherence_cohesion: [
      'Logical structure with clear progression. Transitions could be smoother.',
      'Good organization but some paragraphs lack cohesion.',
      'Excellent flow with effective use of cohesive devices.',
      'Structure is adequate but connections between ideas need improvement.',
    ],
    lexical_resource: [
      'Adequate vocabulary range with some repetition.',
      'Good use of vocabulary but occasional imprecision.',
      'Wide range of vocabulary used accurately.',
      'Limited vocabulary range with noticeable repetition.',
    ],
    grammatical_range: [
      'Mostly accurate grammar with minor errors.',
      'Good range of structures with some errors.',
      'Excellent grammatical control with rare errors.',
      'Basic grammar mostly accurate but limited complexity.',
    ],
  };

  const getRandomFeedback = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return {
    band_score: bandScore,
    task_achievement: getRandomFeedback(feedbackTemplates.task_achievement),
    coherence_cohesion: getRandomFeedback(feedbackTemplates.coherence_cohesion),
    lexical_resource: getRandomFeedback(feedbackTemplates.lexical_resource),
    grammatical_range: getRandomFeedback(feedbackTemplates.grammatical_range),
    overall_feedback: `Your overall performance shows ${
      bandScore >= 7.5 ? 'strong' : bandScore >= 6.5 ? 'good' : 'developing'
    } English proficiency. ${
      bandScore >= 7.5
        ? 'Continue practicing to maintain consistency.'
        : 'Focus on expanding vocabulary and improving grammatical accuracy.'
    }`,
  };
}

function generateMockListeningFeedback(score: number, totalQuestions: number): AIFeedback {
  const percentage = (score / totalQuestions) * 100;
  let bandScore = 5.0;

  if (percentage >= 90) bandScore = 8.5;
  else if (percentage >= 82) bandScore = 8.0;
  else if (percentage >= 75) bandScore = 7.5;
  else if (percentage >= 68) bandScore = 7.0;
  else if (percentage >= 60) bandScore = 6.5;
  else if (percentage >= 50) bandScore = 6.0;
  else if (percentage >= 40) bandScore = 5.5;

  return {
    band_score: bandScore,
    overall_feedback: `You answered ${score} out of ${totalQuestions} questions correctly (${percentage.toFixed(
      1
    )}%). ${
      bandScore >= 7.5
        ? 'Excellent listening comprehension!'
        : bandScore >= 6.5
        ? 'Good performance. Practice with various accents.'
        : 'Keep practicing to improve note-taking and prediction skills.'
    }`,
  };
}

function generateMockSpeakingFeedback(bandScore: number): AIFeedback {
  return {
    band_score: bandScore,
    fluency: bandScore >= 7 ? 'Good fluency with minimal hesitation.' : 'Some hesitation affects fluency.',
    pronunciation:
      bandScore >= 7 ? 'Clear pronunciation with good intonation.' : 'Pronunciation needs improvement.',
    lexical_resource: bandScore >= 7 ? 'Good vocabulary range.' : 'Limited vocabulary affects expression.',
    grammatical_range: bandScore >= 7 ? 'Mostly accurate grammar.' : 'Grammar errors affect clarity.',
    overall_feedback: `Your speaking shows ${
      bandScore >= 7.5 ? 'strong' : bandScore >= 6.5 ? 'good' : 'developing'
    } communication skills.`,
  };
}

function generateMockReadingFeedback(score: number, totalQuestions: number): AIFeedback {
  const percentage = (score / totalQuestions) * 100;
  let bandScore = 5.0;

  if (percentage >= 90) bandScore = 8.5;
  else if (percentage >= 82) bandScore = 8.0;
  else if (percentage >= 75) bandScore = 7.5;
  else if (percentage >= 68) bandScore = 7.0;
  else if (percentage >= 60) bandScore = 6.5;
  else if (percentage >= 50) bandScore = 6.0;
  else if (percentage >= 40) bandScore = 5.5;

  return {
    band_score: bandScore,
    overall_feedback: `You answered ${score} out of ${totalQuestions} questions correctly. ${
      bandScore >= 7.5
        ? 'Excellent reading comprehension and analysis skills!'
        : 'Focus on skimming and scanning techniques to improve speed and accuracy.'
    }`,
  };
}

export const aiScoringService = {
  async scoreTest(request: ScoringRequest): Promise<AIFeedback> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    switch (request.test_type) {
      case 'writing':
        return generateMockWritingFeedback(generateMockBandScore());

      case 'listening': {
        let correctCount = 0;
        if (request.correct_answers) {
          request.user_answers.forEach(userAnswer => {
            const correct = request.correct_answers?.find(ca => ca.question_id === userAnswer.question_id);
            if (correct && userAnswer.answer.trim().toLowerCase() === correct.correct_answer.trim().toLowerCase()) {
              correctCount++;
            }
          });
        }
        return generateMockListeningFeedback(correctCount, request.user_answers.length);
      }

      case 'speaking':
        return generateMockSpeakingFeedback(generateMockBandScore());

      case 'reading': {
        let correctCount = 0;
        if (request.correct_answers) {
          request.user_answers.forEach(userAnswer => {
            const correct = request.correct_answers?.find(ca => ca.question_id === userAnswer.question_id);
            if (correct && userAnswer.answer.trim().toLowerCase() === correct.correct_answer.trim().toLowerCase()) {
              correctCount++;
            }
          });
        }
        return generateMockReadingFeedback(correctCount, request.user_answers.length);
      }

      default:
        return {
          band_score: generateMockBandScore(),
          overall_feedback: 'Test completed successfully.',
        };
    }
  },

  async getBandScoreFromPercentage(percentage: number): Promise<number> {
    if (percentage >= 90) return 8.5;
    if (percentage >= 82) return 8.0;
    if (percentage >= 75) return 7.5;
    if (percentage >= 68) return 7.0;
    if (percentage >= 60) return 6.5;
    if (percentage >= 50) return 6.0;
    if (percentage >= 40) return 5.5;
    return 5.0;
  },
};
