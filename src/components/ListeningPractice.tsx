import React, { useState, useRef, useEffect } from 'react';
import { Volume2, CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import { fetchListeningTest, ListeningTestWithQuestions } from '../lib/listeningTestService';
import { submitListeningAnswers, ScoringResult } from '../lib/listeningAnswerService';
import QuestionRenderer from './QuestionRenderer';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ListeningPracticeProps {
  onNavigate: (page: Page) => void;
  testId?: string;
}

export default function ListeningPractice({ onNavigate, testId }: ListeningPracticeProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [listeningTest, setListeningTest] = useState<ListeningTestWithQuestions | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [testStarted, setTestStarted] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        let test;

        if (testId) {
          test = await fetchListeningTest(testId);
        } else {
          const { fetchAllListeningTests } = await import('../lib/listeningTestService');
          const allTests = await fetchAllListeningTests();

          if (allTests.length === 0) {
            throw new Error('No listening tests available');
          }

          test = await fetchListeningTest(allTests[0].id);
        }

        setListeningTest(test);
        setTimeRemaining(test.duration);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setAudioEnded(true);
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (testStarted && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [testStarted, showResults]);

  const startTest = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setTestStarted(true);
    }
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    await handleSubmit();
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!listeningTest) return;

    setIsSubmitting(true);
    try {
      const answerSubmissions = listeningTest.questions.map(q => ({
        questionId: q.id,
        userAnswer: answers[q.id] || '',
      }));

      const result = await submitListeningAnswers(listeningTest.id, answerSubmissions);
      setScoringResult(result);
      setShowResults(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" size={32} />
          <p className="text-gray-600 dark:text-gray-400">Loading listening test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <p className="text-red-700 dark:text-red-200 mb-4">{error}</p>
        <button
          onClick={() => onNavigate('exam-selector')}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          ← Back to Exams
        </button>
      </div>
    );
  }

  if (!listeningTest) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400">No test found</p>
      </div>
    );
  }

  if (showResults && scoringResult) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Listening Test Results</h1>
          <button
            onClick={() => onNavigate('exam-selector')}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Back to Exams
          </button>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Your Listening Band Score</h2>
          <div className="text-6xl font-bold mb-4">{scoringResult.bandScore.toFixed(1)}</div>
          <p className="text-orange-100 dark:text-orange-200">{scoringResult.correctAnswers} out of {scoringResult.totalQuestions} questions answered correctly</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Answer Review</h3>
          <div className="space-y-4">
            {scoringResult.detailedResults.map((result) => (
              <div key={result.questionNumber} className={`p-4 rounded-lg border-2 ${
                result.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900'
              }`}>
                <div className="flex items-start space-x-3">
                  <CheckCircle className={`mt-1 ${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{result.questionNumber}. {result.questionText}</p>
                    <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <p><span className="font-medium">Your answer:</span> {result.userAnswer || 'Not answered'}</p>
                      <p><span className="font-medium">Correct answer:</span> {result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{listeningTest.title}</h1>
          <button
            onClick={() => onNavigate('exam-selector')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Exams
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-6">
            <Volume2 className="text-orange-600 dark:text-orange-400" size={28} />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">IELTS Listening Test</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Test Structure</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>• 4 Sections (40 questions total)</li>
                <li>• Time: {Math.floor(listeningTest.duration / 60)} minutes</li>
                <li>• All sections displayed on one page</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Instructions</h3>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
                <li>• Audio will play automatically when you start</li>
                <li>• You can only listen ONCE - no pause, replay, or seek</li>
                <li>• Audio plays continuously from Part 1 to Part 4</li>
                <li>• Timer starts when audio begins</li>
                <li>• Auto-submit when time expires</li>
                <li>• You can scroll through all questions during the test</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-400 p-4 rounded">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Tips</h3>
              <ul className="text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>• Read all questions before starting</li>
                <li>• Use quality headphones</li>
                <li>• Write answers as you listen</li>
                <li>• Check spelling carefully</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startTest}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            >
              Start Listening Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questionsBySections = listeningTest.sections.length > 0
    ? listeningTest.sections.map(section => ({
        section,
        questions: listeningTest.questions.filter(
          q => q.questionNumber >= section.questionStart && q.questionNumber <= section.questionEnd
        )
      }))
    : [{
        section: null,
        questions: listeningTest.questions
      }];

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{listeningTest.title}</h1>

          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'
          }`}>
            <Clock size={20} className={timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
            <span className={`font-mono font-bold text-lg ${
              timeRemaining < 300 ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={listeningTest.audioUrl}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload noplaybackrate"
      />

      <div className="bg-orange-50 dark:bg-orange-900 border-l-4 border-orange-500 dark:border-orange-400 p-4 rounded flex items-start space-x-3">
        <AlertCircle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" size={20} />
        <div>
          <p className="font-medium text-orange-800 dark:text-orange-200">Audio is playing</p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Listen carefully and answer the questions. You cannot pause or replay the audio.
          </p>
        </div>
      </div>

      {questionsBySections.map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          {item.section && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Part {item.section.sectionNumber} (Questions {item.section.questionStart}–{item.section.questionEnd})
              </h2>
              {item.section.instructions && (
                <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded">
                  <p className="text-blue-700 dark:text-blue-300">{item.section.instructions}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {item.questions.map((question) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                answer={answers[question.id] || ''}
                onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                disabled={showResults}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            {Object.keys(answers).length}/{listeningTest.questions.length} questions answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-600 dark:bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </div>
    </div>
  );
}
