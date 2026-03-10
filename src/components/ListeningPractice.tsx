import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Clock, CheckCircle, X, Loader2 } from 'lucide-react';
import { fetchListeningTest, ListeningTestWithQuestions } from '../lib/listeningTestService';
import { submitListeningAnswers, ScoringResult } from '../lib/listeningAnswerService';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ListeningPracticeProps {
  onNavigate: (page: Page) => void;
  testId?: string;
}

export default function ListeningPractice({ onNavigate, testId = 'test-1' }: ListeningPracticeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [listeningTest, setListeningTest] = useState<ListeningTestWithQuestions | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        const test = await fetchListeningTest(testId);
        setListeningTest(test);
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

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime + seconds);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            onClick={() => {setShowResults(false); setAnswers({})}}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Try Another Test
          </button>
        </div>

        {/* Score Overview */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Your Listening Band Score</h2>
          <div className="text-6xl font-bold mb-4">{scoringResult.bandScore.toFixed(1)}</div>
          <p className="text-orange-100 dark:text-orange-200">{scoringResult.correctAnswers} out of {scoringResult.totalQuestions} questions answered correctly</p>
        </div>

        {/* Detailed Results */}
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{listeningTest.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">IELTS Listening Test Section</p>
        </div>
        <button
          onClick={() => onNavigate('exam-selector')}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          ← Back to Exams
        </button>
      </div>

      {/* Audio Player */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 className="text-orange-600 dark:text-orange-400" size={20} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audio Player</h2>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 rounded-lg p-6 border border-orange-100 dark:border-orange-800">
          <audio
            ref={audioRef}
            src={listeningTest.audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div className="flex items-center justify-center space-x-6 mb-4">
            <button
              onClick={() => handleSkipSeconds(-10)}
              className="p-2 bg-white dark:bg-gray-700 rounded-full shadow hover:shadow-md transition-shadow text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={handlePlay}
              className="w-16 h-16 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={() => handleSkipSeconds(10)}
              className="p-2 bg-white dark:bg-gray-700 rounded-full shadow hover:shadow-md transition-shadow text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <RotateCcw size={20} className="rotate-180" />
            </button>

            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="font-mono text-gray-700 dark:text-gray-300 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer"
            onClick={(e) => {
              if (!audioRef.current || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = percent * duration;
            }}
          >
            <div
              className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
            {isPlaying ? 'Audio is playing...' : 'Click play to start the listening exercise'}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Instructions</h3>
        <p className="text-blue-700 dark:text-blue-300">
          You will hear a conversation between a student and a university receptionist. 
          Listen carefully and answer the questions below. You will hear the recording ONCE only.
        </p>
      </div>

      {/* Questions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Questions</h2>

        <div className="space-y-6">
          {listeningTest.questions.map((question, index) => (
            <div key={question.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <p className="font-medium text-gray-800 dark:text-gray-100 mb-4">
                {index + 1}. {question.questionText}
              </p>

              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Type your answer here..."
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <span className="text-gray-600 dark:text-gray-400">
            {Object.keys(answers).length}/{listeningTest.questions.length} questions answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0 || isSubmitting}
            className="bg-orange-600 dark:bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Listening Tips</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Before Listening:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Read all questions carefully</li>
              <li>• Predict possible answers</li>
              <li>• Use good quality headphones</li>
              <li>• Focus on keywords</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">While Listening:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Listen for specific information</li>
              <li>• Don't panic if you miss something</li>
              <li>• Write answers as you hear them</li>
              <li>• Pay attention to spelling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}