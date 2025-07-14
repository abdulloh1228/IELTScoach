import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, BookOpen, ArrowRight } from 'lucide-react';
import { testService } from '../lib/testService';
import { progressService } from '../lib/progressService';

type Page = 'dashboard' | 'exam-selector' | 'writing' | 'reading' | 'speaking' | 'listening' | 'progress' | 'profile';

interface ReadingPracticeProps {
  onNavigate: (page: Page) => void;
}

export default function ReadingPractice({ onNavigate }: ReadingPracticeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const passage = `
    The Rise of Renewable Energy

    The global transition to renewable energy sources has accelerated dramatically over the past decade. Solar and wind power, once considered alternative technologies, have now become mainstream solutions for electricity generation. This shift represents one of the most significant changes in the energy sector since the industrial revolution.

    Cost reduction has been a primary driver of this transformation. The price of solar panels has fallen by more than 80% since 2010, while wind turbine costs have decreased by approximately 50% over the same period. These dramatic price reductions have made renewable energy competitive with, and in many cases cheaper than, traditional fossil fuel sources.

    Technological advancement has also played a crucial role. Modern solar panels are significantly more efficient than their predecessors, converting a higher percentage of sunlight into electricity. Similarly, wind turbines have become larger and more sophisticated, capable of generating power even in low-wind conditions.

    Government policies worldwide have provided additional momentum. Many countries have implemented feed-in tariffs, tax incentives, and renewable energy mandates that encourage both individual and corporate adoption of clean energy technologies. The European Union has set ambitious targets to achieve carbon neutrality by 2050, while China has become the world's largest producer of solar panels and wind turbines.

    However, challenges remain. Energy storage technology, while improving, still needs further development to handle the intermittent nature of renewable sources. Grid infrastructure must also be upgraded to accommodate the distributed nature of renewable energy generation. Despite these obstacles, experts predict that renewable energy will comprise the majority of global electricity generation within the next two decades.
  `;

  const questions = [
    {
      id: 1,
      question: "What has been the primary driver of the transition to renewable energy?",
      options: [
        "Government policies",
        "Cost reduction",
        "Technological advancement",
        "Environmental concerns"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "By approximately what percentage have solar panel prices fallen since 2010?",
      options: [
        "50%",
        "60%",
        "70%",
        "80%"
      ],
      correct: 3
    },
    {
      id: 3,
      question: "According to the passage, what is a remaining challenge for renewable energy?",
      options: [
        "High costs",
        "Lack of government support",
        "Energy storage technology",
        "Public acceptance"
      ],
      correct: 2
    },
    {
      id: 4,
      question: "Which region has set targets for carbon neutrality by 2050?",
      options: [
        "United States",
        "China",
        "European Union",
        "Japan"
      ],
      correct: 2
    },
    {
      id: 5,
      question: "What do experts predict about renewable energy in the next two decades?",
      options: [
        "It will completely replace fossil fuels",
        "It will comprise the majority of global electricity generation",
        "Costs will continue to rise",
        "Technology will plateau"
      ],
      correct: 1
    }
  ];

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex.toString()
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create test session
      const session = await testService.createTestSession('reading');
      
      // Prepare correct answers
      const correctAnswers = {
        1: "1", // Cost reduction
        2: "3", // 80%
        3: "2", // Energy storage technology
        4: "2", // European Union
        5: "1", // It will comprise the majority of global electricity generation
      };
      
      // Submit reading response
      const response = await testService.submitReadingResponse({
        session_id: session.id,
        passage_id: 'renewable-energy-passage',
        answers,
        correct_answers: correctAnswers,
        total_questions: questions.length,
        time_taken: 3600 - timeLeft,
      });

      setResults(response);
      setShowResults(true);
      
      // Update user stats
      await progressService.incrementTestCompletion();
      await progressService.addStudyTime(60);
    } catch (error) {
      console.error('Error submitting reading test:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    if (!results) return null;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Reading Test Results</h1>
          <button 
            onClick={() => {setShowResults(false); setAnswers({}); setCurrentQuestion(0); setTimeLeft(3600);}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Another Test
          </button>
        </div>

        {/* Score Overview */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Your Reading Band Score</h2>
          <div className="text-6xl font-bold mb-4">{results.band_score}</div>
          <p className="text-green-100">{results.score} out of {results.total_questions} questions correct</p>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Analysis</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id] ? parseInt(answers[question.id]) : -1;
              const isCorrect = userAnswer === question.correct;
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {isCorrect ? (
                      <CheckCircle className="text-green-600 mt-1" size={20} />
                    ) : (
                      <XCircle className="text-red-600 mt-1" size={20} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">{question.question}</p>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Your answer:</span> {
                          userAnswer >= 0 ? question.options[userAnswer] : 'Not answered'
                        }</p>
                        <p><span className="font-medium">Correct answer:</span> {question.options[question.correct]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Improvement Strategies</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Time Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Spend max 20 minutes per passage</li>
                <li>• Skim first, then read for details</li>
                <li>• Don't get stuck on difficult questions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Reading Techniques</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look for keywords in questions</li>
                <li>• Practice scanning for specific information</li>
                <li>• Focus on topic sentences in paragraphs</li>
              </ul>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Reading Practice</h1>
          <p className="text-gray-600 mt-2">IELTS Academic Reading Test</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow border">
            <Clock className="text-blue-600" size={20} />
            <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={() => onNavigate('exam-selector')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Exams
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Passage */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Reading Passage</h2>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {passage}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <span className="text-sm text-gray-600">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800 mb-4">
                  {index + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionIndex}
                        checked={answers[question.id] === optionIndex.toString()}
                        onChange={() => handleAnswerSelect(question.id, optionIndex)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0 || loading}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[48px]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Submit Test</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}